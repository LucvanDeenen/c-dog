import { FileSystem } from "@electron/contracts/interfaces";
import { shell } from "electron";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export interface Project {
  name: string;
  path: string;
  branch?: string;
  group: string;
}

/**
 * {@inheritDoc}
 */
export default class FileHandler extends FileSystem {
    async openFolder(projectPath: string): Promise<boolean> {
      const result = await shell.openPath(projectPath);
      if (result) {
        console.error("Failed to open folder:", result);
        return false;
      }
      return true;
    }

    /**
     * Open a given path in the specified editor (default: vscode)
     * @param projectPath The path to open
     * @param editor The editor to use (e.g., 'vscode')
     */
    async openInEditor(projectPath: string, editor: string = "vscode"): Promise<boolean> {
      try {
        let command: string;
        switch (editor) {
          case "vscode":
          default:
            command = `code "${projectPath}"`;
            break;
        }
        const { exec } = await import("child_process");
        exec(command, (error) => {
          if (error) {
            console.error(`Failed to open in editor:`, error);
            return false;
          }
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
        projects.push({ name: entry.name, path: fullPath, branch, group });
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
      const reposPath = path.join(os.homedir(), "repos");

      if (!fs.existsSync(reposPath)) {
        console.log("Repos directory does not exist:", reposPath);
        return [];
      }

      const projects: Project[] = [];
      let rootEntries: fs.Dirent[];
      try {
        rootEntries = fs.readdirSync(reposPath, { withFileTypes: true });
      } catch {
        return [];
      }

      for (const entry of rootEntries) {
        if (!entry.isDirectory()) continue;
        const fullPath = path.join(reposPath, entry.name);
        if (fs.existsSync(path.join(fullPath, ".git"))) {
          // Direct repo in ~/repos → group "repos"
          let branch: string | undefined;
          try {
            const headContent = fs.readFileSync(path.join(fullPath, ".git", "HEAD"), "utf-8").trim();
            const match = headContent.match(/^ref: refs\/heads\/(.+)$/);
            branch = match ? match[1] : headContent.slice(0, 7);
          } catch {
            branch = undefined;
          }
          projects.push({ name: entry.name, path: fullPath, branch, group: "repos" });
        } else {
          // Subfolder (e.g. workspace) — recurse with its name as the group
          this.scanForGitProjects(fullPath, projects, entry.name);
        }
      }

      projects.sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));

      console.log(`Found ${projects.length} git projects in ~/repos`);
      return projects;
    } catch (error) {
      console.error("Error listing git projects:", error);
      return [];
    }
  }
}
