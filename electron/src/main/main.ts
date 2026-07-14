import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as path from "path";
import { fetchTranslations } from "./api/client";
import { downloadTranslation, BibleVerse } from "./api/downloader";
import { formatBible, OutputFormat } from "./formatter";
import { writeOutput } from "./file-writer";

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile(path.join(__dirname, "..", "renderer", "index.html"));
}

ipcMain.handle("translations:fetch", async () => {
  try {
    const translations = await fetchTranslations();
    return { success: true, translations };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle("bible:download", async (_event, slug: string) => {
  const verses: BibleVerse[] = [];

  try {
    const allData = await downloadTranslation(slug, (percent, status) => {
      mainWindow?.webContents.send("bible:progress", { percent, status });
    });

    verses.push(...allData);

    mainWindow?.webContents.send("bible:progress", { percent: 95, status: "Writing files..." });

    return { success: true, verses, translationName: slug };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle("file:save", async (_event, format: OutputFormat, verses: BibleVerse[], baseDir: string, translationName: string) => {
  const { content, filePaths, fileContents } = formatBible(verses, format, translationName);
  const written = await writeOutput(content, filePaths, baseDir, fileContents);
  return { success: true, paths: written };
});

ipcMain.handle("dialog:showSaveFolder", async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ["openDirectory"],
  });
  if (result.canceled || !result.filePaths.length) {
    return { canceled: true };
  }
  return { canceled: false, path: result.filePaths[0] };
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
