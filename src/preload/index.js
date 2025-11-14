import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from "@electron-toolkit/preload";
import path from 'path';

import { scanVault } from "./fileScanner.js";

// Custom APIs for renderer
const api = {
  scanVault: (vaultPath) => scanVault(vaultPath),
  getVaultPath: () => ipcRenderer.invoke('get-vault-path'),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
  joinPath: (...paths) => path.join(...paths)
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