import { app, BrowserWindow, Tray, Menu, nativeImage, screen, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { getSettingsManager, type WindowMode } from "@electron/services/settings";

// Set userData path before app is ready to avoid cache permission issues
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const userDataPath = path.join(__dirname, "..", "..", ".c-dog-cache");
app.setPath("userData", userDataPath);

// Enforce single instance — if another instance is already running, focus it and quit this one
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

app.on("second-instance", () => {
  showMainWindow();
});

let win: BrowserWindow | null;
let tray: Tray | null = null;
let isQuitting = false;
let isSwitchingMode = false;
let currentWindowMode: WindowMode = "regular";

function minimizeToTray(target: BrowserWindow | null = win) {
  if (!target || target.isDestroyed()) {
    return;
  }
  target.hide();
}

function showMainWindow() {
  if (!win || win.isDestroyed()) {
    return;
  }
  if (win.isMinimized()) {
    win.restore();
  }
  win.show();
  win.focus();
}

function updateTrayMenu() {
  if (!tray) return;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: `Mode: ${currentWindowMode === "docked" ? "Docked" : "Regular"}`,
      enabled: false,
    },
    { type: "separator" },
    {
      label: "Toggle Mode",
      click: () => {
        const newMode = currentWindowMode === "docked" ? "regular" : "docked";
        console.log("Tray menu toggle clicked, switching to:", newMode);
        switchWindowMode(newMode);
      },
    },
    { type: "separator" },
    {
      label: "Show",
      enabled: !!win && !win.isVisible(),
      click: () => {
        showMainWindow();
      },
    },
    {
      label: "Minimize to Tray",
      enabled: !!win && win.isVisible(),
      click: () => {
        minimizeToTray();
      },
    },
    {
      label: "Quit",
      click: () => {
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);
}

// Add IPC handler for minimizing the window
ipcMain.handle("window.minimize", () => {
  if (!win || win.isDestroyed()) {
    return false;
  }
  minimizeToTray(win);
  return true;
});

function getWindowConfig(mode: WindowMode, vitePublic: string) {
  const baseConfig = {
    icon: path.join(vitePublic, "icon.png"),
    webPreferences: {
      preload: path.join(path.dirname(fileURLToPath(import.meta.url)), "preload.mjs"),
    },
  };

  if (mode === "docked") {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    return {
      ...baseConfig,
      width: 400,
      height: 600,
      x: width - 400 - 10,
      y: height - 600 - 10,
      resizable: false,
      movable: false,
      alwaysOnTop: true,
      frame: false,
      titleBarStyle: "hiddenInset" as const,
    };
  } else {
    return {
      ...baseConfig,
      width: 1500,
      height: 1000,
      resizable: true,
      movable: true,
      alwaysOnTop: false,
      frame: false,
      titleBarStyle: "hiddenInset" as const,
    };
  }
}

function createWindow() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  process.env.APP_ROOT = path.join(__dirname, "..");

  const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
  const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

  process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
    ? path.join(process.env.APP_ROOT, "public")
    : RENDERER_DIST;

  const windowConfig = getWindowConfig(currentWindowMode, process.env.VITE_PUBLIC);
  const startMinimized = process.argv.includes("--start-minimized");
  win = new BrowserWindow({ ...windowConfig, show: !startMinimized });

  // Create system tray
  if (!tray) {
    // Build paths to try, prioritizing PNG/ICO files for Windows compatibility
    const baseDir = path.join(__dirname, "..");
    const possibleIconPaths = [
      path.join(baseDir, "public", "icon.png"),
      path.join(RENDERER_DIST, "icon.png"),
    ];

    let iconPath: string | null = null;
    for (const tryPath of possibleIconPaths) {
      if (fs.existsSync(tryPath)) {
        iconPath = tryPath;
        console.log("Using tray icon from:", iconPath);
        break;
      }
    }

    if (iconPath) {
      try {
        const icon = nativeImage.createFromPath(iconPath);
        tray = new Tray(icon);
      } catch (error) {
        console.error("Failed to create tray with icon:", error);
        tray = null;
      }
    }

    // Fallback: create tray with a simple colored square icon
    if (!tray) {
      console.log("Creating tray with fallback icon");
      try {
        const fallbackIcon = nativeImage.createEmpty();
        // You can also try creating from a Buffer if needed
        // For now, we'll create an empty image and let Windows use default
        tray = new Tray(fallbackIcon);
      } catch (error) {
        console.error("Failed to create fallback tray:", error);
      }
    }

    if (!tray) {
      console.warn("Could not create system tray");
      return;
    }

    updateTrayMenu();
    tray.on("click", () => {
      if (!win || win.isDestroyed()) {
        return;
      }

      if (win.isVisible() && !win.isMinimized()) {
        minimizeToTray(win);
      } else {
        showMainWindow();
      }
    });
  }

  // Handle minimize to tray
  win.on("minimize", () => {
    // Defer to ensure the window state transition completes before hiding to tray.
    setTimeout(() => {
      minimizeToTray(win);
      updateTrayMenu();
    }, 0);
  });

  // Handle close to tray
  win.on("close", (event: Electron.Event) => {
    if (!isQuitting && !isSwitchingMode) {
      event.preventDefault();
      minimizeToTray(win);
      updateTrayMenu();
    }
  });

  // Keep tray menu state in sync with visibility.
  win.on("show", updateTrayMenu);
  win.on("hide", updateTrayMenu);

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
    // Notify renderer of current window mode
    win?.webContents.send("window:modeChanged", currentWindowMode);
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("before-quit", () => {
  isQuitting = true;
});

function switchWindowMode(newMode: WindowMode) {
  if (newMode === currentWindowMode) {
    console.log("Window mode already set to:", currentWindowMode);
    return;
  }

  console.log("Switching window mode from", currentWindowMode, "to", newMode);
  isSwitchingMode = true;
  currentWindowMode = newMode;
  getSettingsManager().setWindowMode(newMode);

  // Close current window gracefully
  if (win) {
    console.log("Closing current window for mode switch");
    const oldWin = win;
    win = null;

    // Use close() instead of destroy() for graceful shutdown
    oldWin.close();

    // Wait for the window to close before creating new one
    oldWin.once("closed", () => {
      console.log("Old window closed, creating new window with mode:", newMode);
      createWindow();
      isSwitchingMode = false;
      // Update tray menu after new window is created
      updateTrayMenu();
    });
  } else {
    // If no window exists, just create a new one
    console.log("No existing window, creating new window with mode:", newMode);
    createWindow();
    isSwitchingMode = false;
    updateTrayMenu();
  }
}

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Register all filesystem actions
// located in electron/actions/*.ts
// by importing them and calling them here.
import { registerHandlers } from "@util/ipc/register";
import services from "@electron/actions";

app.whenReady().then(async () => {
  // Load saved window mode preference
  currentWindowMode = getSettingsManager().getWindowMode();
  console.log("Loaded window mode preference:", currentWindowMode);

  // Sync Windows startup registry with stored launch-at-startup preference
  if (process.platform === "win32" && app.isPackaged) {
    const launchAtStartup = getSettingsManager().getLaunchAtStartup();
    const exePath = app.getPath("exe");
    const appName = app.getName();
    if (launchAtStartup) {
      spawnSync(
        "reg",
        ["add", "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run", "/v", appName, "/t", "REG_SZ", "/d", `"${exePath}" --start-minimized`, "/f"],
        { windowsHide: true }
      );
    } else {
      spawnSync(
        "reg",
        ["delete", "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run", "/v", appName, "/f"],
        { windowsHide: true }
      );
    }
  }

  // Register IPC listener for window mode changes from renderer
  ipcMain.on("window:switchMode", (_event, newMode: WindowMode) => {
    console.log("Received window:switchMode IPC event with mode:", newMode);
    switchWindowMode(newMode);
  });

  registerHandlers(services);
  createWindow();
});
