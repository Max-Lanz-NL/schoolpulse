import { existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const required = [
  "Dockerfile",
  "compose.yaml",
  ".env.example",
  "package-lock.json",
  "supabase/config.toml",
];
const findings = [];

for (const file of required) {
  if (!existsSync(join(root, file))) findings.push(`Ontbrekend bestand: ${file}`);
}

if (findings.length) {
  console.error(findings.join("\n"));
  process.exit(1);
}

console.log("Portabiliteitscontrole geslaagd: alle zelfstandige deploybestanden zijn aanwezig.");
