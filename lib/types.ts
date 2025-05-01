export interface Event {
  id: string;
  location: string;
  years: number[];
  color?: {
    from: string;
    to: string;
  };
  latestEvent?: {
    date: string;
    granFondo: {
      distance: number;
      elevation: number;
    };
    medioFondo: {
      distance: number;
      elevation: number;
    };
  };
  status?: "ready";
  meta: {
    title: string;
    description: string;
    image: string;
  };
}

export interface EventYearData {
  year: number;
  granFondoRegistered: number;
  granFondoParticipants: number;
  medioFondoRegistered: number;
  medioFondoParticipants: number;
  granFondoDNF?: number;
  medioFondoDNF?: number;
}

export type GranMedio = {
  granfondo: number;
  mediofondo: number;
};

export type EventYearInitial = {
  year: number;
  registered: GranMedio;
  participants?: GranMedio;
  dnf?: GranMedio;
};

export type EventYear = {
  year: number;
  registered: GranMedio;
  participants: GranMedio;
  dnf: GranMedio;
};

export interface TimeDistribution {
  timeRange: string;
  participants: number;
  percentile: number;
}

export interface EventYearStats {
  year: number;
  granFondoDistribution: TimeDistribution[];
  medioFondoDistribution: TimeDistribution[];
}
