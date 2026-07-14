import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const required = [
  "Dockerfile",
  "compose.yaml",
  ".env.example",
  "package-lock.json",
  "supabase/config.toml",
];
const ignoredDirectories = new Set([".git", ".output", "node_modules"]);
const ignoredFiles = new Set(["package-lock.json", "scripts/check-portability.mjs"]);
const vendorPattern = /lovable(?:\.dev)?|gpt-engineer/i;
const findings = [];

for (const file of required) {
  if (!existsSync(join(root, file))) findings.push(`Ontbrekend bestand: ${file}`);
}

function scan(directory) {
  for (const entry of readdirSync(directory)) {
    if (ignoredDirectories.has(entry)) continue;
    const path = join(directory, entry);
    const relativePath = relative(root, path).replaceAll("\\", "/");
    if (statSync(path).isDirectory()) {
      scan(path);
      continue;
    }
    if (ignoredFiles.has(relativePath)) continue;
    const content = readFileSync(path, "utf8");
    if (vendorPattern.test(content)) findings.push(`Vendor-koppeling gevonden: ${relativePath}`);
  }
}

scan(root);

if (findings.length) {
  console.error(findings.join("\n"));
  process.exit(1);
}

console.log(
  "Portabiliteitscontrole geslaagd: geen vaste builderkoppeling en alle deploybestanden aanwezig.",
);
