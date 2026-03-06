import { contextBridge, ipcRenderer } from "electron";
import Constants from "@shared/constants";

// Expose IPC methods directly
contextBridge.exposeInMainWorld(Constants.ELECTRON.IPC, {
  on: ipcRenderer.on.bind(ipcRenderer),
  off: ipcRenderer.off.bind(ipcRenderer),
  send: ipcRenderer.send.bind(ipcRenderer),
});

// Expose API methods as IPC invokers
// DO NOT instantiate actual handlers here - this would bundle Node.js code into the preload!
// Instead, create proxy functions that call ipcRenderer.invoke
const api = {
  settings: {
    getSettings: () => ipcRenderer.invoke('settings.getSettings', []),
    getWindowMode: () => ipcRenderer.invoke('settings.getWindowMode', []),
    setWindowMode: (mode: string) => ipcRenderer.invoke('settings.setWindowMode', [mode]),
  },
  fs: {
    // Add file system methods here if needed
  },
};

contextBridge.exposeInMainWorld(Constants.ELECTRON.API, api);
