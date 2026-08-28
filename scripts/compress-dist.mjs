import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const DIST_DIR = new URL("../dist", import.meta.url);
const COMPRESSIBLE_EXT = new Set([
  ".html",
  ".css",
  ".js",
  ".mjs",
  ".json",
  ".xml",
  ".txt",
  ".svg",
  ".ico"
]);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }
    files.push(fullPath);
  }

  return files;
}

function shouldCompress(filePath) {
  const lower = filePath.toLowerCase();
  return Array.from(COMPRESSIBLE_EXT).some((ext) => lower.endsWith(ext));
}

async function main() {
  const root = fileURLToPath(DIST_DIR);
  const files = await walk(root);
  let compressedCount = 0;

  for (const filePath of files) {
    if (!shouldCompress(filePath)) continue;

    const fileStats = await stat(filePath);
    if (fileStats.size < 1024) continue;

    const content = await readFile(filePath);
    const gzContent = gzipSync(content, { level: 9 });
    await writeFile(filePath + ".gz", gzContent);
    compressedCount++;
  }

  console.log(`[compress] generated ${compressedCount} gzip files`);
}

main().catch((error) => {
  console.error("[compress] failed:", error);
  process.exitCode = 1;
});
