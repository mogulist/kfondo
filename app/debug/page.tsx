import { getEventById } from "@/lib/db/events";
import { getYearStatsWithCourses } from "@/lib/stats";
import path from "path";

export const dynamic = "force-dynamic";

export default async function DebugPage() {
  const results: any = {
    timestamp: new Date().toISOString(),
    env: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
    },
  };

  try {
    // 1. 이벤트 가져오기
    const event = await getEventById("seorak");
    results.event = {
      found: !!event,
      name: event?.name,
      years: event?.years,
      year2025Detail: event?.yearDetails[2025] ? {
        recordsBlobUrl: event.yearDetails[2025].recordsBlobUrl,
        sortedRecordsBlobUrl: event.yearDetails[2025].sortedRecordsBlobUrl,
      } : null,
    };

    if (event) {
      // 2. Blob URL에서 직접 fetch 시도
      const blobUrl = event.yearDetails[2025]?.recordsBlobUrl;
      if (blobUrl) {
        try {
          const response = await fetch(blobUrl);
          results.blobFetch = {
            url: blobUrl,
            status: response.status,
            ok: response.ok,
            dataLength: response.ok ? (await response.json()).length : 0,
          };
        } catch (error: any) {
          results.blobFetch = {
            url: blobUrl,
            error: error.message,
          };
        }
      }

      // 3. getYearStatsWithCourses 호출
      try {
        const dataDir = path.join(process.cwd(), "data");
        const stats = await getYearStatsWithCourses(event, dataDir);
        results.stats = {
          yearsCount: stats.length,
          year2025: stats.find(s => s.year === 2025) ? {
            distributionsCount: stats.find(s => s.year === 2025)!.distributions.length,
          } : null,
        };
      } catch (error: any) {
        results.stats = {
          error: error.message,
          stack: error.stack,
        };
      }
    }
  } catch (error: any) {
    results.error = {
      message: error.message,
      stack: error.stack,
    };
  }

  return (
    <div style={{ padding: "20px", fontFamily: "monospace", fontSize: "12px" }}>
      <h1>🔍 Debug Info</h1>
      <pre style={{ background: "#f5f5f5", padding: "10px", overflow: "auto" }}>
        {JSON.stringify(results, null, 2)}
      </pre>
    </div>
  );
}
