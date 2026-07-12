import * as fs from "fs/promises";
import * as path from "path";

export async function writeOutput(
  content: string,
  filePaths: string[],
  baseDir: string,
  fileContents?: string[]
): Promise<string[]> {
  const written: string[] = [];

  if (filePaths.length === 1) {
    const fullPath = path.join(baseDir, filePaths[0]);
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, content, "utf-8");
    written.push(fullPath);
    return written;
  }

  for (let i = 0; i < filePaths.length; i++) {
    const fullPath = path.join(baseDir, filePaths[i]);
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, fileContents?.[i] || content, "utf-8");
    written.push(fullPath);
  }

  return written;
}
