import fs from "fs";
import path from "path";
import { normalizeGenderLabel } from "../lib/record-gender-filter";

const DATA_DIR = path.join(process.cwd(), "data");
const OUTPUT_DIR = path.join(DATA_DIR, "sorted-msec");

function timeToMilliseconds(time: string): number {
  if (!time || time === "DNF" || time === "DNS") return -1;
  const [h, m, s] = time.split(":");
  if (!h || !m || !s) return -1;
  let sec = 0,
    ms = 0;
  if (s.includes(".")) {
    const [secStr, msStr] = s.split(".");
    sec = parseInt(secStr, 10);
    ms = parseInt(msStr.padEnd(3, "0").slice(0, 3), 10);
  } else {
    sec = parseInt(s, 10);
  }
  return (
    parseInt(h, 10) * 3600 * 1000 +
    parseInt(m, 10) * 60 * 1000 +
    sec * 1000 +
    ms
  );
}

function getCourseName(record: { Event?: string }) {
  return record.Event || "unknown";
}

function getGenderRaw(record: { Gender?: string }) {
  return typeof record.Gender === "string" ? record.Gender : "";
}

function parseArgs(argv: string[]) {
  let force = false;
  for (const a of argv) {
    if (a === "--force" || a === "-f") force = true;
  }
  return { force };
}

function main() {
  const { force } = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);
  const files = fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".json") && !f.startsWith("sorted-msec"));
  for (const file of files) {
    const [eventId, yearWithExt] = file.split("_");
    const year = yearWithExt.replace(".json", "");
    const outputFile = path.join(OUTPUT_DIR, `${eventId}_${year}.json`);
    if (fs.existsSync(outputFile) && !force) {
      console.log(`[SKIP] ${outputFile} already exists.`);
      continue;
    }
    const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf-8");
    let records: unknown[] = [];
    try {
      records = JSON.parse(raw) as unknown[];
    } catch {
      console.error(`[ERROR] Failed to parse ${file}`);
      continue;
    }
    const courseMap: Record<string, number[]> = {};
    const pushMsec = (key: string, msec: number) => {
      if (!courseMap[key]) courseMap[key] = [];
      courseMap[key].push(msec);
    };

    for (const r of records) {
      const row = r as {
        Time?: string;
        Status?: string;
        Event?: string;
        Gender?: string;
      };
      if (!row.Time || row.Status === "DNF" || row.Status === "DNS") continue;
      const course = getCourseName(row);
      const msec = timeToMilliseconds(row.Time);
      if (msec < 0) continue;

      pushMsec(course, msec);
      const g = normalizeGenderLabel(getGenderRaw(row));
      if (g === "male") pushMsec(`${course}_M`, msec);
      if (g === "female") pushMsec(`${course}_F`, msec);
    }

    for (const key of Object.keys(courseMap)) {
      courseMap[key].sort((a, b) => a - b);
    }
    fs.writeFileSync(outputFile, JSON.stringify(courseMap, null, 2));
    console.log(`[GENERATED] ${outputFile}`);
  }
}

main();
