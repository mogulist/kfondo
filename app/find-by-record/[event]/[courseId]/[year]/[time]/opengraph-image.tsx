import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getFindByRecordData } from "@/lib/find-by-record-data";
import { RecordOGImageLandscape } from "@/components/record-og-image-landscape";

export const alt = "기록 인증 | K-Fondo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{
    event: string;
    courseId: string;
    year: string;
    time: string;
  }>;
};

async function loadLocalFont(filename: string) {
  const fontPath = join(process.cwd(), "public", "fonts", filename);
  const buffer = await readFile(fontPath);
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

export default async function Image(props: Props) {
  const { event: eventId, courseId, year, time } = await props.params;
  const data = await getFindByRecordData(eventId, courseId, year, time);
  if (!data) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#064e3b",
            color: "#a7f3d0",
            fontSize: 32,
          }}
        >
          기록을 찾을 수 없습니다
        </div>
      ),
      { ...size }
    );
  }

  const {
    event,
    parsedTime,
    rank,
    percentile,
    percentileByParticipants,
    totalParticipants,
    finishers,
    courseInfo,
    eventDate,
  } = data;

  const eventName = event.name || `${event.location} 그란폰도`;
  const category = courseInfo?.name ?? "";
  const distance = courseInfo ? `${courseInfo.distance}km` : "";
  const elevation = courseInfo ? `${courseInfo.elevation}m` : "";
  const participantPct =
    percentileByParticipants != null
      ? percentileByParticipants.toFixed(1)
      : "-";
  const finisherPct = percentile != null ? percentile.toFixed(1) : "-";

  // SUIT 폰트 로드 (로컬 파일) - Bold보다 한 단계 두꺼운 Heavy 추가
  const [fontBold, fontExtraBold, fontHeavy] = await Promise.all([
    loadLocalFont("SUIT-Bold.otf"),
    loadLocalFont("SUIT-ExtraBold.otf"),
    loadLocalFont("SUIT-Heavy.otf"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
        }}
      >
        <RecordOGImageLandscape
          year={year}
          eventName={eventName}
          category={category}
          distance={distance}
          elevation={elevation}
          record={parsedTime}
          rank={rank}
          participantPct={participantPct}
          finisherPct={finisherPct}
          totalParticipants={totalParticipants}
          finishers={finishers}
          eventDate={eventDate}
        />
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "SUIT",
          data: fontBold,
          weight: 700 as const,
          style: "normal" as const,
        },
        {
          name: "SUIT",
          data: fontExtraBold,
          weight: 800 as const,
          style: "normal" as const,
        },
        {
          name: "SUIT",
          data: fontHeavy,
          weight: 900 as const,
          style: "normal" as const,
        },
      ],
    }
  );
}
