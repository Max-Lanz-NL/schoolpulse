import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const manifestPath = argument("--manifest");
const directory = argument("--directory");

if (!manifestPath || !directory) {
  console.error(
    "Gebruik: node scripts/verify-storage-backup.mjs --manifest <manifest.json> --directory <objectmap>",
  );
  process.exit(2);
}

const manifest = JSON.parse(await readFile(resolve(manifestPath), "utf8"));
const failures = [];

for (const object of manifest.objects ?? []) {
  const filePath = resolve(directory, object.original_file_name);
  try {
    const bytes = await readFile(filePath);
    const checksum = createHash("sha256").update(bytes).digest("hex");
    if (bytes.length !== object.size_bytes)
      failures.push(`${object.original_file_name}: grootte wijkt af`);
    if (checksum !== object.sha256) failures.push(`${object.original_file_name}: SHA-256 wijkt af`);
  } catch (error) {
    failures.push(`${object.original_file_name}: ontbreekt (${error.code ?? "leesfout"})`);
  }
}

if (failures.length) {
  console.error(`Storage-backupcontrole mislukt (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Storage-backupcontrole geslaagd: ${manifest.objects.length} objecten, grootte en SHA-256 gelijk.`,
);
