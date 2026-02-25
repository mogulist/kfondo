/**
 * GPX URL을 fetch한 뒤 <trkpt lat="..." lon="..."> 를 파싱해 [lat, lng][] 반환.
 */
export async function fetchGpxAsLatLngs(gpxUrl: string): Promise<[number, number][]> {
  const res = await fetch(gpxUrl);
  if (!res.ok) throw new Error("GPX fetch failed");
  const text = await res.text();
  return parseGpxToLatLngs(text);
}

/**
 * GPX XML 문자열에서 trkpt 추출 → [lat, lng][]
 * lat/lon 순서 무관하게 추출.
 */
export function parseGpxToLatLngs(xml: string): [number, number][] {
  const points: [number, number][] = [];
  const trkptRe = /<trkpt[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = trkptRe.exec(xml)) !== null) {
    const tag = m[0];
    const latMatch = /lat=["']([^"']+)["']/i.exec(tag);
    const lonMatch = /lon=["']([^"']+)["']/i.exec(tag);
    const lat = latMatch ? Number.parseFloat(latMatch[1]) : NaN;
    const lon = lonMatch ? Number.parseFloat(lonMatch[1]) : NaN;
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      points.push([lat, lon]);
    }
  }
  return points;
}
