import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
  SpreadsheetFile,
  Workbook,
} from "file:///C:/Users/max-l/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const outputDir = new URL("../test-fixtures/import/", import.meta.url);
await fs.mkdir(outputDir, { recursive: true });

const rows = [
  ["student_number", "full_name", "email", "class_code", "date_of_birth"],
  ["PILOT-001", "Noa de Vries", "noa.devries@example.test", "V4A", new Date("2010-04-12")],
  ["PILOT-002", "Sam El Amrani", "sam.elamrani@example.test", "V4A", new Date("2010-11-03")],
  ["", "Regel zonder nummer", "fout@example.test", "V4A", new Date("2010-01-01")],
  ["PILOT-002", "Dubbele leerling", "dubbel@example.test", "V4A", new Date("2010-02-02")],
  ["PILOT-005", "Fout E-mailadres", "geen-geldig-emailadres", "ONBEKEND", "31-02-2010"],
];

const workbook = Workbook.create();
const sheet = workbook.worksheets.add("Leerlingen");
sheet.showGridLines = false;
sheet.getRange("A1:E6").values = rows;
sheet.freezePanes.freezeRows(1);
sheet.getRange("A1:E1").format = {
  fill: "#17365D",
  font: { bold: true, color: "#FFFFFF" },
  borders: { preset: "outside", style: "thin", color: "#17365D" },
};
sheet.getRange("A2:E6").format.borders = {
  insideHorizontal: { style: "thin", color: "#D9E2F3" },
};
sheet.getRange("E2:E6").format.numberFormat = "yyyy-mm-dd";
sheet.getRange("A1:E6").format.rowHeight = 22;
sheet.getRange("A:A").format.columnWidth = 18;
sheet.getRange("B:B").format.columnWidth = 24;
sheet.getRange("C:C").format.columnWidth = 32;
sheet.getRange("D:D").format.columnWidth = 14;
sheet.getRange("E:E").format.columnWidth = 18;
sheet.getRange("A4:E4").format.fill = "#FFF2CC";
sheet.getRange("A5:E6").format.fill = "#FCE4D6";
const help = workbook.worksheets.add("Uitleg");
help.showGridLines = false;
help.getRange("A1:D1").merge();
help.getRange("A1").values = [["SchoolPulse importtest – uitsluitend fictieve gegevens"]];
help.getRange("A1:D1").format = {
  fill: "#17365D",
  font: { bold: true, color: "#FFFFFF", size: 14 },
};
help.getRange("A3:B7").values = [
  ["Doel", "Test geldige regels, ontbrekend nummer, duplicaat en ongeldige waarden."],
  ["Groen/wit", "Geldige importregels."],
  ["Geel", "Ontbrekend verplicht leerlingnummer."],
  ["Oranje", "Duplicaat of ongeldige waarden."],
  [
    "Herstel",
    "Een import mag pas worden toegepast na controle en moet als batch terug te draaien zijn.",
  ],
];
help.getRange("A3:A7").format.font = { bold: true };
help.getRange("A:B").format.columnWidth = 28;
help.getRange("B:B").format.columnWidth = 75;
help.getRange("A3:B7").format.wrapText = true;

await workbook.inspect({ kind: "sheet", include: "id,name", maxChars: 2000 });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(fileURLToPath(new URL("leerlingen-import-gemengd.xlsx", outputDir)));

const csv = [
  "student_number;full_name;email;class_code;date_of_birth",
  "PILOT-001;Noa de Vries;noa.devries@example.test;V4A;2010-04-12",
  "PILOT-002;Sam El Amrani;sam.elamrani@example.test;V4A;2010-11-03",
  ";Regel zonder nummer;fout@example.test;V4A;2010-01-01",
  "PILOT-002;Dubbele leerling;dubbel@example.test;V4A;2010-02-02",
  "PILOT-005;Fout E-mailadres;geen-geldig-emailadres;ONBEKEND;31-02-2010",
].join("\n");
await fs.writeFile(new URL("leerlingen-import-gemengd.csv", outputDir), `\uFEFF${csv}\n`, "utf8");
