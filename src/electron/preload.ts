import { contextBridge, ipcRenderer } from "electron";
import Constants from "@shared/constants";


// Optional: expose ipc event helpers (same as before)
contextBridge.exposeInMainWorld(Constants.ELECTRON.IPC, {
  on: ipcRenderer.on.bind(ipcRenderer),
  off: ipcRenderer.off.bind(ipcRenderer),
  send: ipcRenderer.send.bind(ipcRenderer),
});

import { registerInvokers } from "@util/ipc/register";
import Contract from "@electron/contracts/interfaces";


// Create a lightweight contract object with just the method names
// Don't instantiate actual implementations to avoid bundling node:fs
const api = registerInvokers(new Contract()) ?? {};

// Expose the full automatically-generated API
contextBridge.exposeInMainWorld(Constants.ELECTRON.API, api);
