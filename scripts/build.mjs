import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdir,
  copyFile,
  rm,
  readdir,
  readFile,
  writeFile,
} from "node:fs/promises";
const files = (await readdir("src")).sort();
const source = new Map();
const hash = createHash("sha256");
for (const file of files) {
  if (file.endsWith(".js"))
    execFileSync(process.execPath, ["--check", `src/${file}`]);
  const content = await readFile(`src/${file}`, "utf8");
  source.set(file, content);
  hash.update(file).update(content);
}
const version = hash.digest("hex").slice(0, 12);
await rm("dist", { recursive: true, force: true });
await mkdir("dist/src", { recursive: true });
for (const [file, content] of source) {
  const output = file.endsWith(".js")
    ? content.replace(
        /from\s+(["'])(\.\/[^"']+\.js)\1/g,
        (_, quote, path) => `from ${quote}${path}?v=${version}${quote}`,
      )
    : content;
  await writeFile(`dist/src/${file}`, output);
}
const html = (await readFile("index.html", "utf8"))
  .replace("./src/app.js", `./src/app.js?v=${version}`)
  .replace("./src/styles.css", `./src/styles.css?v=${version}`);
await writeFile("dist/index.html", html);
await writeFile("dist/404.html", html);
for (const file of ["favicon.svg", ".nojekyll"])
  await copyFile(file, `dist/${file}`);
console.log(`Production build ready: dist/ (${version})`);
