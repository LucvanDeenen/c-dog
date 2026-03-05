import { app, BrowserWindow, Tray, Menu, nativeImage } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

// Set userData path before app is ready to avoid cache permission issues
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const userDataPath = path.join(__dirname, "..", "..", ".c-dog-cache");
app.setPath("userData", userDataPath);

let win: BrowserWindow | null;
let tray: Tray | null = null;
let isQuitting = false;

function createWindow() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  process.env.APP_ROOT = path.join(__dirname, "..");

  const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
  const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
  // const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");

  process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
    ? path.join(process.env.APP_ROOT, "public")
    : RENDERER_DIST;

  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    height: 1000,
    width: 1500,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  // Create system tray
  if (!tray) {
    // Build paths to try, prioritizing PNG/ICO files for Windows compatibility
    const baseDir = path.join(__dirname, "..");
    const possibleIconPaths = [
      path.join(baseDir, "public", "tray-icon.jpg"),
      path.join(baseDir, "public", "electron-vite.png"),
      path.join(baseDir, "public", "electron-vite.ico"),
      path.join(RENDERER_DIST, "tray-icon.jpg"),
      path.join(RENDERER_DIST, "electron-vite.png"),
      path.join(RENDERER_DIST, "electron-vite.ico"),
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

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Show",
        click: () => {
          if (win) {
            win.show();
            win.focus();
          }
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
    tray.on("click", () => {
      if (win) {
        if (win.isVisible()) {
          win.hide();
        } else {
          win.show();
          win.focus();
        }
      }
    });
  }

  // Handle minimize to tray
  win.on("minimize", () => {
    win?.hide();
  });

  // Handle close to tray
  win.on("close", (event: Electron.Event) => {
    if (!isQuitting) {
      event.preventDefault();
      win?.hide();
    }
  });

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
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
  registerHandlers(services);
  createWindow();
});
