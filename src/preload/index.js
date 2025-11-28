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
  joinPath: (...paths) => path.join(...paths),
  fetchCanvasData: (endpoint) => ipcRenderer.invoke('fetch-canvas-data', endpoint),
  generateFlashcards: (text, vaultPath, originalFilePath) => ipcRenderer.invoke('generate-flashcards', { text, vaultPath, originalFilePath }),
  summarizeText: (text, originalFilePath) => ipcRenderer.invoke('summarize-text', { text, originalFilePath }),
  deleteFile: (filePath) => ipcRenderer.invoke('delete-file', filePath),
  createFolder: (folderPath) => ipcRenderer.invoke('create-folder', folderPath),
  deleteFolder: (folderPath) => ipcRenderer.invoke('delete-folder', folderPath),

  // --- DB APIs ---
  getEvents: () => ipcRenderer.invoke('db-get-events'),
  addEvent: (eventData) => ipcRenderer.invoke('db-add-event', eventData),
  updateEvent: (eventData) => ipcRenderer.invoke('db-update-event', eventData), // <--- ADDED
  deleteEvent: (id) => ipcRenderer.invoke('db-delete-event', id),
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