import { cp, copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = resolve(projectRoot, "dist");

const staticDirectories = ["components", "data", "image", "scripts", "styles"];
const staticFiles = ["robots.txt", "sitemap.xml"];

await mkdir(distRoot, { recursive: true });

for (const directory of staticDirectories) {
  await cp(resolve(projectRoot, directory), resolve(distRoot, directory), {
    recursive: true
  });
}

for (const file of staticFiles) {
  const destination = resolve(distRoot, file);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(resolve(projectRoot, file), destination);
}

console.log("[static] copied runtime data, includes, media, and article assets");
