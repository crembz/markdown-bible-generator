const BOOK_NAMES = {
  1: "Genesis", 2: "Exodus", 3: "Leviticus", 4: "Numbers", 5: "Deuteronomy",
  6: "Joshua", 7: "Judges", 8: "Ruth", 9: "1_Samuel", 10: "2_Samuel",
  11: "1_Kings", 12: "2_Kings", 13: "1_Chronicles", 14: "2_Chronicles",
  15: "Ezra", 16: "Nehemiah", 17: "Esther", 18: "Job", 19: "Psalms",
  20: "Proverbs", 21: "Ecclesiastes", 22: "Song of Solomon", 23: "Isaiah",
  24: "Jeremiah", 25: "Lamentations", 26: "Ezekiel", 27: "Daniel", 28: "Hosea",
  29: "Joel", 30: "Amos", 31: "Obadiah", 32: "Jonah", 33: "Micah", 34: "Nahum",
  35: "Habakkuk", 36: "Zephaniah", 37: "Haggai", 38: "Zechariah", 39: "Malachi",
  40: "Matthew", 41: "Mark", 42: "Luke", 43: "John", 44: "Acts", 45: "Romans",
  46: "1_Corinthians", 47: "2_Corinthians", 48: "Galatians", 49: "Ephesians",
  50: "Philippians", 51: "Colossians", 52: "1_Thessalonians", 53: "2_Thessalonians",
  54: "1_Timothy", 55: "2_Timothy", 56: "Titus", 57: "Philemon", 58: "Hebrews",
  59: "James", 60: "1_Peter", 61: "2_Peter", 62: "1_John", 63: "2_John",
  64: "3_John", 65: "Jude", 66: "Revelation",
  67: "Tobit", 68: "Judith", 69: "1_Maccabees", 70: "2_Maccabees",
  71: "Wisdom", 72: "Sirach", 73: "Baruch", 74: "Song_of_the_Three_Children",
  75: "Prayer_of_Azariah", 76: "Susanna", 77: "Bel_and_the_Dragon",
  78: "1_Ezra", 79: "2_Ezra", 80: "Prayer_of_Manasseh", 81: "Psalm_151",
  82: "1_Maccabees_Appendix", 83: "2_Maccabees_Appendix", 84: "3_Maccabees",
  85: "4_Maccabees", 86: "Psalm_152", 87: "Psalm_153", 88: "Psalm_154",
};

function getSelectedBooks() {
  const checkboxes = document.querySelectorAll("#book-grid input[type='checkbox']:checked");
  return Array.from(checkboxes).map((cb) => parseInt(cb.value, 10));
}

