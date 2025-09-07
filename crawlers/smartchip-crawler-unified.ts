import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import { URLSearchParams } from "url";
import { CrawlerRecord } from "./types";

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatTime(timeStr: string): string {
  if (!timeStr) return "";
  return timeStr.trim();
}

async function scrapeRecord(
  usedata: string,
  bibNo: number
): Promise<CrawlerRecord> {
  const url = "https://smartchip.co.kr/return_data_livephoto.asp";

  try {
    const formData = new URLSearchParams();
    formData.append("nameorbibno", bibNo.toString());
    formData.append("usedata", usedata);

    const response = await axios.post(url, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const $ = cheerio.load(response.data);

    // 데이터가 없는 경우 확인
    if (
      response.data.includes("데이터가 없습니다") ||
      response.data.includes("No Results") ||
      response.data.includes("검색결과가 없습니다") ||
      !response.data.includes("BIB")
    ) {
      return {
        BIB_NO: bibNo,
        Gender: "",
        Event: "",
        Time: "",
        Status: "",
        StartTime: "",
        FinishTime: "",
      };
    }

    // 기본 정보 파싱
    let event = "";
    let time = "";
    let startTime = "";
    let finishTime = "";

    // 종목 파싱 (두 번째 .jamsil-bold-center 요소)
    const nameEventElements = $(".jamsil-bold-center");
    if (nameEventElements.length >= 2) {
      const eventText = nameEventElements.eq(1).text().trim();
      if (eventText === "Granfondo") {
        event = "그란폰도";
      } else if (eventText === "Mediofondo") {
        event = "메디오폰도";
      }
    }

    // 총 기록 파싱 (큰 글씨로 표시되는 시간)
    const totalTimeElement = $(".jamsil-bold-center2").first();
    if (totalTimeElement.length > 0) {
      time = formatTime(totalTimeElement.text());
    }

    // StartTime과 FinishTime 파싱
    $("details").each((_, element) => {
      const summary = $(element).find("summary");
      const stageText = summary
        .find(".pretendard-gov-bold5")
        .first()
        .text()
        .trim();

      // Stage1에서 StartTime 추출
      if (stageText.includes("Stage1")) {
        const table = $(element).find("table.result-table");
        table.find("tr").each((_, row) => {
          const pointCell = $(row).find("td").eq(0);
          const passTimeCell = $(row).find("td").eq(2);

          if (pointCell.text().includes("Stage1_Start")) {
            const passTimeText = passTimeCell.text().trim();
            const match = passTimeText.match(/\d{2}:\d{2}:\d{2}/);
            if (match) {
              startTime = match[0];
            }
          }
        });
      }

      // Stage2에서 FinishTime 추출
      if (stageText.includes("Stage2")) {
        const table = $(element).find("table.result-table");
        table.find("tr").each((_, row) => {
          const pointCell = $(row).find("td").eq(0);
          const passTimeCell = $(row).find("td").eq(2);

          if (pointCell.text().includes("Stage2_Finish")) {
            const passTimeText = passTimeCell.text().trim();
            const match = passTimeText.match(/\d{2}:\d{2}:\d{2}/);
            if (match) {
              finishTime = match[0];
            }
          }
        });
      }
    });

    return {
      BIB_NO: bibNo,
      Gender: "",
      Event: event,
      Time: time,
      Status: time ? "" : "DNF",
      StartTime: startTime,
      FinishTime: finishTime,
    };
  } catch (error) {
    console.error(`Error processing BIB #${bibNo}:`, error);
    return {
      BIB_NO: bibNo,
      Gender: "",
      Event: "",
      Time: "",
      Status: "",
      StartTime: "",
      FinishTime: "",
    };
  }
}

export async function crawlSmartChip(
  eventName: string,
  usedata: string,
  startBib: number = 1,
  endBib: number = 9999,
  period: number = 150,
  outputFile?: string
): Promise<CrawlerRecord[]> {
  const records: CrawlerRecord[] = [];

  console.log(`Event: ${eventName} (usedata=${usedata})`);
  console.log(`Starting to crawl from bib #${startBib} to #${endBib}`);
  if (outputFile) {
    console.log(`Results will be saved to: ${outputFile}`);
  }
  console.log(
    `API call period: ${period}ms (${1000 / period} calls per second)`
  );

  for (let bibNo = startBib; bibNo <= endBib; bibNo++) {
    const apiStart = Date.now();
    const record = await scrapeRecord(usedata, bibNo);

    // 항상 콘솔에 표시
    console.log(
      `${record.BIB_NO},,${record.Event},${record.Time},${record.Status}`
    );

    // 파일에는 조건을 만족하는 레코드만 저장
    if (record.Time || record.Status) {
      records.push(record);
      // Save to file after each record if outputFile is provided
      if (outputFile) {
        fs.writeFileSync(outputFile, JSON.stringify(records, null, 2));
      }
    }

    const fetchAndWriteFileDuration = Date.now() - apiStart;
    const delayMs = Math.max(0, period - fetchAndWriteFileDuration);
    await delay(delayMs);
  }

  console.log(`Scraping completed for ${eventName}!`);
  return records;
}
