import { app, shell, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import path from 'path';
import fs from 'fs';
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import dotenv from 'dotenv';

dotenv.config({ path: path.join(app.getAppPath(), '.env') })

import { registerCanvasHandler } from '../preload/canvasHandler.js'
import { registerAIHandler } from '../preload/aiHandler.js'
import { registerDBHandlers } from '../preload/dbHandler.js'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.electron");

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.on("ping", () => console.log("pong"));

  createWindow();

  // --- REGISTER HANDLERS ---
  registerCanvasHandler(ipcMain);
  registerAIHandler(ipcMain);
  registerDBHandlers(ipcMain); // <--- REGISTER HERE

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// ... (Rest of your existing handlers for read/write/delete file/folder) ...
ipcMain.handle('get-vault-path', () => {
  const rootPath = app.getAppPath()
  const vaultPath = path.join(rootPath, 'Notes')
  return vaultPath
})

ipcMain.handle('read-file', async (_, filePath) => {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return { success: true, content };
  } catch (error) {
    console.error('Error reading file:', error);
    return { success: false, error: error.message };
  }
})

ipcMain.handle('write-file', async (_, filePath, content) => {
  try {
    await fs.promises.writeFile(filePath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('Error writing file:', error);
    return { success: false, error: error.message };
  }
})

ipcMain.handle('delete-file', async (_, filePath) => {
  try {
    await fs.promises.unlink(filePath);
    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { success: false, error: error.message };
  }
})

ipcMain.handle('create-folder', async (_, folderPath) => {
  try {
    await fs.promises.mkdir(folderPath, { recursive: true });
    return { success: true };
  } catch (error) {
    console.error('Error creating folder:', error);
    return { success: false, error: error.message };
  }
})

ipcMain.handle('delete-folder', async (_, folderPath) => {
  try {
    await fs.promises.rm(folderPath, { recursive: true, force: true });
    return { success: true };
  } catch (error) {
    console.error('Error deleting folder:', error);
    return { success: false, error: error.message };
  }
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});