function htmlToMarkdown(html) {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function formatBible(verses, format, selectedBooks) {
  const bookData = {};

  for (const verse of verses) {
    if (selectedBooks && !selectedBooks.includes(verse.book)) continue;
    if (!bookData[verse.book]) bookData[verse.book] = {};
    if (!bookData[verse.book][verse.chapter]) bookData[verse.book][verse.chapter] = [];
    const name = BOOK_NAMES[verse.book] || verse.book_name;
    bookData[verse.book][verse.chapter].push(`${verse.verse} ${htmlToMarkdown(verse.text)}`);
  }

  const filePaths = [];

  if (format === "single") {
    let content = "";
    for (const bookId of Object.keys(bookData).map(Number).sort((a, b) => a - b)) {
      const name = BOOK_NAMES[bookId] || "Unknown";
      content += `# ${name}\n\n`;
      for (const chapterId of Object.keys(bookData[bookId]).map(Number).sort((a, b) => a - b)) {
        content += `## Chapter ${chapterId}\n\n`;
        content += bookData[bookId][chapterId].join("\n\n") + "\n\n";
      }
    }
    filePaths.push("bible.md");
    return { content, filePaths };
  }

  if (format === "book") {
    const bookContents = [];
    for (const bookId of Object.keys(bookData).map(Number).sort((a, b) => a - b)) {
      const name = BOOK_NAMES[bookId] || "Unknown";
      const padded = String(bookId).padStart(2, "0");
      let content = "";
      for (const chapterId of Object.keys(bookData[bookId]).map(Number).sort((a, b) => a - b)) {
        content += `## Chapter ${chapterId}\n\n`;
        content += bookData[bookId][chapterId].join("\n\n") + "\n\n";
      }
      filePaths.push(`${padded}_${name}.md`);
      bookContents.push(content);
    }
    const mergedContent = bookContents.join("\n\n---\n\n");
    return { content: mergedContent, filePaths };
  }

  if (format === "chapter") {
    const chapterContents = [];
    for (const bookId of Object.keys(bookData).map(Number).sort((a, b) => a - b)) {
      const bookName = BOOK_NAMES[bookId] || "Unknown";
      const paddedBook = String(bookId).padStart(2, "0");
      const bookDir = `${paddedBook}_${bookName}`;
      for (const chapterId of Object.keys(bookData[bookId]).map(Number).sort((a, b) => a - b)) {
        let content = `# ${bookName} - Chapter ${chapterId}\n\n`;
        content += bookData[bookId][chapterId].join("\n\n") + "\n\n";
        const padded = String(chapterId).padStart(2, "0");
        filePaths.push(`${bookDir}/${padded}_${bookName}_${padded}.md`);
        chapterContents.push(content);
      }
    }
    const allContent = chapterContents.join("\n");
    return { content: allContent, filePaths };
  }

  if (format === "verse") {
    for (const bookId of Object.keys(bookData).map(Number).sort((a, b) => a - b)) {
      const bookName = BOOK_NAMES[bookId] || "Unknown";
      const paddedBook = String(bookId).padStart(2, "0");
      const bookDir = `${paddedBook}_${bookName}`;
      for (const chapterId of Object.keys(bookData[bookId]).map(Number).sort((a, b) => a - b)) {
        const paddedChapter = String(chapterId).padStart(2, "0");
        for (const verseLine of bookData[bookId][chapterId]) {
          const verseNum = parseInt(verseLine.split(" ")[0], 10);
          const paddedVerse = String(verseNum).padStart(2, "0");
          const fileName = `${paddedBook}_${bookName}_${paddedChapter}_${paddedVerse}.md`;
          filePaths.push(`${bookDir}/${paddedChapter}/${fileName}`);
        }
      }
    }
    return { content: "", filePaths };
  }

  return { content: "", filePaths: [] };
}

let selectedTranslation = null;
let downloadedVerses = [];
let downloadedFilePaths = [];

const fetchBtn = document.getElementById("fetch-btn");
const translationSelect = document.getElementById("translation-select");
const downloadBtn = document.getElementById("download-btn");
const saveBtn = document.getElementById("save-btn");
const formatSelect = document.getElementById("format-select");
const progressSection = document.getElementById("progress-section");
const progressFill = document.getElementById("progress-fill");
const progressText = document.getElementById("progress-text");
const resultSection = document.getElementById("result-section");
const resultContent = document.getElementById("result-content");
const bookGrid = document.getElementById("book-grid");

async function fetchTranslations() {
  fetchBtn.disabled = true;
  fetchBtn.textContent = "Fetching...";
  translationSelect.disabled = true;

  try {
    if (!window.electronAPI) {
      translationSelect.innerHTML = '<option value="">Error: API not available</option>';
      return;
    }
    const result = await window.electronAPI.fetchTranslations();
    translationSelect.innerHTML = "";

    if (!result.success) {
      translationSelect.innerHTML = '<option value="">Error: ' + result.error + '</option>';
      translationSelect.disabled = false;
      return;
    }

    const translations = result.translations;
    for (const lang of translations) {
      const optgroup = document.createElement("optgroup");
      optgroup.label = lang.language;
      for (const t of lang.translations) {
        const option = document.createElement("option");
        option.value = t.short_name;
        option.textContent = t.full_name || t.short_name;
        optgroup.appendChild(option);
      }
      translationSelect.appendChild(optgroup);
    }

    translationSelect.disabled = false;
  } catch (err) {
    translationSelect.innerHTML = '<option value="">Error: ' + err.message + '</option>';
    translationSelect.disabled = false;
  } finally {
    fetchBtn.disabled = false;
    fetchBtn.textContent = "Fetch Translations";
  }
}

function updateDownloadButton() {
  downloadBtn.disabled = !selectedTranslation || getSelectedBooks().length === 0;
}

async function downloadBible() {
  const books = getSelectedBooks();
  if (!selectedTranslation || books.length === 0) return;

  progressSection.style.display = "block";
  resultSection.style.display = "none";
  downloadBtn.disabled = true;
  progressFill.style.width = "0%";
  progressFill.style.background = "linear-gradient(90deg, #4a90d9, #27ae60)";

  downloadedVerses = [];

  const result = await window.electronAPI.downloadBible(selectedTranslation, books);

  if (!result.success) {
    progressText.textContent = "Error: " + result.error;
    progressFill.style.width = "100%";
    progressFill.style.background = "#e74c3c";
    downloadBtn.disabled = false;
    return;
  }

  downloadedVerses = result.verses;
  downloadedFilePaths = [];

  const format = formatSelect.value;
  const { content, filePaths } = formatBible(downloadedVerses, format, books);
  downloadedFilePaths = filePaths;

  progressFill.style.width = "100%";
  progressFill.style.background = "#27ae60";
  progressText.textContent = "Download complete!";

  resultContent.textContent = "Generated " + filePaths.length + " file(s). Click 'Save to Folder' to choose where to save.";
  resultSection.style.display = "block";
}

async function saveFiles() {
  if (downloadedFilePaths.length === 0) return;

  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";

  try {
    const dialog = await window.electronAPI.showSaveDialog();
    if (dialog.canceled) return;

    const format = formatSelect.value;
    const result = await window.electronAPI.saveFiles(
      format,
      downloadedVerses,
      getSelectedBooks(),
      dialog.path
    );

    if (result.success) {
      resultContent.textContent = "Saved " + result.paths.length + " file(s) to:\n" + dialog.path;
    }
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save to Folder";
  }
}

fetchBtn.addEventListener("click", fetchTranslations);
downloadBtn.addEventListener("click", downloadBible);
saveBtn.addEventListener("click", saveFiles);
translationSelect.addEventListener("change", (e) => {
  selectedTranslation = e.target.value;
  updateDownloadButton();
});
bookGrid.addEventListener("change", updateDownloadButton);
formatSelect.addEventListener("change", updateDownloadButton);

function startApp() {
  if (window.electronAPI) {
    try {
      fetchTranslations();
    } catch (err) {
      translationSelect.disabled = false;
    }
  } else {
    setTimeout(startApp, 200);
  }
}
startApp();
