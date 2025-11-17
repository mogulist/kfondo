#!/usr/bin/env node

import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { Command } from "commander";

type Record = {
  BIB_NO: string;
  Gender: string;
  Event: string;
  Time: string;
  Status: string;
  StartTime?: string;
  FinishTime?: string;
  Name?: string;
  Speed?: string;
  KOM_TIME?: string;
};

type RaceResultRow = {
  bib: string;
  name: string;
  group: string;
  start: string;
  kom1Start: string;
  kom1Arrive: string;
  finish: string;
  kom1: string;
  speed: string;
  result: string;
  category: string;
};

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveOutputFile(outputPath?: string): string {
  if (outputPath) {
    return path.isAbsolute(outputPath)
      ? outputPath
      : path.join(process.cwd(), outputPath);
  }
  return path.join(process.cwd(), "data", "iksan_2025.json");
}

async function fetchConfig(eventId: string): Promise<{
  key: string;
  server: string;
  lists: Array<{ Name: string; ID: string }>;
}> {
  const url = `https://my.raceresult.com/${eventId}/RRPublish/data/config?lang=en&page=results&v=1`;
  const response = await axios.get(url);
  return response.data;
}

async function fetchListData(
  eventId: string,
  server: string,
  key: string,
  listName: string,
  limit: number = 9999
): Promise<any> {
  const listname = encodeURIComponent(listName);
  const url = `https://${server}/${eventId}/RRPublish/data/list?key=${key}&listname=${listname}&page=results&contest=0&r=leaders&l=${limit}`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.warn(`List not found: ${listName}, skipping...`);
      return null;
    }
    console.error(`Error fetching list data for ${listName}:`, error.message);
    return null;
  }
}

