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
    getLaunchAtStartup: () => ipcRenderer.invoke('settings.getLaunchAtStartup', []),
    setLaunchAtStartup: (value: boolean) => ipcRenderer.invoke('settings.setLaunchAtStartup', [value]),
    setRepoPaths: (value: string[]) => ipcRenderer.invoke('settings.setRepoPaths', [value]),
    getVersion: () => ipcRenderer.invoke('settings.getVersion', []),
  },
  fs: {
    listGitProjects: () => ipcRenderer.invoke('fs.listGitProjects', []),
    pickDirectory: () => ipcRenderer.invoke('fs.pickDirectory', []),
    openInEditor: (projectPath: string, editor: string = "vscode") => ipcRenderer.invoke('fs.openInEditor', [projectPath, editor]),
    openFolder: (projectPath: string) => ipcRenderer.invoke('fs.openFolder', [projectPath]),
  },
  window: {
    minimize: () => ipcRenderer.invoke('window.minimize'),
  },
};

contextBridge.exposeInMainWorld(Constants.ELECTRON.API, api);
