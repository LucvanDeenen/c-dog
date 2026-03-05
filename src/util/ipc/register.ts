import { ipcMain, ipcRenderer } from "electron";
import Contract from "@electron/contracts/interfaces";
import Constants from "@shared/constants";

/**
 * Export a function to register all handlers.
 * @param contract the to be exposed actions.
 */
export function registerHandlers(contract: Contract): void {
  for (const groupName of Object.keys(contract)) {
    const instance = (contract as any)[groupName];
    const proto = Object.getPrototypeOf(instance);

    for (const methodName of Object.getOwnPropertyNames(proto)) {
      if (methodName === Constants.METHODS.CONSTRUCTOR) continue;

      const channel = `${groupName}.${methodName}`;
      console.log(`[MAIN] Registering ${channel}`);

      ipcMain.handle(`${channel}`, (_, args) => instance[methodName](...args));
    }
  }
}

/**
 * Export a function to register all invokers.
 * @param contract the to be exposed actions.
 */
export function registerInvokers(contract: Contract): Record<string, any> {
  const api: Record<string, any> = {};

  for (const groupName of Object.keys(contract)) {
    const instance = (contract as any)[groupName];
    const proto = Object.getPrototypeOf(instance);

    api[groupName] = {};

    for (const methodName of Object.getOwnPropertyNames(proto)) {
      if (methodName === Constants.METHODS.CONSTRUCTOR) continue;

      const channel = `${groupName}.${methodName}`;
      console.log(`[PRELOAD] Registering ${channel}`);

      api[groupName][methodName] = (...args: any[]) => {
        return ipcRenderer.invoke(`${channel}`, args);
      };
    }
  }

  return api;
}
