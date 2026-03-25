import { app } from "electron";
import { spawnSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

const STARTUP_REG_KEY = "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run";

function applyWindowsStartup(appName: string, exePath: string, enable: boolean): void {
  if (!enable) {
    spawnSync("reg", ["delete", STARTUP_REG_KEY, "/v", appName, "/f"], { windowsHide: true });
  } else {
    spawnSync(
      "reg",
      ["add", STARTUP_REG_KEY, "/v", appName, "/t", "REG_SZ", "/d", `"${exePath}" --start-minimized`, "/f"],
      { windowsHide: true }
    );
  }
}

export type WindowMode = "regular" | "docked";

export interface Settings {
  windowMode: WindowMode;
  launchAtStartup: boolean;
  repoPaths: string[];
}

const DEFAULT_SETTINGS: Settings = {
  windowMode: "regular",
  launchAtStartup: false,
  repoPaths: ["~/repos"],
};

export class SettingsManager {
  private settingsPath: string;
  private settings: Settings;

  constructor() {
    const userDataPath = app.getPath("userData");
    this.settingsPath = path.join(userDataPath, "settings.json");
    this.settings = this.loadSettings();
  }

  private loadSettings(): Settings {
    try {
      if (fs.existsSync(this.settingsPath)) {
        const fileContent = fs.readFileSync(this.settingsPath, "utf-8");
        const parsedSettings = JSON.parse(fileContent);
        // Migrate old single reposPath string to repoPaths array
        if (parsedSettings.reposPath && !parsedSettings.repoPaths) {
          parsedSettings.repoPaths = [parsedSettings.reposPath];
          delete parsedSettings.reposPath;
        }
        // Merge with defaults to handle missing keys
        return { ...DEFAULT_SETTINGS, ...parsedSettings };
      }
    } catch (error) {
      console.error("Failed to load settings, using defaults:", error);
    }
    return DEFAULT_SETTINGS;
  }

  private saveSettings(): void {
    try {
      const userDataPath = app.getPath("userData");
      // Ensure directory exists
      if (!fs.existsSync(userDataPath)) {
        fs.mkdirSync(userDataPath, { recursive: true });
      }
      fs.writeFileSync(
        this.settingsPath,
        JSON.stringify(this.settings, null, 2)
      );
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }

  getSettings(): Settings {
    return { ...this.settings };
  }

  getWindowMode(): WindowMode {
    return this.settings.windowMode;
  }

  setWindowMode(mode: WindowMode): void {
    this.settings.windowMode = mode;
    this.saveSettings();
  }

  getLaunchAtStartup(): boolean {
    return this.settings.launchAtStartup;
  }

  setRepoPaths(value: string[]): void {
    this.settings.repoPaths = value;
    this.saveSettings();
  }

  setLaunchAtStartup(value: boolean): void {
    this.settings.launchAtStartup = value;
    this.saveSettings();
    if (process.platform === "win32" && app.isPackaged) {
      applyWindowsStartup(app.getName(), app.getPath("exe"), value);
    }
  }

  updateSetting<K extends keyof Settings>(key: K, value: Settings[K]): void {
    this.settings[key] = value;
    this.saveSettings();
  }
}

// Singleton instance
let settingsManager: SettingsManager | null = null;

export function getSettingsManager(): SettingsManager {
  if (!settingsManager) {
    settingsManager = new SettingsManager();
  }
  return settingsManager;
}
