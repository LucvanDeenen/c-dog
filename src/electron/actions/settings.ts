import { getSettingsManager, type WindowMode, type Settings } from "@electron/services/settings";

export class SettingsHandler {
  getSettings(): Settings {
    return getSettingsManager().getSettings();
  }

  getWindowMode(): WindowMode {
    return getSettingsManager().getWindowMode();
  }

  setWindowMode(mode: WindowMode): void {
    getSettingsManager().setWindowMode(mode);
  }
}
