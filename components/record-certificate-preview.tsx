/**
 * 기록 인증서 미리보기 컴포넌트
 * - opengraph-image.tsx (Satori)와 ShareRecordMenu 모달에서 공통 사용
 * - Satori 호환을 위해 inline style만 사용 (Tailwind X)
 */
export type RecordCertificatePreviewProps = {
  year: string;
  eventName: string;
  category: string;
  distance: string;
  elevation: string;
  parsedTime: string;
  rankStr: string;
  participantPct: string;
  finisherPct: string;
  totalParticipants: number;
  finishers: number;
  eventDate: string;
};

export function RecordCertificatePreview(props: RecordCertificatePreviewProps) {
  const {
    year,
    eventName,
    category,
    distance,
    elevation,
    parsedTime,
    rankStr,
    participantPct,
    finisherPct,
    totalParticipants,
    finishers,
    eventDate,
  } = props;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background:
          "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)",
        position: "relative",
        overflow: "hidden",
        fontFamily: 'SUIT, -apple-system, system-ui, sans-serif',
        display: "flex",
        flexDirection: "column",
        padding: 60,
      }}
    >
      {/* 배경 장식 */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0.1,
          display: "flex",
        }}
      >
        <circle cx="900" cy="200" r="300" fill="#10b981" />
        <circle cx="200" cy="1100" r="250" fill="#34d399" />
        <path
          d="M 800 500 Q 900 600 1000 500 T 1200 500"
          stroke="#10b981"
          strokeWidth="60"
          fill="none"
          opacity="0.3"
        />
      </svg>

      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 헤더 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <div
              style={{
                color: "#10b981",
                fontSize: 32,
                fontWeight: 700,
                letterSpacing: "0.02em",
                display: "flex",
              }}
            >
              kfondo.cc
            </div>
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 28,
              display: "flex",
            }}
          >
            {eventDate}
          </div>
        </div>

        {/* 이벤트 제목 */}
        <div
          style={{
            marginBottom: 30,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: 64,
              color: "#ffffff",
              fontWeight: 700,
              marginBottom: 20,
              lineHeight: 1.1,
              display: "flex",
            }}
          >
            {year}년 {eventName}
          </div>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            {category && (
              <span
                style={{
                  padding: "10px 20px",
                  background: "rgba(16, 185, 129, 0.25)",
                  color: "#6ee7b7",
                  borderRadius: 8,
                  fontSize: 26,
                  fontWeight: 600,
                  display: "flex",
                }}
              >
                {category}
              </span>
            )}
            {distance && (
              <span
                style={{
                  padding: "10px 20px",
                  background: "rgba(16, 185, 129, 0.25)",
                  color: "#6ee7b7",
                  borderRadius: 8,
                  fontSize: 26,
                  fontWeight: 600,
                  display: "flex",
                }}
              >
                {distance}
              </span>
            )}
            {elevation && (
              <span
                style={{
                  padding: "10px 20px",
                  background: "rgba(16, 185, 129, 0.25)",
                  color: "#6ee7b7",
                  borderRadius: 8,
                  fontSize: 26,
                  fontWeight: 600,
                  display: "flex",
                }}
              >
                {elevation}
              </span>
            )}
          </div>
        </div>

        {/* 메인 통계 그리드 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* 완주 기록 */}
          <div
            style={{
              background: "rgba(0, 0, 0, 0.3)",
              borderRadius: 20,
              padding: 40,
              border: "1px solid rgba(16, 185, 129, 0.3)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontSize: 36,
                color: "rgba(255,255,255,0.7)",
                marginBottom: 15,
                fontWeight: 600,
                display: "flex",
              }}
            >
              완주 기록
            </div>
            <div
              style={{
                fontSize: 120,
                color: "#10b981",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                display: "flex",
              }}
            >
              {parsedTime}
            </div>
          </div>

          {/* 순위 */}
          <div
            style={{
              background: "rgba(0, 0, 0, 0.3)",
              borderRadius: 20,
              padding: 40,
              border: "1px solid rgba(16, 185, 129, 0.3)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontSize: 36,
                color: "rgba(255,255,255,0.7)",
                marginBottom: 15,
                fontWeight: 600,
                display: "flex",
              }}
            >
              순위
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 10,
              }}
            >
              <span
                style={{
                  fontSize: 120,
                  color: "#ffffff",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  display: "flex",
                }}
              >
                {rankStr}
              </span>
              <span
                style={{
                  fontSize: 64,
                  color: "#ffffff",
                  fontWeight: 700,
                  lineHeight: 1,
                  display: "flex",
                }}
              >
                위
              </span>
            </div>
          </div>

          {/* 퍼센타일 그리드 */}
          <div
            style={{
              display: "flex",
              gap: 20,
            }}
          >
            <div
              style={{
                flex: 1,
                background: "rgba(0, 0, 0, 0.3)",
                borderRadius: 20,
                padding: 40,
                border: "1px solid rgba(16, 185, 129, 0.3)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  fontSize: 32,
                  color: "rgba(255,255,255,0.7)",
                  marginBottom: 15,
                  fontWeight: 600,
                  display: "flex",
                }}
              >
                참가자 기준
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 8,
                  marginBottom: 15,
                }}
              >
                <span
                  style={{
                    fontSize: 100,
                    color: "#ffffff",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    display: "flex",
                  }}
                >
                  {participantPct}
                </span>
                <span
                  style={{
                    fontSize: 56,
                    color: "#ffffff",
                    fontWeight: 700,
                    display: "flex",
                  }}
                >
                  %
                </span>
              </div>
              <div
                style={{
                  fontSize: 28,
                  color: "rgba(255,255,255,0.6)",
                  display: "flex",
                }}
              >
                {totalParticipants.toLocaleString()}명 기준
              </div>
            </div>

            <div
              style={{
                flex: 1,
                background: "rgba(0, 0, 0, 0.3)",
                borderRadius: 20,
                padding: 40,
                border: "1px solid rgba(16, 185, 129, 0.3)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  fontSize: 32,
                  color: "rgba(255,255,255,0.7)",
                  marginBottom: 15,
                  fontWeight: 600,
                  display: "flex",
                }}
              >
                완주자 기준
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 8,
                  marginBottom: 15,
                }}
              >
                <span
                  style={{
                    fontSize: 100,
                    color: "#10b981",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    display: "flex",
                  }}
                >
                  {finisherPct}
                </span>
                <span
                  style={{
                    fontSize: 56,
                    color: "#10b981",
                    fontWeight: 700,
                    display: "flex",
                  }}
                >
                  %
                </span>
              </div>
              <div
                style={{
                  fontSize: 28,
                  color: "rgba(255,255,255,0.6)",
                  display: "flex",
                }}
              >
                {finishers.toLocaleString()}명 기준
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
