/**
 * 카카오 Local API - 경로 주변 보급소·숙소 검색
 * 서버에서만 사용. KAKAO_REST_API_KEY 필요.
 */

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
const MAX_SAMPLE_POINTS = 20;
const SEARCH_RADIUS_M = 1000;
const API_BASE = "https://dapi.kakao.com/v2/local/search/category.json";

const CONVENIENCE_CODE = "CS2";
const LODGING_CODE = "AD5";

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
 * 경로 샘플 점들에서 편의점·숙박 검색 후 id 기준 중복 제거하여 반환.
 */
export async function searchNearbyConvenienceAndLodging(
  routePoints: RoutePoint[],
  apiKey: string
): Promise<KakaoLocalPlace[]> {
  const samplePoints = sampleRoutePoints(routePoints);
  if (samplePoints.length === 0) return [];

  const seen = new Set<string>();
  const results: KakaoLocalPlace[] = [];

  const categories = [CONVENIENCE_CODE, LODGING_CODE];

  for (const { lat, lng } of samplePoints) {
    for (const code of categories) {
      try {
        const places = await searchCategoryAtPoint(
          apiKey,
          lng,
          lat,
          code
        );
        for (const p of places) {
          if (!seen.has(p.id)) {
            seen.add(p.id);
            results.push(p);
          }
        }
      } catch (e) {
        console.warn("[kakao-local] category search failed:", code, e);
      }
    }
  }

  return results;
}
