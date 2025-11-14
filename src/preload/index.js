import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from "@electron-toolkit/preload";

import { scanVault } from "./fileScanner.js";

// Custom APIs for renderer
const api = {
  scanVault: (vaultPath) => scanVault(vaultPath),
  getVaultPath: () => ipcRenderer.invoke('get-vault-path'),
  fetchCanvasData: (endpoint) => ipcRenderer.invoke('fetch-canvas-data', endpoint)
};


if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.api = api;
}