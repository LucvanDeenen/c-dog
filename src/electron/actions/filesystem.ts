import { FileSystem } from "@electron/contracts/interfaces";
import { shell, dialog, BrowserWindow } from "electron";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";

export interface EditorInfo {
  id: string;
  name: string;
}

const EDITOR_CANDIDATES: (EditorInfo & { command: string })[] = [
  { id: "vscode",    name: "Visual Studio Code", command: "code"       },
  { id: "cursor",    name: "Cursor",              command: "cursor"     },
  { id: "webstorm",  name: "WebStorm",            command: "webstorm"   },
  { id: "idea",      name: "IntelliJ IDEA",       command: "idea"       },
  { id: "sublime",   name: "Sublime Text",        command: "subl"       },
  { id: "zed",       name: "Zed",                 command: "zed"        },
];

const EDITOR_COMMAND_MAP: Record<string, string> = Object.fromEntries(
  EDITOR_CANDIDATES.map((e) => [e.id, e.command])
);

const JETBRAINS_IDS = ["webstorm", "idea", "goland", "pycharm", "clion", "rider"];

function detectEditorHint(projectPath: string): string | undefined {
  try {
    const entries = fs.readdirSync(projectPath);
    if (entries.some((e) => e.endsWith(".code-workspace"))) return "vscode";
    if (entries.includes(".vscode")) return "vscode";
    if (entries.includes(".idea")) return "jetbrains";
  } catch {
    // ignore unreadable dirs
  }
  return undefined;
}

function resolveEditorId(hint: string | undefined, fallback: string): string {
  if (!hint || hint === fallback) return fallback;
  if (hint === "jetbrains") {
    const which = process.platform === "win32" ? "where" : "which";
    for (const id of JETBRAINS_IDS) {
      const cmd = EDITOR_COMMAND_MAP[id];
      if (cmd && spawnSync(which, [cmd], { windowsHide: true }).status === 0) return id;
    }
    return fallback;
  }
  return hint;
}

export interface Project {
  name: string;
  path: string;
  branch?: string;
  group: string;
  editorHint?: string;
}

/**
 * {@inheritDoc}
 */
export default class FileHandler extends FileSystem {
    async pickDirectory(): Promise<string | null> {
      const focusedWindow = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
      const result = await dialog.showOpenDialog(focusedWindow, {
        properties: ["openDirectory"],
      });
      return result.canceled ? null : result.filePaths[0].replace(/\\/g, "/");
    }

    async openFolder(projectPath: string): Promise<boolean> {
      const result = await shell.openPath(projectPath);
      if (result) {
        console.error("Failed to open folder:", result);
        return false;
      }
      return true;
    }

    async openTerminal(cwd?: string): Promise<boolean> {
      try {
        const workingDir = cwd ?? os.homedir();
        const { exec } = await import("child_process");

        if (process.platform === "win32") {
          const gitBashPaths = [
            "C:\\Program Files\\Git\\git-bash.exe",
            "C:\\Program Files (x86)\\Git\\git-bash.exe",
          ];
          const gitBash = gitBashPaths.find((p) => fs.existsSync(p));
          if (gitBash) {
            exec(`"${gitBash}" --cd="${workingDir}"`);
            return true;
          }
          // Fall back to Windows Terminal, then cmd
          const wtCheck = spawnSync("where", ["wt"], { windowsHide: true });
          if (wtCheck.status === 0) {
            exec(`wt -d "${workingDir}"`);
          } else {
            exec(`start cmd`, { shell: true });
          }
          return true;
        }

        // macOS
        if (process.platform === "darwin") {
          exec(`open -a Terminal "${workingDir}"`);
          return true;
        }

        // Linux
        exec(`x-terminal-emulator`);
        return true;
      } catch (error) {
        console.error("Error opening terminal:", error);
        return false;
      }
    }

    async openEditor(editorId?: string): Promise<boolean> {
      try {
        const { getSettingsManager } = await import("@electron/services/settings");
        const preferred = getSettingsManager().getSettings().preferredEditor ?? "vscode";
        const id = editorId ?? preferred;
        const cliCommand = EDITOR_COMMAND_MAP[id] ?? id;
        const { exec } = await import("child_process");
        exec(cliCommand, (error) => {
          if (error) console.error("Failed to open editor:", error);
        });
        return true;
      } catch (error) {
        console.error("Error opening editor:", error);
        return false;
      }
    }

