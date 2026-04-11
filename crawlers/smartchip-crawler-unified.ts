import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import { CrawlerRecord } from "./types";

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatTime(timeStr: string): string {
  if (!timeStr) return "";
  return timeStr.trim();
}

function parseHmsToSeconds(hms: string): number {
  const m = hms.trim().match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
  if (!m) return 0;
  return (
    parseInt(m[1], 10) * 3600 + parseInt(m[2], 10) * 60 + parseInt(m[3], 10)
  );
}

function formatSecondsToHms(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const min = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

async function scrapeRecord(
  usedata: string,
  bibNo: number
): Promise<CrawlerRecord> {
  const url = `https://smartchip.co.kr/Expectedrecord_data.asp?usedata=${usedata}&nameorbibno=${bibNo}`;
  const referer = `https://smartchip.co.kr/return_data_livephoto.asp?nameorbibno=${bibNo}&usedata=${usedata}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Referer: referer,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (response.data.includes("잘못된 접속 경로입니다")) {
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

    const $ = cheerio.load(response.data);

    // 등록하지 않은 선수 확인 (데이터에 포함하지 않음)
    if (response.data.includes("사용자 정보가 존재하지 않습니다")) {
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

    // 데이터가 없는 경우 확인
    if (
      response.data.includes("데이터가 없습니다") ||
      response.data.includes("No Results") ||
      response.data.includes("검색결과가 없습니다")
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
    let status = "";
    let name = "";

    // 이름 파싱 (콘솔 출력용)
    const nameMatchLegacy = response.data.match(
      /<font face="맑은고딕" size="3px">([^<]+)&nbsp;<\/font>/
    );
    const nameMatchJamsil = response.data.match(
      /class="jamsil-bold-center"[^>]*style="color:\s*white;"[^>]*>([^<&]+)/i
    );
    if (nameMatchLegacy) name = nameMatchLegacy[1].trim();
    else if (nameMatchJamsil) name = nameMatchJamsil[1].replace(/\s+/g, "").trim();

    // 이름이 "예비"인 경우 테스트 데이터로 간주하고 제외
    if (name === "예비") {
      return {
        BIB_NO: bibNo,
        Gender: "",
        Event: "",
        Time: "",
        Status: "",
        StartTime: "",
        FinishTime: "",
        Name: name, // 콘솔 출력용
      };
    }

    // Event 파싱 (Granfondo 또는 Mediofondo)
    const eventMatchGreen = response.data.match(
      /class="green"[^>]*>(Granfondo|Mediofondo)/i
    );
    const eventMatchJamsil = response.data.match(
      /class="jamsil-bold-center">(Granfondo|Mediofondo)/i
    );
    const eventMatch = eventMatchGreen || eventMatchJamsil;
    if (eventMatch) {
      if (eventMatch[1].toLowerCase() === "granfondo") {
        event = "그란폰도";
      } else if (eventMatch[1].toLowerCase() === "mediofondo") {
        event = "메디오폰도";
      }
    }

    // Total Records 파싱
    const totalRecordsMatch = response.data.match(
      /Total Records.*?(\d{2}:\d{2}:\d{2})/s
    );
    if (totalRecordsMatch) {
      time = totalRecordsMatch[1];
    }

    // 체크포인트 테이블 파싱
    const checkpoints: { [key: string]: string } = {};
    let checkpointIndex = 1;
    let hasEmptyPass = false;
    let hasStartTime = false;
    let finishSectorSecondsSum = 0;

    // 테이블에서 모든 POINT 행 추출
    $("table tr").each((_, row) => {
      const cells = $(row).find("td");
      if (cells.length >= 4) {
        const pointText = $(cells[0]).text().trim();
        const timeText = $(cells[1]).text().trim();
        const passText = $(cells[2]).text().trim();
        const speedPaceText = $(cells[3]).text().trim();

        // POINT가 비어있지 않은 경우만 처리
        if (pointText && pointText !== "-") {
          if (pointText.endsWith("_Finish")) {
            const sec = parseHmsToSeconds(timeText);
            if (sec > 0) finishSectorSecondsSum += sec;
          }
          // 체크포인트 데이터 저장
          checkpoints[
            `CP_${checkpointIndex.toString().padStart(2, "0")}_NAME`
          ] = pointText;
          checkpoints[
            `CP_${checkpointIndex.toString().padStart(2, "0")}_TIME`
          ] = timeText || "-";
          checkpoints[`CP_${checkpointIndex.toString().padStart(2, "0")}_TOD`] =
            passText || "-";
          checkpoints[
            `CP_${checkpointIndex.toString().padStart(2, "0")}_SPEED_PACE`
          ] = speedPaceText || "-";

          // StartTime과 FinishTime 추출
          if (pointText.includes("Stage1_Start")) {
            const timeMatch = passText.match(/\d{2}:\d{2}:\d{2}/);
            if (timeMatch) {
              startTime = timeMatch[0];
              hasStartTime = true;
            }
          }
          if (pointText.includes("Stage2_Finish")) {
            const timeMatch = passText.match(/\d{2}:\d{2}:\d{2}/);
            if (timeMatch) {
              finishTime = timeMatch[0];
            }
          }

          // PASS 값이 비어있거나 "00.00 / 00:00" 형태인지 확인
          if (
            !passText ||
            passText === "" ||
            passText === "-" ||
            passText.includes("00.00 / 00:00")
          ) {
            hasEmptyPass = true;
          }

          checkpointIndex++;
        }
      }
    });

    if (!time && finishSectorSecondsSum > 0) {
      time = formatSecondsToHms(finishSectorSecondsSum);
    }

    // Start 기록이 없으면 DNS로 간주하고 데이터에서 제외
    if (!hasStartTime) {
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

    // DNF 판정 로직
    if (hasEmptyPass) {
      // 중간 기록이 하나라도 비어있으면 DNF
      status = "DNF";
    } else if (time) {
      // 총 기록이 있고 중간 기록이 모두 있으면 정상 완주
      status = "";
    } else {
      // 총 기록이 없으면 DNF
      status = "DNF";
    }

    // 결과 객체 생성
    const result: CrawlerRecord = {
      BIB_NO: bibNo,
      Gender: "",
      Event: event,
      Time: time,
      Status: status,
      StartTime: startTime,
      FinishTime: finishTime,
      Name: name, // 콘솔 출력용 (파일 저장 시 제외됨)
    };

    // 체크포인트 데이터 추가
    Object.assign(result, checkpoints);

    return result;
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

    // 항상 콘솔에 표시 (이름 포함)
    const displayName = record.Name || "";
    console.log(
      `${record.BIB_NO},${displayName},${record.Event},${record.Time},${record.Status}`
    );

    // 파일에는 조건을 만족하는 레코드만 저장 (Name 필드 제외)
    if (record.Time || record.Status || record.Event) {
      // Name 필드를 제외한 레코드 생성
      const { Name, ...recordWithoutName } = record;
      records.push(recordWithoutName);
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
