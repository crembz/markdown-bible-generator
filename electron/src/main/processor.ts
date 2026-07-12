import * as cheerio from "cheerio";

export function htmlToMarkdown(html: string): string {
  const $ = cheerio.load(html, { xmlMode: true });
  const text = $.text();
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n");
}
