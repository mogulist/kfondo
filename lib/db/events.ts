/**
 * events 데이터 조회 함수
 * 하이브리드 방식: Supabase 우선, 실패 시 JSON 폴백
 */

import { supabase, isSupabaseEnabled } from "../supabase";
import { events as eventsJson } from "../../events.config";
import type { Event, EventYearDetail, RaceCategory } from "../types";
import type { EventRow, EventEditionRow, CourseRow } from "../database.types";

// DB Row들을 조합하여 Event 객체로 변환
type EventWithRelations = EventRow & {
  event_editions: (EventEditionRow & {
    courses: CourseRow[];
  })[];
};

function mapRowToEvent(row: EventWithRelations): Event {
  // yearDetails 객체 재구성
  const yearDetails: Record<number, EventYearDetail> = {};

  if (row.event_editions) {
    row.event_editions.forEach((edition) => {
      const courses: RaceCategory[] =
        edition.courses?.map((course) => ({
          id: course.course_type,
          name: course.name,
          distance: course.distance,
          elevation: course.elevation,
          registered: course.registered_count,
        })) || [];

      yearDetails[edition.year] = {
        year: edition.year,
        date: edition.date.replace(/-/g, "."), // YYYY-MM-DD -> YYYY.MM.DD
        status: edition.status as any,
        url: edition.url || undefined,
        recordsBlobUrl: edition.records_blob_url || undefined,
        sortedRecordsBlobUrl: edition.sorted_records_blob_url || undefined,
        courses: courses,
        totalRegistered: courses.reduce(
          (sum, c) => sum + (c.registered || 0),
          0
        ),
      };
    });
  }

  return {
    id: row.slug, // 프론트엔드 id는 slug를 사용
    location: row.location,
    name: row.name,
    years: row.event_editions?.map((e) => e.year).sort((a, b) => a - b) || [],
    color: {
      from: row.color_from,
      to: row.color_to,
    },
    status: "ready", // 기본값 (개별 연도 상태 참조)
    meta: {
      title: row.meta_title,
      description: row.meta_description,
      image: row.meta_image,
    },
    comment: row.comment || undefined,
    yearDetails: yearDetails,
  };
}

/**
 * 모든 이벤트 조회
 * @returns Event[] - 이벤트 배열
 */
export async function getAllEvents(): Promise<Event[]> {
  // Supabase가 설정되지 않았으면 JSON 폴백
  if (!isSupabaseEnabled() || !supabase) {
    console.log(
      `[events] 📁 JSON에서 ${eventsJson.length}개 이벤트 로드 (Supabase 미설정)`
    );
    return eventsJson;
  }

  try {
    // 3중 조인 쿼리
    const { data, error } = await supabase
      .from("events")
      .select("*, event_editions(*, courses(*))");

    if (error) {
      console.error(`[events] ❌ Supabase 조회 실패: ${error.message}`);
      console.log(`[events] 📁 JSON 폴백 사용 (${eventsJson.length}개)`);
      return eventsJson;
    }

    if (!data || data.length === 0) {
      console.log("[events] DB에 데이터 없음, JSON 폴백 사용");
      return eventsJson;
    }

    console.log(`[events] ✅ Supabase에서 ${data.length}개 이벤트 로드`);
    // @ts-ignore: Supabase 조인 타입 추론 한계로 인해 무시 (실제 런타임 데이터 구조는 맞음)
    return data.map((row) => mapRowToEvent(row as EventWithRelations));
  } catch (err) {
    console.error("[events] 예외 발생, JSON 폴백 사용:", err);
    return eventsJson;
  }
}

/**
 * ID(Slug)로 단일 이벤트 조회
 * @param eventSlug - 이벤트 ID (slug, 예: muju)
 * @returns Event | undefined
 */
export async function getEventById(
  eventSlug: string
): Promise<Event | undefined> {
  // Supabase가 설정되지 않았으면 JSON 폴백
  if (!isSupabaseEnabled() || !supabase) {
    console.log(
      `[events] 📁 JSON에서 "${eventSlug}" 로드 (Supabase 미설정)`
    );
    return eventsJson.find((e) => e.id === eventSlug);
  }

  try {
    const { data, error } = await supabase
      .from("events")
      .select("*, event_editions(*, courses(*))")
      .eq("slug", eventSlug) // id 대신 slug로 조회
      .single();

    if (error) {
      console.error(
        `[events] ${eventSlug} 조회 실패, JSON 폴백 사용:`,
        error.message
      );
      return eventsJson.find((e) => e.id === eventSlug);
    }

    if (!data) {
      return eventsJson.find((e) => e.id === eventSlug);
    }

    console.log(`[events] ✅ Supabase에서 "${eventSlug}" 로드`);
    // @ts-ignore
    return mapRowToEvent(data as EventWithRelations);
  } catch (err) {
    console.error(`[events] ${eventSlug} 예외 발생, JSON 폴백 사용:`, err);
    return eventsJson.find((e) => e.id === eventSlug);
  }
}

/**
 * 동기적 이벤트 접근 (기존 코드 호환용)
 * 빌드 타임이나 Supabase 미설정 환경에서 사용
 */
export const events = eventsJson;
