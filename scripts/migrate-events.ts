/**
 * events.config.ts 데이터를 Supabase로 마이그레이션하는 스크립트
 *
 * 사용법:
 *   SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx bun run scripts/migrate-events.ts
 *
 * 주의: Service Role Key를 사용해야 RLS를 우회하여 데이터를 삽입할 수 있습니다.
 */

import { createClient } from "@supabase/supabase-js";
import { events } from "../events.config";
import type { Database } from "../lib/database.types";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ 환경변수가 설정되지 않았습니다.");
  console.error("   SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 설정하세요.");
  console.error("");
  console.error("사용법:");
  console.error(
    "   SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx bun run scripts/migrate-events.ts"
  );
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

async function migrateEvents() {
  console.log("🚀 events 마이그레이션 시작...");
  console.log(`   총 ${events.length}개의 이벤트를 마이그레이션합니다.`);
  console.log("");

  let successCount = 0;
  let errorCount = 0;

  for (const event of events) {
    const dbEvent = {
      id: event.id,
      location: event.location,
      name: event.name || null,
      years: event.years,
      color_from: event.color.from,
      color_to: event.color.to,
      status: event.status,
      meta_title: event.meta.title,
      meta_description: event.meta.description,
      meta_image: event.meta.image,
      comment: event.comment || null,
      data_source: event.dataSource || null,
      year_details: event.yearDetails,
    };

    const { error } = await supabase.from("events").upsert(dbEvent, {
      onConflict: "id",
    });

    if (error) {
      console.error(`❌ ${event.id}: ${error.message}`);
      errorCount++;
    } else {
      console.log(`✅ ${event.id} (${event.location})`);
      successCount++;
    }
  }

  console.log("");
  console.log("📊 마이그레이션 완료");
  console.log(`   성공: ${successCount}개`);
  console.log(`   실패: ${errorCount}개`);

  if (errorCount > 0) {
    process.exit(1);
  }
}

migrateEvents().catch((err) => {
  console.error("마이그레이션 중 오류 발생:", err);
  process.exit(1);
});
