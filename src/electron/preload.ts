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
    setPreferredEditor: (id: string) => ipcRenderer.invoke('settings.setPreferredEditor', [id]),
    getVersion: () => ipcRenderer.invoke('settings.getVersion', []),
  },
  fs: {
    listGitProjects: () => ipcRenderer.invoke('fs.listGitProjects', []),
    pickDirectory: () => ipcRenderer.invoke('fs.pickDirectory', []),
    getInstalledEditors: () => ipcRenderer.invoke('fs.getInstalledEditors', []),
    openEditor: (editorId?: string) => ipcRenderer.invoke('fs.openEditor', [editorId]),
    openTerminal: (cwd?: string) => ipcRenderer.invoke('fs.openTerminal', [cwd]),
    openInEditor: (projectPath: string, editorHint?: string) => ipcRenderer.invoke('fs.openInEditor', [projectPath, editorHint]),
    openFolder: (projectPath: string) => ipcRenderer.invoke('fs.openFolder', [projectPath]),
  },
  window: {
    minimize: () => ipcRenderer.invoke('window.minimize'),
  },
};

contextBridge.exposeInMainWorld(Constants.ELECTRON.API, api);
