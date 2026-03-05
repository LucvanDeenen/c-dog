/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string;
    /** /dist/ or /public/ */
    VITE_PUBLIC: string;
  }
}

import type { IpcRenderer } from "electron";
import type services from "@electron/actions";

type ActionGroups = typeof services;

// Automatically derive the shape of window.api from your actions:
// window.api.fs.selectFolder(...args) -> Promise<ReturnType<typeof fs.selectFolder>>
type ElectronAPI = {
  [G in keyof ActionGroups]: {
    [M in keyof ActionGroups[G]]: ActionGroups[G][M] extends (
      ...args: any[]
    ) => any
      ? (
          ...args: Parameters<ActionGroups[G][M]>
        ) => Promise<Awaited<ReturnType<ActionGroups[G][M]>>>
      : never;
  };
};

declare global {
  interface Window {
    // Matches what you expose in preload:
    // contextBridge.exposeInMainWorld("ipc", { on, off, send })
    ipc: {
      on: IpcRenderer["on"];
      off: IpcRenderer["off"];
      send: IpcRenderer["send"];
    };

    // Auto-typed API e.g.:
    // window.api.fs.selectFolder()
    // window.api.fs.fetchFiles(...)
    // window.api.builder.someMethod()
    api: ElectronAPI;
  }
}
export {};
