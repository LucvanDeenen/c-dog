import { FileSystem } from "@electron/contracts/interfaces";
import { shell } from "electron";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export interface Project {
  name: string;
  path: string;
  branch?: string;
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
   * List all directories in ~/repos that contain a .git folder (git repositories)
   */
  async listGitProjects(): Promise<Project[]> {
    try {
      const reposPath = path.join(os.homedir(), "repos");
      
      // Check if repos directory exists
      if (!fs.existsSync(reposPath)) {
        console.log("Repos directory does not exist:", reposPath);
        return [];
      }

      const entries = fs.readdirSync(reposPath, { withFileTypes: true });
      const projects: Project[] = [];

      for (const entry of entries) {
        // Only check directories
        if (entry.isDirectory()) {
          const gitPath = path.join(reposPath, entry.name, ".git");
          // Check if .git folder exists
          if (fs.existsSync(gitPath)) {
            let branch: string | undefined;
            try {
              const headContent = fs.readFileSync(path.join(gitPath, "HEAD"), "utf-8").trim();
              const match = headContent.match(/^ref: refs\/heads\/(.+)$/);
              branch = match ? match[1] : headContent.slice(0, 7);
            } catch {
              branch = undefined;
            }
            projects.push({
              name: entry.name,
              path: path.join(reposPath, entry.name),
              branch,
            });
          }
        }
      }

      // Sort by name
      projects.sort((a, b) => a.name.localeCompare(b.name));
      
      console.log(`Found ${projects.length} git projects in ~/repos`, projects);
      return projects;
    } catch (error) {
      console.error("Error listing git projects:", error);
      return [];
    }
  }
}
