import { NextResponse } from "next/server";
import {
  KakaoRateLimitError,
  searchNearbyConvenienceAndLodging,
  type MapBounds,
  type RoutePoint,
} from "@/lib/kakao-local";

export async function POST(request: Request) {
  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "KAKAO_REST_API_KEY not configured" },
      { status: 500 }
    );
  }

  let body: { routePoints: RoutePoint[]; bounds?: MapBounds };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { routePoints, bounds } = body;
  if (!Array.isArray(routePoints) || routePoints.length === 0) {
    return NextResponse.json(
      { error: "routePoints must be a non-empty array" },
      { status: 400 }
    );
  }

  const validPoints: RoutePoint[] = routePoints
    .filter(
      (p): p is RoutePoint =>
        typeof p === "object" &&
        p != null &&
        typeof p.lat === "number" &&
        typeof p.lng === "number"
    )
    .map((p) => ({
      lat: p.lat,
      lng: p.lng,
      distanceKm: typeof p.distanceKm === "number" ? p.distanceKm : undefined,
    }));

  if (validPoints.length === 0) {
    return NextResponse.json(
      { error: "No valid route points" },
      { status: 400 }
    );
  }

  const validBounds: MapBounds | undefined =
    bounds &&
    typeof bounds.south === "number" &&
    typeof bounds.west === "number" &&
    typeof bounds.north === "number" &&
    typeof bounds.east === "number"
      ? bounds
      : undefined;

  try {
    const places = await searchNearbyConvenienceAndLodging(
      validPoints,
      apiKey,
      validBounds
    );
    return NextResponse.json({ places });
  } catch (err) {
    if (err instanceof KakaoRateLimitError) {
      console.log("[nearby-pois] 429 Kakao Local API quota limit.");
      return NextResponse.json(
        {
          error: "quota_limit",
          message: "API 쿼터 제한에 걸렸습니다. 잠시 후 다시 시도해 주세요.",
        },
        { status: 429 }
      );
    }
    console.error("[nearby-pois]", err);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
