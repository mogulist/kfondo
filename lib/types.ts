export interface Event {
  id: string
  location: string
  years: number[]
  color?: {
    from: string
    to: string
  }
  latestEvent?: {
    date: string
    granFondo: {
      distance: number
      elevation: number
    }
    medioFondo: {
      distance: number
      elevation: number
    }
  }
  status?: "ready"
}

export interface EventYearData {
  year: number
  granFondoRegistered: number
  granFondoParticipants: number
  medioFondoRegistered: number
  medioFondoParticipants: number
}

export interface TimeDistribution {
  timeRange: string
  participants: number
  percentile: number
}

export interface EventYearStats {
  year: number
  granFondoDistribution: TimeDistribution[]
  medioFondoDistribution: TimeDistribution[]
}
