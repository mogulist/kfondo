import { NextResponse } from "next/server";
import {
  searchNearbyConvenienceAndLodging,
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

  let body: { routePoints: RoutePoint[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { routePoints } = body;
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

  try {
    const places = await searchNearbyConvenienceAndLodging(validPoints, apiKey);
    return NextResponse.json({ places });
  } catch (err) {
    console.error("[nearby-pois]", err);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
