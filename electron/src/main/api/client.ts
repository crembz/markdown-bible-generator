export interface TranslationInfo {
  short_name: string;
  full_name: string;
  updated: number;
  dir?: string;
}

export interface Language {
  language: string;
  translations: TranslationInfo[];
}

async function fetchJSON(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { "User-Agent": "BibleMarkdownGenerator/1.0" },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} from ${url}`);
  }
  return res.json();
}

export async function fetchTranslations(): Promise<Language[]> {
  const data = (await fetchJSON(
    "https://bolls.life/static/bolls/app/views/languages.json"
  )) as Language[];
  return data;
}
