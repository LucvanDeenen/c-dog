import { app } from "electron";
import {
  getSettingsManager,
  type WindowMode,
  type Settings,
} from "@electron/services/settings";

export class SettingsHandler {
  getSettings(): Settings {
    return getSettingsManager().getSettings();
  }

  getVersion(): string {
    return app.isPackaged ? app.getVersion() : `${app.getVersion()}-dev`;
  }

  getWindowMode(): WindowMode {
    return getSettingsManager().getWindowMode();
  }

  setWindowMode(mode: WindowMode): void {
    getSettingsManager().setWindowMode(mode);
  }

  getLaunchAtStartup(): boolean {
    return getSettingsManager().getLaunchAtStartup();
  }

  setLaunchAtStartup(value: boolean): void {
    getSettingsManager().setLaunchAtStartup(value);
  }

  setRepoPaths(value: string[]): void {
    getSettingsManager().setRepoPaths(value);
  }
}
