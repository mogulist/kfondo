/**
 * events 데이터 조회 함수
 * 하이브리드 방식: Supabase 우선, 실패 시 JSON 폴백
 */

import { supabase, isSupabaseEnabled } from "../supabase";
import { events as eventsJson } from "../../events.config";
import type { Event } from "../types";
import type { EventRow } from "../database.types";

// DB Row를 기존 Event 타입으로 변환
function mapRowToEvent(row: EventRow): Event {
  return {
    id: row.id,
    location: row.location,
    name: row.name || undefined,
    years: row.years,
    color: {
      from: row.color_from,
      to: row.color_to,
    },
    status: row.status,
    meta: {
      title: row.meta_title,
      description: row.meta_description,
      image: row.meta_image,
    },
    comment: row.comment || undefined,
    dataSource: row.data_source as Event["dataSource"],
    yearDetails: row.year_details as Event["yearDetails"],
  };
}

/**
 * 모든 이벤트 조회
 * @returns Event[] - 이벤트 배열
 */
export async function getAllEvents(): Promise<Event[]> {
  // Supabase가 설정되지 않았으면 JSON 폴백
  if (!isSupabaseEnabled() || !supabase) {
    console.log(`[events] 📁 JSON에서 ${eventsJson.length}개 이벤트 로드 (Supabase 미설정)`);
    return eventsJson;
  }

  try {
    const { data, error } = await supabase.from("events").select("*");

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
    return data.map(mapRowToEvent);
  } catch (err) {
    console.error("[events] 예외 발생, JSON 폴백 사용:", err);
    return eventsJson;
  }
}

/**
 * ID로 단일 이벤트 조회
 * @param eventId - 이벤트 ID
 * @returns Event | undefined
 */
export async function getEventById(eventId: string): Promise<Event | undefined> {
  // Supabase가 설정되지 않았으면 JSON 폴백
  if (!isSupabaseEnabled() || !supabase) {
    console.log(`[events] 📁 JSON에서 "${eventId}" 로드 (Supabase 미설정)`);
    return eventsJson.find((e) => e.id === eventId);
  }

  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (error) {
      console.error(`[events] ${eventId} 조회 실패, JSON 폴백 사용:`, error.message);
      return eventsJson.find((e) => e.id === eventId);
    }

    if (!data) {
      return eventsJson.find((e) => e.id === eventId);
    }

    console.log(`[events] ✅ Supabase에서 "${eventId}" 로드`);
    return mapRowToEvent(data);
  } catch (err) {
    console.error(`[events] ${eventId} 예외 발생, JSON 폴백 사용:`, err);
    return eventsJson.find((e) => e.id === eventId);
  }
}

/**
 * 동기적 이벤트 접근 (기존 코드 호환용)
 * 빌드 타임이나 Supabase 미설정 환경에서 사용
 */
export const events = eventsJson;
