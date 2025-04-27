export interface Event {
  id: string
  location: string
  years: number[]
  color?: {
    from: string
    to: string
  }
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
