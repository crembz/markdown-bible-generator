import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as path from "path";
import { fetchTranslations } from "./api/client";
import { downloadTranslation, deriveBooks, BibleVerse } from "./api/downloader";
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

ipcMain.handle("bible:download", async (_event, slug: string, selectedBooks: number[]) => {
  const verses: BibleVerse[] = [];
  let totalBooks = selectedBooks.length;
  let currentBook = 0;

  try {
    const allData = await downloadTranslation(slug, (percent, status) => {
      mainWindow?.webContents.send("bible:progress", { percent, status });
    });

    mainWindow?.webContents.send("bible:progress", { percent: 70, status: "Formatting output..." });

    const books = deriveBooks(allData);
    const bookMap = new Map(books.map((b) => [b.id, b]));
    const filteredBooks = selectedBooks.filter((id) => bookMap.has(id));

    for (const bookId of filteredBooks) {
      const bookVerses = allData.filter((v) => v.book === bookId);
      verses.push(...bookVerses);
      currentBook++;
      const bookProgress = 70 + (currentBook / totalBooks) * 20;
      mainWindow?.webContents.send("bible:progress", {
        percent: bookProgress,
        status: `Processed ${bookId}: ${books.find((b) => b.id === bookId)?.name || "Unknown"} (${currentBook}/${totalBooks})`,
      });
    }

    mainWindow?.webContents.send("bible:progress", { percent: 95, status: "Writing files..." });

    return { success: true, verses };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle("file:save", async (_event, format: OutputFormat, verses: BibleVerse[], selectedBooks: number[], baseDir: string) => {
  const { content, filePaths, fileContents } = formatBible(verses, format, selectedBooks);
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
