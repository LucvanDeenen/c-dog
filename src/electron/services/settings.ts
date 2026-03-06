import { app } from "electron";
import path from "node:path";
import fs from "node:fs";

export type WindowMode = "regular" | "docked";

export interface Settings {
  windowMode: WindowMode;
}

const DEFAULT_SETTINGS: Settings = {
  windowMode: "regular",
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
