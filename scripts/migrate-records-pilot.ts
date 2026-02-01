import { createClient } from "@supabase/supabase-js";
import type { Database } from "../lib/database.types";
import * as fs from "fs";
import * as path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// JSON 레코드 타입 정의
interface JsonRecord {
  BIB_NO: number | string;
  Gender?: string;
  Event: string;
  Time: string;
  Status?: string;
  StartTime?: string;
  FinishTime?: string;
  Comment?: string;
  [key: string]: any; // 추가 필드 (Pace, Speed, CP_*, KOM_* 등)
}

async function migrateRecords() {
  console.log("🚀 Phase 3 - Pilot Migration: seorak_2025.json");

  // 1. 파일 읽기
  const filePath = path.join(process.cwd(), "data", "seorak_2025.json");
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const records: JsonRecord[] = JSON.parse(fileContent);

  console.log(`📄 총 ${records.length}개의 레코드를 읽었습니다.`);

  // 2. event_edition_id 조회 (slug: seorak, year: 2025)
  const { data: events, error: eventError } = await supabase
    .from("events")
    .select("id, slug")
    .eq("slug", "seorak")
    .single();

  if (eventError || !events) {
    console.error("❌ Event를 찾을 수 없습니다:", eventError);
    return;
  }

  const { data: edition, error: editionError } = await supabase
    .from("event_editions")
    .select("id")
    .eq("event_id", events.id)
    .eq("year", 2025)
    .single();

  if (editionError || !edition) {
    console.error("❌ Event Edition을 찾을 수 없습니다:", editionError);
    return;
  }

  console.log(`✅ Event Edition ID: ${edition.id}`);

  // 3. courses 조회 (이름 -> ID 매핑)
  const { data: courses, error: coursesError } = await supabase
    .from("courses")
    .select("id, name")
    .eq("edition_id", edition.id);

  if (coursesError || !courses) {
    console.error("❌ Courses를 찾을 수 없습니다:", coursesError);
    return;
  }

  const courseMap = new Map<string, string>();
  courses.forEach((course) => {
    courseMap.set(course.name, course.id);
  });

  console.log(`✅ ${courses.length}개의 코스를 매핑했습니다:`, Array.from(courseMap.keys()));

  // 4. 레코드 변환 및 삽입
  const BATCH_SIZE = 1000;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const transformedRecords = batch.map((record) => {
      // 필수 필드 추출
      const bibNo = String(record.BIB_NO);
      const courseId = courseMap.get(record.Event) || null;
      
      // Status 정규화
      let status = "FINISHED";
      if (record.Status === "DNF") status = "DNF";
      else if (record.Status === "DNS") status = "DNS";
      else if (!record.Time || record.Time === "") status = "DNS";

      // extra_data: 필수 필드 외의 모든 데이터
      const extraData: Record<string, any> = {};
      const essentialFields = ["BIB_NO", "Gender", "Event", "Time", "Status", "StartTime", "FinishTime", "Comment"];
      
      Object.keys(record).forEach((key) => {
        if (!essentialFields.includes(key) && record[key] !== undefined) {
          extraData[key] = record[key];
        }
      });

      return {
        event_edition_id: edition.id,
        course_id: courseId,
        bib_no: bibNo,
        gender: record.Gender || null,
        record_time: record.Time || null,
        status,
        start_time: record.StartTime || null,
        finish_time: record.FinishTime || null,
        extra_data: extraData,
      };
    });

    const { error } = await supabase.from("records").insert(transformedRecords);

    if (error) {
      console.error(`❌ Batch ${i / BATCH_SIZE + 1} 삽입 실패:`, error);
      errorCount += batch.length;
    } else {
      successCount += batch.length;
      console.log(`✅ Batch ${i / BATCH_SIZE + 1} 완료 (${successCount}/${records.length})`);
    }
  }

  console.log(`\n🎉 마이그레이션 완료!`);
  console.log(`   성공: ${successCount}개`);
  console.log(`   실패: ${errorCount}개`);

  // 5. 검증: DB 레코드 수 확인
  const { count, error: countError } = await supabase
    .from("records")
    .select("*", { count: "exact", head: true })
    .eq("event_edition_id", edition.id);

  if (countError) {
    console.error("❌ 검증 실패:", countError);
  } else {
    console.log(`\n📊 검증: DB에 ${count}개의 레코드가 저장되었습니다.`);
    console.log(`   JSON 파일: ${records.length}개`);
    console.log(`   일치 여부: ${count === records.length ? "✅ 일치" : "❌ 불일치"}`);
  }
}

migrateRecords().catch(console.error);
