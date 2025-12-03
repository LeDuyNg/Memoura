import { app, shell, BrowserWindow, ipcMain, dialog } from "electron";
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
  registerDBHandlers(ipcMain); 

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// --- File System Handlers ---

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

ipcMain.handle('rename-item', async (_, { oldPath, newPath }) => {
  try {
    await fs.promises.rename(oldPath, newPath);
    return { success: true };
  } catch (error) {
    console.error('Error renaming item:', error);
    return { success: false, error: error.message };
  }
})

// --- NEW: Export to PDF Handler ---
ipcMain.handle('export-to-pdf', async (_, { htmlContent, defaultFileName }) => {
  try {
    // 1. Open the Save Dialog
    const { filePath } = await dialog.showSaveDialog({
      title: 'Export to PDF',
      defaultPath: defaultFileName,
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
    });

    if (!filePath) return { success: false, canceled: true };

    // 2. Create a hidden window to render the HTML
    const pdfWindow = new BrowserWindow({ 
      show: false, 
      webPreferences: { nodeIntegration: true } 
    });

    // 3. Load the HTML content
    await pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

    // 4. Print to PDF
    const pdfData = await pdfWindow.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
    });

    // 5. Save the file
    await fs.promises.writeFile(filePath, pdfData);
    
    // 6. Cleanup
    pdfWindow.close();

    return { success: true, filePath };

  } catch (error) {
    console.error('Error exporting PDF:', error);
    return { success: false, error: error.message };
  }
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});