function parseListData(apiResponse: any): RaceResultRow[] {
  const rows: RaceResultRow[] = [];

  if (!apiResponse || !apiResponse.data) {
    return rows;
  }

  // DataFields: ["BIB","ID","LASTNAME","Group","Start.TOD","Kom1Start.TOD","Kom1Finish.TOD","Finish.TOD","Kom1.TOD","Finish.SPEED","Finish.CHIP"]
  const dataFields = apiResponse.DataFields || [];
  const bibIndex = 0; // BIB
  const lastNameIndex = 2; // LASTNAME
  const groupIndex = 3; // Group
  const startIndex = 4; // Start.TOD
  const kom1StartIndex = 5; // Kom1Start.TOD
  const kom1ArriveIndex = 6; // Kom1Finish.TOD
  const finishIndex = 7; // Finish.TOD
  const kom1Index = 8; // Kom1.TOD
  const speedIndex = 9; // Finish.SPEED
  const resultIndex = 10; // Finish.CHIP

  // data 구조: { "#1_MedioFondo": { "#1_메디오폰도-사이클(여)": [...], "#2_메디오폰도-사이클(남)": [...] } }
  const data = apiResponse.data;

  for (const contestKey in data) {
    const contestData = data[contestKey];
    for (const categoryKey in contestData) {
      const categoryRows = contestData[categoryKey];
      if (!Array.isArray(categoryRows)) continue;

      // 카테고리명 추출 (예: "#1_메디오폰도-사이클(여)" -> "메디오폰도-사이클(여)")
      const category = categoryKey.replace(/^#\d+_/, "");

      // 마지막 요소는 총 개수이므로 제외
      for (let i = 0; i < categoryRows.length - 1; i++) {
        const row = categoryRows[i];
        if (!Array.isArray(row) || row.length === 0) continue;

        // 마지막 요소가 숫자 하나면 총 개수이므로 스킵
        if (row.length === 1 && typeof row[0] === "number") continue;

        const bib = row[bibIndex]?.toString().trim() || "";
        const lastName = row[lastNameIndex]?.toString().trim() || "";
        const group = row[groupIndex]?.toString().trim() || "";
        const start = row[startIndex]?.toString().trim() || "";
        const kom1Start = row[kom1StartIndex]?.toString().trim() || "";
        const kom1Arrive = row[kom1ArriveIndex]?.toString().trim() || "";
        const finish = row[finishIndex]?.toString().trim() || "";
        const kom1 = row[kom1Index]?.toString().trim() || "";
        const speed = row[speedIndex]?.toString().trim() || "";
        const result = row[resultIndex]?.toString().trim() || "";

        if (bib && lastName && bib.match(/^\d+$/)) {
          rows.push({
            bib,
            name: lastName,
            group,
            start,
            kom1Start,
            kom1Arrive,
            finish,
            kom1,
            speed,
            result,
            category,
          });
        }
      }
    }
  }

  return rows;
}

function convertToRecord(row: RaceResultRow): Record {
  const gender = row.category.includes("(여)")
    ? "F"
    : row.category.includes("(남)")
    ? "M"
    : "";
  const event = "메디오폰도";

  const hasStartTime =
    row.start && row.start !== "" && !row.start.includes("_");
  const hasFinishTime =
    row.finish && row.finish !== "" && !row.finish.includes("_");
  const hasTime = row.result && row.result !== "" && !row.result.includes("_");

  let status = "";
  if (!hasTime && !hasFinishTime) {
    status = hasStartTime ? "DNF" : "DNS";
  }

  return {
    BIB_NO: row.bib,
    Gender: gender,
    Event: event,
    Time: hasTime ? row.result : "",
    Status: status,
    StartTime: hasStartTime ? row.start : undefined,
    FinishTime: hasFinishTime ? row.finish : undefined,
    Name: row.name,
    Speed: row.speed ? `${row.speed}km/h` : undefined,
    KOM_TIME: row.kom1 && !row.kom1.includes("_") ? row.kom1 : undefined,
  };
}

async function scrapeRaceResult(
  eventId: string,
  key: string,
  outputPath?: string,
  maxRetries: number = 3
): Promise<void> {
  const outputFile = resolveOutputFile(outputPath);
  let records: Record[] = [];

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });

  if (fs.existsSync(outputFile)) {
    try {
      const content = fs.readFileSync(outputFile, "utf-8");
      if (content) {
        records = JSON.parse(content) as Record[];
      }
    } catch (error) {
      console.warn(
        `Failed to load existing records from ${outputFile}. Starting fresh.`,
        error
      );
      records = [];
    }
  } else {
    fs.writeFileSync(outputFile, JSON.stringify(records, null, 2));
  }

  const processedBibs = new Set(records.map((record) => record.BIB_NO));

  console.log(`Starting to scrape Race Result event ${eventId}`);
  console.log(`Results will be saved to: ${outputFile}`);
  console.log(
    `Already processed records: ${processedBibs.size} (will be skipped)`
  );

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Fetching config (attempt ${attempt + 1}/${maxRetries})...`);
      const config = await fetchConfig(eventId);

      const server = config.server || "my3.raceresult.com";
      const apiKey = key || config.key;

      if (!apiKey) {
        throw new Error("API key not found in config");
      }

      console.log(`Server: ${server}, Key: ${apiKey}`);
      console.log(
        `Available lists: ${
          config.lists?.map((l: any) => l.Name).join(", ") || "none"
        }`
      );

      // 모든 리스트에서 데이터 가져오기
      const allRows: RaceResultRow[] = [];

      for (const list of config.lists || []) {
        console.log(`Fetching data from list: ${list.Name} (${list.ID})...`);
        const listData = await fetchListData(
          eventId,
          server,
          apiKey,
          list.Name,
          9999
        );
        if (!listData) {
          console.log(`Skipping list: ${list.Name}`);
          continue;
        }
        const rows = parseListData(listData);
        console.log(`Found ${rows.length} rows from ${list.Name}`);
        allRows.push(...rows);
        await delay(500); // API 호출 간격
      }

      console.log(`Total rows found: ${allRows.length}`);

      let newRecordsCount = 0;
      for (const row of allRows) {
        if (processedBibs.has(row.bib)) {
          continue;
        }

        const record = convertToRecord(row);
        records.push(record);
        processedBibs.add(record.BIB_NO);
        newRecordsCount++;

        console.log(
          `${record.BIB_NO},${record.Gender},${record.Event},${record.Time},${record.Status}`
        );

        fs.writeFileSync(outputFile, JSON.stringify(records, null, 2));
      }

      console.log(`Scraping completed! Added ${newRecordsCount} new records.`);
      return;
    } catch (error) {
      lastError = error as Error;
      console.error(
        `Error during scraping (attempt ${attempt + 1}/${maxRetries}):`,
        error
      );

      if (attempt < maxRetries - 1) {
        console.log(`Retrying in 3 seconds...`);
        await delay(3000);
      }
    }
  }

  throw lastError || new Error("Failed to scrape after all retries");
}

async function main() {
  const program = new Command();

  program
    .name("raceresult-crawler")
    .description("Crawl Race Result platform results")
    .argument("<event_id>", "Event ID (e.g., 370186)")
    .argument("<key>", "Event key (e.g., 291eb0e2d0d3234a709871c9da0b0fd2)")
    .option(
      "-o, --output <path>",
      "Output file path (default: data/iksan_2025.json)"
    );

  program.parse();

  const options = program.opts();
  const [eventId, key] = program.args as [string, string];

  try {
    await scrapeRaceResult(eventId, key, options.output);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
