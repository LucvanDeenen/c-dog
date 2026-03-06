import { SettingsHandler } from "@electron/actions/settings";
import FileHandler from "@electron/actions/filesystem";
import type { Project } from "@electron/actions/filesystem";

/**
 * Interface definition of the contract for exposing all APIs.
 */
export default class Contract {
  fs: FileHandler = new FileHandler();
  settings: SettingsHandler = new SettingsHandler();
}

/**
 * Overridable class definition of all file system interactions.
 */
export class FileSystem {
  async listGitProjects(): Promise<Project[]> {
    return [];
  }
}
