import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
  FileBlob,
  SpreadsheetFile,
} from "file:///C:/Users/max-l/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const fixture = (name) =>
  fileURLToPath(new URL(`../test-fixtures/import/${name}`, import.meta.url));
const required = ["student_number", "full_name", "email", "class_code", "date_of_birth"];

function validate(rows) {
  const headers = rows[0].map(String);
  if (required.some((field) => !headers.includes(field)))
    throw new Error("Verplichte kolom ontbreekt");
  const numbers = new Set();
  return rows.slice(1).map((values, index) => {
    const row = Object.fromEntries(headers.map((header, column) => [header, values[column]]));
    const errors = [];
    const number = String(row.student_number ?? "").trim();
    if (!number) errors.push("student_number is verplicht");
    else if (numbers.has(number)) errors.push("student_number is dubbel");
    numbers.add(number);
    if (!/^\S+@\S+\.\S+$/.test(String(row.email ?? ""))) errors.push("email is ongeldig");
    if (!/^V4A$/.test(String(row.class_code ?? ""))) errors.push("class_code bestaat niet");
    const date =
      row.date_of_birth instanceof Date
        ? row.date_of_birth
        : typeof row.date_of_birth === "number"
          ? new Date(Math.round((row.date_of_birth - 25569) * 86400 * 1000))
          : new Date(String(row.date_of_birth));
    if (Number.isNaN(date.getTime()) || date.getFullYear() < 2000 || date.getFullYear() > 2020)
      errors.push("date_of_birth is ongeldig");
    return { row: index + 2, errors };
  });
}

const csvText = (await fs.readFile(fixture("leerlingen-import-gemengd.csv"), "utf8"))
  .replace(/^\uFEFF/, "")
  .trim();
const csvRows = csvText.split(/\r?\n/).map((line) => line.split(";"));
const input = await FileBlob.load(fixture("leerlingen-import-gemengd.xlsx"));
const workbook = await SpreadsheetFile.importXlsx(input);
const xlsxRows = workbook.worksheets.getItem("Leerlingen").getRange("A1:E6").values;
const csvResult = validate(csvRows);
const xlsxResult = validate(xlsxRows);
const summary = (result) => ({
  total: result.length,
  valid: result.filter((row) => !row.errors.length).length,
  errors: result.filter((row) => row.errors.length).length,
});
const report = { csv: summary(csvResult), xlsx: summary(xlsxResult), csvResult, xlsxResult };
if (
  JSON.stringify(report.csv) !== JSON.stringify(report.xlsx) ||
  report.csv.valid !== 2 ||
  report.csv.errors !== 3
) {
  throw new Error(`Importvalidatie wijkt af: ${JSON.stringify(report)}`);
}
console.log(JSON.stringify(report, null, 2));
