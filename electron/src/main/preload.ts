const { contextBridge, ipcRenderer } = require("electron");

interface ProgressData {
  percent: number;
  status: string;
}

interface TranslationData {
  success: boolean;
  translations?: unknown[];
  error?: string;
}

interface SaveResult {
  success: boolean;
  paths?: string[];
}

interface DialogResult {
  canceled: boolean;
  path?: string;
}

const api = {
  fetchTranslations: (): Promise<TranslationData> => ipcRenderer.invoke("translations:fetch"),
  downloadBible: (slug: string, selectedBooks: number[]): Promise<TranslationData> =>
    ipcRenderer.invoke("bible:download", slug, selectedBooks),
  saveFiles: (format: string, verses: unknown[], selectedBooks: number[], baseDir: string): Promise<SaveResult> =>
    ipcRenderer.invoke("file:save", format, verses, selectedBooks, baseDir),
  showSaveDialog: (): Promise<DialogResult> => ipcRenderer.invoke("dialog:showSaveFolder"),
  onProgress: (cb: (data: ProgressData) => void): void =>
    ipcRenderer.on("bible:progress", (_event: unknown, data: ProgressData) => cb(data)),
  onTranslations: (cb: (data: TranslationData) => void): void =>
    ipcRenderer.on("translations:response", (_event: unknown, data: TranslationData) => cb(data)),
};

contextBridge.exposeInMainWorld("electronAPI", api);
