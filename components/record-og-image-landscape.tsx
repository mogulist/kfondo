/**
 * 기록 찾기 OG 이미지 - Landscape (1200×630)
 * SNS 공유용. Figma CleanGridOG_CenterFocus_v3 디자인 참고.
 * Satori 호환: inline style만 사용, 수치는 number.
 */
export type RecordOGImageLandscapeProps = {
  year: string;
  eventName: string;
  category: string;
  distance: string;
  elevation: string;
  record: string;
  rank: number | null;
  participantPct: string;
  finisherPct: string;
  totalParticipants: number;
  finishers: number;
  eventDate: string;
};

export function RecordOGImageLandscape(props: RecordOGImageLandscapeProps) {
  const {
    year,
    eventName,
    category,
    distance,
    elevation,
    record,
    rank,
    participantPct,
    finisherPct,
    totalParticipants,
    finishers,
    eventDate,
  } = props;

  const rankStr = rank != null ? String(rank) : "-";

  return (
    <div
      style={{
        width: 1200,
        height: 630,
        background:
          "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)",
        position: "relative",
        overflow: "hidden",
        fontFamily: "SUIT, -apple-system, system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        paddingTop: 40,
        paddingBottom: 40,
        paddingLeft: 60,
        paddingRight: 60,
      }}
    >
      {/* 배경 장식 - div 원 (Satori/브라우저 동일 렌더링) */}
      <div
        style={{
          position: "absolute",
          top: 315 - 400,
          left: 600 - 400,
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "#10b981",
          opacity: 0.08,
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 100 - 150,
          left: 100 - 150,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "#34d399",
          opacity: 0.08,
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 530 - 150,
          left: 1100 - 150,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "#34d399",
          opacity: 0.08,
          display: "flex",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* 상단: 브랜드 & 이벤트 */}
        <div style={{ marginBottom: 30, display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 15,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <svg
                width={36}
                height={36}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#10b981"
                strokeWidth={2.5}
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <div
                style={{
                  color: "#10b981",
                  fontSize: 28,
                  fontWeight: 800,
                  letterSpacing: "0.02em",
                }}
              >
                kfondo.cc
              </div>
            </div>
            <div
              style={{
                fontSize: 20,
                color: "rgba(255,255,255,0.7)",
                fontWeight: 700,
              }}
            >
              {eventDate}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 52,
                color: "#ffffff",
                fontWeight: 800,
                lineHeight: 1.1,
              }}
            >
              {year}년 {eventName}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {category && (
                <span
                  style={{
                    padding: "8px 18px",
                    background: "rgba(16, 185, 129, 0.25)",
                    color: "#6ee7b7",
                    borderRadius: 8,
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  {category}
                </span>
              )}
              {distance && (
                <span
                  style={{
                    padding: "8px 18px",
                    background: "rgba(16, 185, 129, 0.25)",
                    color: "#6ee7b7",
                    borderRadius: 8,
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  {distance}
                </span>
              )}
              {elevation && (
                <span
                  style={{
                    padding: "8px 18px",
                    background: "rgba(16, 185, 129, 0.25)",
                    color: "#6ee7b7",
                    borderRadius: 8,
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  {elevation}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 중앙: 메인 기록 */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 30,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "rgba(0, 0, 0, 0.3)",
              borderRadius: 20,
              paddingTop: 40,
              paddingBottom: 40,
              paddingLeft: 80,
              paddingRight: 80,
              border: "2px solid rgba(16, 185, 129, 0.4)",
            }}
          >
            <div
              style={{
                fontSize: 24,
                color: "rgba(255,255,255,0.7)",
                marginBottom: 15,
                fontWeight: 700,
              }}
            >
              완주 기록
            </div>
            <div
              style={{
                fontSize: 110,
                color: "#10b981",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              {record}
            </div>
          </div>
        </div>

        {/* 하단: 순위 & 퍼센타일 */}
        <div style={{ display: "flex", gap: 20 }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              background: "rgba(0, 0, 0, 0.3)",
              borderRadius: 16,
              paddingTop: 25,
              paddingBottom: 25,
              paddingLeft: 30,
              paddingRight: 30,
              border: "1px solid rgba(16, 185, 129, 0.3)",
            }}
          >
            <div
              style={{
                fontSize: 18,
                color: "rgba(255,255,255,0.7)",
                marginBottom: 8,
                fontWeight: 700,
              }}
            >
              순위
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 6,
              }}
            >
              <span
                style={{
                  fontSize: 56,
                  color: "#ffffff",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                {rankStr}
              </span>
              <span
                style={{
                  fontSize: 32,
                  color: "#ffffff",
                  fontWeight: 700,
                }}
              >
                위
              </span>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              background: "rgba(0, 0, 0, 0.3)",
              borderRadius: 16,
              paddingTop: 25,
              paddingBottom: 25,
              paddingLeft: 30,
              paddingRight: 30,
              border: "1px solid rgba(16, 185, 129, 0.3)",
            }}
          >
            <div
              style={{
                fontSize: 18,
                color: "rgba(255,255,255,0.7)",
                marginBottom: 8,
                fontWeight: 700,
              }}
            >
              참가자 기준
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 6,
              }}
            >
              <span
                style={{
                  fontSize: 56,
                  color: "#ffffff",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                {participantPct}
              </span>
              <span
                style={{
                  fontSize: 32,
                  color: "#ffffff",
                  fontWeight: 700,
                }}
              >
                %
              </span>
              <span
                style={{
                  fontSize: 16,
                  color: "rgba(255,255,255,0.6)",
                  fontWeight: 700,
                  marginLeft: 8,
                }}
              >
                ({totalParticipants.toLocaleString()}명)
              </span>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              background: "rgba(0, 0, 0, 0.3)",
              borderRadius: 16,
              paddingTop: 25,
              paddingBottom: 25,
              paddingLeft: 30,
              paddingRight: 30,
              border: "1px solid rgba(16, 185, 129, 0.4)",
            }}
          >
            <div
              style={{
                fontSize: 18,
                color: "rgba(255,255,255,0.7)",
                marginBottom: 8,
                fontWeight: 700,
              }}
            >
              완주자 기준
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 6,
              }}
            >
              <span
                style={{
                  fontSize: 56,
                  color: "#10b981",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                {finisherPct}
              </span>
              <span
                style={{
                  fontSize: 32,
                  color: "#10b981",
                  fontWeight: 700,
                }}
              >
                %
              </span>
              <span
                style={{
                  fontSize: 16,
                  color: "rgba(255,255,255,0.6)",
                  fontWeight: 700,
                  marginLeft: 8,
                }}
              >
                ({finishers.toLocaleString()}명)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