    async getInstalledEditors(): Promise<EditorInfo[]> {
      const which = process.platform === "win32" ? "where" : "which";
      return EDITOR_CANDIDATES.filter((editor) => {
        const result = spawnSync(which, [editor.command], { windowsHide: true });
        return result.status === 0;
      }).map(({ id, name }) => ({ id, name }));
    }

    async openInEditor(projectPath: string, editorHint?: string): Promise<boolean> {
      try {
        const { getSettingsManager } = await import("@electron/services/settings");
        const preferred = getSettingsManager().getSettings().preferredEditor ?? "vscode";
        const editorId = resolveEditorId(editorHint, preferred);
        const cliCommand = EDITOR_COMMAND_MAP[editorId] ?? editorId;

        // For VS Code, prefer opening a .code-workspace file if one exists
        let target = projectPath;
        if (editorId === "vscode") {
          try {
            const workspaceFile = fs.readdirSync(projectPath).find((e) => e.endsWith(".code-workspace"));
            if (workspaceFile) target = path.join(projectPath, workspaceFile);
          } catch { /* ignore */ }
        }

        const { exec } = await import("child_process");
        exec(`${cliCommand} "${target}"`, (error) => {
          if (error) console.error(`Failed to open in editor:`, error);
        });
        return true;
      } catch (error) {
        console.error("Error opening in editor:", error);
        return false;
      }
    }
  /**
   * Recursively scan a directory for git repositories (folders containing .git).
   * Stops descending into a directory once a .git folder is found.
   */
  private scanForGitProjects(dir: string, projects: Project[], group: string): void {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const fullPath = path.join(dir, entry.name);
      const gitPath = path.join(fullPath, ".git");

      if (fs.existsSync(gitPath)) {
        let branch: string | undefined;
        try {
          const headContent = fs.readFileSync(path.join(gitPath, "HEAD"), "utf-8").trim();
          const match = headContent.match(/^ref: refs\/heads\/(.+)$/);
          branch = match ? match[1] : headContent.slice(0, 7);
        } catch {
          branch = undefined;
        }
        projects.push({ name: entry.name, path: fullPath, branch, group, editorHint: detectEditorHint(fullPath) });
      } else {
        // Not a git repo itself — recurse into it, group stays the same
        this.scanForGitProjects(fullPath, projects, group);
      }
    }
  }

  /**
   * List all git repositories under ~/repos, including nested ones.
   * Projects directly in ~/repos are grouped as "repos"; projects inside a
   * subfolder (e.g. ~/repos/workspace/…) are grouped by that subfolder's name.
   */
  async listGitProjects(): Promise<Project[]> {
    try {
      const { getSettingsManager } = await import("@electron/services/settings");
      const rawRepoPaths = getSettingsManager().getSettings().repoPaths;

      const projects: Project[] = [];

      for (const rawPath of rawRepoPaths) {
        const reposPath = rawPath.startsWith("~")
          ? path.join(os.homedir(), rawPath.slice(1))
          : rawPath;

        if (!fs.existsSync(reposPath)) {
          console.log("Repos directory does not exist:", reposPath);
          continue;
        }

        let rootEntries: fs.Dirent[];
        try {
          rootEntries = fs.readdirSync(reposPath, { withFileTypes: true });
        } catch {
          continue;
        }

        const rootGroup = path.basename(reposPath);

        for (const entry of rootEntries) {
          if (!entry.isDirectory()) continue;
          const fullPath = path.join(reposPath, entry.name);
          if (fs.existsSync(path.join(fullPath, ".git"))) {
            let branch: string | undefined;
            try {
              const headContent = fs.readFileSync(path.join(fullPath, ".git", "HEAD"), "utf-8").trim();
              const match = headContent.match(/^ref: refs\/heads\/(.+)$/);
              branch = match ? match[1] : headContent.slice(0, 7);
            } catch {
              branch = undefined;
            }
            projects.push({ name: entry.name, path: fullPath, branch, group: rootGroup, editorHint: detectEditorHint(fullPath) });
          } else {
            this.scanForGitProjects(fullPath, projects, entry.name);
          }
        }
      }

      projects.sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));

      console.log(`Found ${projects.length} git projects across ${rawRepoPaths.length} path(s)`);
      return projects;
    } catch (error) {
      console.error("Error listing git projects:", error);
      return [];
    }
  }
}
