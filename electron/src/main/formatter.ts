import { BibleVerse } from "./api/downloader";
import { BOOK_NAMES } from "./books";
import { htmlToMarkdown } from "./processor";

export type OutputFormat = "single" | "book" | "chapter" | "verse";

interface BookChapters {
  [chapter: number]: string[];
}

interface BookData {
  [book: number]: BookChapters;
}

interface BookResult {
  content: string;
  filePaths: string[];
}

export function formatBible(
  verses: BibleVerse[],
  format: OutputFormat,
  selectedBooks?: number[]
): { content: string; filePaths: string[]; fileContents: string[] } {
  const bookData: BookData = {};

  for (const verse of verses) {
    if (selectedBooks && !selectedBooks.includes(verse.book)) continue;

    if (!bookData[verse.book]) {
      bookData[verse.book] = {};
    }
    if (!bookData[verse.book][verse.chapter]) {
      bookData[verse.book][verse.chapter] = [];
    }
    const name = BOOK_NAMES[verse.book] || verse.book_name;
    const content = htmlToMarkdown(verse.text);
    bookData[verse.book][verse.chapter].push(
      `${verse.verse} ${content}`
    );
  }

  const filePaths: string[] = [];

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
    return { content, filePaths, fileContents: [content] };
  }

  if (format === "book") {
    const bookContents: string[] = [];
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
    return { content: mergedContent, filePaths, fileContents: bookContents };
  }

  if (format === "chapter") {
    const chapterContents: string[] = [];
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
    return { content: allContent, filePaths, fileContents: chapterContents };
  }

  if (format === "verse") {
    const verseContents: string[] = [];
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
          verseContents.push(verseLine);
        }
      }
    }
    return { content: "", filePaths, fileContents: verseContents };
  }

  return { content: "", filePaths: [], fileContents: [] };
}
