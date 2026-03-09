/**
 * 카카오 Local API - 경로 주변 보급소·숙소 검색
 * 서버에서만 사용. KAKAO_REST_API_KEY 필요.
 *
 * Rate limit (429): 테스트앱은 별도 쿼터 적용. 일간 쿼터 초과 시 429,
 * 해제는 다음 날 자정(UTC) 쿼터 초기화 후. 프로덕션 카테고리 검색 일 10만 건 등.
 */

export class KakaoRateLimitError extends Error {
  readonly statusCode = 429;
  constructor() {
    super("Kakao Local API rate limit (429)");
    this.name = "KakaoRateLimitError";
  }
}

export type RoutePoint = { lat: number; lng: number; distanceKm?: number };

export type KakaoLocalPlace = {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name?: string;
  x: string;
  y: string;
  category_group_code: string;
};

const SAMPLE_INTERVAL_KM = 5;
const MAX_SAMPLE_POINTS = 10;
const SEARCH_RADIUS_M = 1000;
/** 카카오 Local API 429 방지: 호출 간 최소 간격(ms) */
const API_CALL_DELAY_MS = 350;
const API_BASE = "https://dapi.kakao.com/v2/local/search/category.json";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const LODGING_CODE = "AD5";

/** 지도 뷰포트 범위 (남·서·북·동). 이 범위 내 샘플 포인트만 검색에 사용 */
export type MapBounds = {
  south: number;
  west: number;
  north: number;
  east: number;
};

function isInBounds(lat: number, lng: number, b: MapBounds): boolean {
  return lat >= b.south && lat <= b.north && lng >= b.west && lng <= b.east;
}

/**
 * routePoints를 거리 기준으로 샘플링. intervalKm 간격, 최대 maxPoints개.
 * distanceKm가 없으면 균등 인덱스 샘플링.
 */
export function sampleRoutePoints(
  routePoints: RoutePoint[],
  intervalKm = SAMPLE_INTERVAL_KM,
  maxPoints = MAX_SAMPLE_POINTS
): { lat: number; lng: number }[] {
  if (routePoints.length === 0) return [];
  const hasDistance = routePoints.some((p) => p.distanceKm != null);
  if (!hasDistance) {
    const step = Math.max(1, Math.floor(routePoints.length / maxPoints));
    const indices = [0];
    for (let i = step; i < routePoints.length - 1 && indices.length < maxPoints; i += step) {
      indices.push(i);
    }
    if (routePoints.length > 1 && indices[indices.length - 1] !== routePoints.length - 1) {
      indices.push(routePoints.length - 1);
    }
    return indices.map((i) => ({ lat: routePoints[i].lat, lng: routePoints[i].lng }));
  }
  const points: { lat: number; lng: number }[] = [];
  points.push({ lat: routePoints[0].lat, lng: routePoints[0].lng });
  let nextTargetKm = intervalKm;
  for (let i = 1; i < routePoints.length && points.length < maxPoints; i++) {
    const p = routePoints[i];
    const dist = p.distanceKm ?? 0;
    if (dist >= nextTargetKm) {
      points.push({ lat: p.lat, lng: p.lng });
      nextTargetKm += intervalKm;
    }
  }
  if (routePoints.length > 1 && points.length < maxPoints) {
    const last = routePoints[routePoints.length - 1];
    const lastAdded = points[points.length - 1];
    if (last.lat !== lastAdded.lat || last.lng !== lastAdded.lng) {
      points.push({ lat: last.lat, lng: last.lng });
    }
  }
  return points;
}

type KakaoCategoryResponse = {
  documents: Array<{
    id: string;
    place_name: string;
    address_name: string;
    road_address_name?: string;
    x: string;
    y: string;
    category_group_code: string;
  }>;
};

async function searchCategoryAtPoint(
  apiKey: string,
  lng: number,
  lat: number,
  categoryGroupCode: string,
  radius = SEARCH_RADIUS_M
): Promise<KakaoLocalPlace[]> {
  const params = new URLSearchParams({
    category_group_code: categoryGroupCode,
    x: String(lng),
    y: String(lat),
    radius: String(radius),
    sort: "distance",
  });
  const res = await fetch(`${API_BASE}?${params}`, {
    headers: { Authorization: `KakaoAK ${apiKey}` },
  });
  if (res.status === 429) {
    throw new KakaoRateLimitError();
  }
  if (!res.ok) {
    throw new Error(`Kakao Local API error: ${res.status}`);
  }
  const data = (await res.json()) as KakaoCategoryResponse;
  return (data.documents ?? []).map((d) => ({
    id: d.id,
    place_name: d.place_name,
    address_name: d.address_name,
    road_address_name: d.road_address_name,
    x: d.x,
    y: d.y,
    category_group_code: d.category_group_code,
  }));
}

/**
 * 경로 샘플 점들에서 숙박(AD5)만 검색 후 id 기준 중복 제거하여 반환.
 * bounds를 주면 뷰포트 안에 있는 샘플 포인트만 사용한다.
 */
export async function searchNearbyConvenienceAndLodging(
  routePoints: RoutePoint[],
  apiKey: string,
  bounds?: MapBounds
): Promise<KakaoLocalPlace[]> {
  let samplePoints = sampleRoutePoints(routePoints);
  if (samplePoints.length === 0) return [];

  if (bounds) {
    samplePoints = samplePoints.filter((p) => isInBounds(p.lat, p.lng, bounds));
    if (samplePoints.length === 0) return [];
  }

  const seen = new Set<string>();
  const results: KakaoLocalPlace[] = [];

  for (const { lat, lng } of samplePoints) {
    await sleep(API_CALL_DELAY_MS);
    try {
      const places = await searchCategoryAtPoint(
        apiKey,
        lng,
        lat,
        LODGING_CODE
      );
      for (const p of places) {
        if (!seen.has(p.id)) {
          seen.add(p.id);
          results.push(p);
        }
      }
    } catch (e) {
      if (e instanceof KakaoRateLimitError) {
        console.log("[kakao-local] 429 Too Many Requests (quota limit). Stopped.");
        throw e;
      }
      console.warn("[kakao-local] category search failed:", LODGING_CODE, e);
    }
  }

  return results;
}
