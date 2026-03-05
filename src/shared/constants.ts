export default class Constants {
  static readonly EMPTY_STRING = "";
  static readonly DEFAULT_UTF = "utf-8";
  static readonly NAME = "name";

  static readonly METHODS = {
    CONSTRUCTOR: "constructor",
  };

  static readonly ELECTRON = {
    IPC: "ipc",
    API: "api",
  };

  static readonly STORE = {
    FILES: "files",
  };

  /**
   * Application settings persisted on disk. Currently only the `firstRun` flag.
   */
  static readonly SETTINGS_FILE = "settings.json";
  static readonly SETTINGS = {
    FIRST_RUN: "firstRun",
  };

  static readonly ROUTES = {
    HOME: "/",
    ONBOARDING: "/onboarding",
  };
}
