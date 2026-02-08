import { ImageResponse } from "next/og";
import { getFindByRecordData } from "@/lib/find-by-record-data";
import { RecordCertificatePreview } from "@/components/record-certificate-preview";

export const alt = "기록 인증 | K-Fondo";
export const size = { width: 1080, height: 1350 };
export const contentType = "image/png";

type Props = {
  params: Promise<{
    event: string;
    courseId: string;
    year: string;
    time: string;
  }>;
};

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
  const rankStr = rank != null ? `${rank}` : "-";
  const participantPct =
    percentileByParticipants != null
      ? percentileByParticipants.toFixed(1)
      : "-";
  const finisherPct = percentile != null ? percentile.toFixed(1) : "-";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
        }}
      >
        <RecordCertificatePreview
          year={year}
          eventName={eventName}
          category={category}
          distance={distance}
          elevation={elevation}
          parsedTime={parsedTime}
          rankStr={rankStr}
          participantPct={participantPct}
          finisherPct={finisherPct}
          totalParticipants={totalParticipants}
          finishers={finishers}
          eventDate={eventDate}
        />
      </div>
    ),
    { ...size }
  );
}
