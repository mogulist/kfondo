import fs from "fs";
import path from "path";
import dayjs from "dayjs";

const DATA_DIR = path.join(process.cwd(), "data");
const OUTPUT_DIR = path.join(DATA_DIR, "sorted-msec");

function timeToMilliseconds(time: string): number {
  // HH:mm:ss 또는 HH:mm:ss.SS 또는 HH:mm:ss.SSS
  if (!time || time === "DNF" || time === "DNS") return -1;
  const [h, m, s] = time.split(":");
  if (!h || !m || !s) return -1;
  let sec = 0,
    ms = 0;
  if (s.includes(".")) {
    const [secStr, msStr] = s.split(".");
    sec = parseInt(secStr, 10);
    // msStr을 항상 3자리로 맞추고, msec로 변환
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

function getCourseName(record: any) {
  // Event 필드가 코스명(그란폰도/메디오폰도/기타)으로 들어오는 구조
  return record.Event || "unknown";
}

function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);
  const files = fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".json") && !f.startsWith("sorted-msec"));
  for (const file of files) {
    const [eventId, yearWithExt] = file.split("_");
    const year = yearWithExt.replace(".json", "");
    const outputFile = path.join(OUTPUT_DIR, `${eventId}_${year}.json`);
    if (fs.existsSync(outputFile)) {
      console.log(`[SKIP] ${outputFile} already exists.`);
      continue;
    }
    const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf-8");
    let records: any[] = [];
    try {
      records = JSON.parse(raw);
    } catch (e) {
      console.error(`[ERROR] Failed to parse ${file}`);
      continue;
    }
    // 코스별로 완주자만 추출하여 msec 변환
    const courseMap: Record<string, number[]> = {};
    for (const r of records) {
      if (!r.Time || r.Status === "DNF" || r.Status === "DNS") continue;
      const course = getCourseName(r);
      const msec = timeToMilliseconds(r.Time);
      if (msec < 0) continue;
      if (!courseMap[course]) courseMap[course] = [];
      courseMap[course].push(msec);
    }
    // 오름차순 정렬
    for (const course in courseMap) {
      courseMap[course].sort((a, b) => a - b);
    }
    fs.writeFileSync(outputFile, JSON.stringify(courseMap, null, 2));
    console.log(`[GENERATED] ${outputFile}`);
  }
}

main();
