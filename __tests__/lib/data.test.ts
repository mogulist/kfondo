import { events, getEventData } from "../../events.config";
import { calculateParticipants, calculateDNF } from "../../lib/participants";
import { GranMedio } from "../../lib/types";

describe("calculateParticipants", () => {
  it("should calculate participants for Hongcheon 2025", () => {
    const year = 2025;
    const expected: GranMedio = {
      granfondo: 1202,
      mediofondo: 1051,
    };
    const actual = calculateParticipants("hongcheon", year);
    expect(actual).toEqual(expected);
  });

  it("should calculate participants for Hongcheon 2024", () => {
    const year = 2024;
    const expected: GranMedio = {
      granfondo: 1607,
      mediofondo: 1026,
    };
    const actual = calculateParticipants("hongcheon", year);
    expect(actual).toEqual(expected);
  });

  it("should calculate participants for Hongcheon 2023", () => {
    const year = 2023;
    const expected: GranMedio = {
      granfondo: 2230,
      mediofondo: 1204,
    };
    const actual = calculateParticipants("hongcheon", year);
    expect(actual).toEqual(expected);
  });

  it("should calculate participants for Yangyang 2025", () => {
    const year = 2025;
    const expected: GranMedio = {
      granfondo: 1011,
      mediofondo: 672,
    };
    const actual = calculateParticipants("yangyang", year);
    expect(actual).toEqual(expected);
  });

  it("should calculate participants for Yangyang 2024", () => {
    const year = 2024;
    const expected: GranMedio = {
      granfondo: 975,
      mediofondo: 576,
    };
    const actual = calculateParticipants("yangyang", year);
    expect(actual).toEqual(expected);
  });
});

describe("calculateDNF", () => {
  it("should calculate DNF for Hongcheon 2025", () => {
    const year = 2025;
    const expected: GranMedio = {
      granfondo: 82,
      mediofondo: 27,
    };
    const actual = calculateDNF("hongcheon", year);
    expect(actual).toEqual(expected);
  });

  it("should calculate DNF for Hongcheon 2024", () => {
    const year = 2024;
    const expected: GranMedio = {
      granfondo: 67,
      mediofondo: 38,
    };
    const actual = calculateDNF("hongcheon", year);
    expect(actual).toEqual(expected);
  });

  it("should calculate DNF for Hongcheon 2023", () => {
    const year = 2023;
    const expected: GranMedio = {
      granfondo: 144,
      mediofondo: 38,
    };
    const actual = calculateDNF("hongcheon", year);
    expect(actual).toEqual(expected);
  });

  it("should calculate DNF for Yangyang 2025", () => {
    const year = 2025;
    const expected: GranMedio = {
      granfondo: 190,
      mediofondo: 76,
    };
    const actual = calculateDNF("yangyang", year);
    expect(actual).toEqual(expected);
  });

  it("should calculate DNF for Yangyang 2024", () => {
    const year = 2024;
    const expected: GranMedio = {
      granfondo: 172,
      mediofondo: 143,
    };
    const actual = calculateDNF("yangyang", year);
    expect(actual).toEqual(expected);
  });
});
