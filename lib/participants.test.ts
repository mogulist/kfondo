import { getEventParticipantTrend } from "./participants";
import { events } from "../events.config";

const yangyangTrend = [
  {
    id: "granfondo",
    name: "그란폰도",
    yearlyData: [
      { year: 2024, registered: 1200, participants: 975, dnf: 172 },
      { year: 2025, registered: 1241, participants: 1011, dnf: 188 },
    ],
  },
  {
    id: "mediofondo",
    name: "메디오폰도",
    yearlyData: [
      { year: 2024, registered: 700, participants: 576, dnf: 143 },
      { year: 2025, registered: 809, participants: 672, dnf: 71 },
    ],
  },
];

const hongcheonTrend = [
  {
    id: "granfondo",
    name: "그란폰도",
    yearlyData: [
      { year: 2022, registered: 3228, participants: 730, dnf: 113 },
      { year: 2023, registered: 2580, participants: 2230, dnf: 144 },
      { year: 2024, registered: 1986, participants: 1607, dnf: 67 },
      { year: 2025, registered: 1876, participants: 1202, dnf: 82 },
    ],
  },
  {
    id: "mediofondo",
    name: "메디오폰도",
    yearlyData: [
      { year: 2022, registered: 772, participants: 161, dnf: 23 },
      { year: 2023, registered: 1350, participants: 1204, dnf: 38 },
      { year: 2024, registered: 1178, participants: 1026, dnf: 38 },
      { year: 2025, registered: 1204, participants: 1051, dnf: 27 },
    ],
  },
];

describe("getEventParticipantTrend", () => {
  it("should return correct trend for Yangyang Granfondo", () => {
    const yangyangEvent = events.find((e) => e.id === "yangyang");
    expect(yangyangEvent).toBeDefined();

    const trend = getEventParticipantTrend(yangyangEvent!);
    expect(trend).toEqual(yangyangTrend);
  });

  it("should return correct trend for Hongcheon Granfondo", () => {
    const hongcheonEvent = events.find((e) => e.id === "hongcheon");
    expect(hongcheonEvent).toBeDefined();

    const trend = getEventParticipantTrend(hongcheonEvent!);
    expect(trend).toEqual(hongcheonTrend);
  });
});
