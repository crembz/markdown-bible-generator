import https from "https";
import { BOOK_NAMES } from "../books";

export interface BibleVerse {
  book: number;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BookInfo {
  id: number;
  name: string;
  chapterCount: number;
}

function fetchTranslationJSON(slug: string): Promise<BibleVerse[]> {
  return new Promise((resolve, reject) => {
    const url = `https://bolls.life/static/translations/${slug}.json`;
    https
      .get(url, { headers: { "User-Agent": "BibleMarkdownGenerator/1.0" } }, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} from ${url}`));
          return;
        }
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(Buffer.concat(chunks).toString("utf-8"));
            if (!Array.isArray(json)) {
              reject(new Error("Translation JSON is not an array"));
              return;
            }
            resolve(json as BibleVerse[]);
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

export function deriveBooks(data: BibleVerse[]): BookInfo[] {
  const bookMap = new Map<number, { name: string; maxChapter: number }>();
  for (const verse of data) {
    const entry = bookMap.get(verse.book);
    if (!entry) {
      bookMap.set(verse.book, { name: verse.book_name, maxChapter: verse.chapter });
    } else {
      if (verse.chapter > entry.maxChapter) {
        entry.maxChapter = verse.chapter;
        entry.name = verse.book_name;
      }
    }
  }
  const result: BookInfo[] = [];
  for (const [id, info] of bookMap) {
    result.push({ id, name: info.name, chapterCount: info.maxChapter });
  }
  result.sort((a, b) => a.id - b.id);
  return result;
}

export async function downloadTranslation(
  slug: string,
  onProgress: (percent: number, status: string) => void
): Promise<BibleVerse[]> {
  onProgress(0, "Fetching translation data...");
  const data = await fetchTranslationJSON(slug);
  onProgress(50, "Processing verses...");
  return data;
}
