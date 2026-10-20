import { execFileSync } from "node:child_process";
import { readdir } from "node:fs/promises";
for (const file of await readdir("src"))
  if (file.endsWith(".js"))
    execFileSync(process.execPath, ["--check", `src/${file}`]);
import { mkdir, copyFile, cp, rm } from "node:fs/promises";
await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
for (const f of ["index.html", "favicon.svg"]) await copyFile(f, `dist/${f}`);
await cp("src", "dist/src", { recursive: true });
await copyFile("index.html", "dist/404.html");
await copyFile(".nojekyll", "dist/.nojekyll");
console.log("Production build ready: dist/");
