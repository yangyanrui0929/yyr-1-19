import type {
  Customer,
  Story,
  StoryBranch,
  Seat,
  Renovation,
  StoryRecord,
  SettlementResult,
  Snack,
  Festival,
} from '@/types'
import { calcAvgTasteMatch } from './tasteMatch'
import { calcAvgSeatView } from './seatView'
import { calcStoryHeat } from './storyHeat'
import { calcSerialExpect } from './serialExpect'
import { calcBadReview, calcBadReviewGold } from './badReview'
import { calcFestivalBonus, calcMissedFestivalPenalty } from './festivalBonus'
import { SEAT_PRICE_MULTIPLIER } from '@/data/seats'

export function calcSettlement(
  day: number,
  story: Story,
  branch: StoryBranch,
  customers: Customer[],
  seats: Seat[],
  renovations: Renovation[],
  history: StoryRecord[],
  lastStoryDay: Record<string, number>,
  storyScores: Record<string, number[]>,
  reputation: number,
  snacks: Snack[],
  festival: Festival | null,
  festivalPrepared: boolean = false
): SettlementResult {
  const audience = customers.filter((c) => c.seatId !== null)
  const audienceCount = audience.length

  const taste = calcAvgTasteMatch(audience, branch)
  const view = calcAvgSeatView(seats, renovations)
  const heat = calcStoryHeat(story, branch, history, reputation)
  const expect = calcSerialExpect(story.id, day, lastStoryDay, storyScores)
  const badReview = calcBadReview(customers, reputation)

  let baseEarnings = 0
  for (const c of audience) {
    const seat = seats.find((s) => s.id === c.seatId)
    const seatMul = seat ? SEAT_PRICE_MULTIPLIER[seat.tier] : 1
    baseEarnings += Math.round(5 * seatMul)
  }

  const tasteMatchBonus = Math.round(baseEarnings * (taste.value / 100) * 0.8)
  const seatViewBonus = Math.round(baseEarnings * (view.value / 100) * 0.5)
  const storyHeatBonus = Math.round(baseEarnings * (heat.value / 100) * 0.7)
  const serialExpectBonus = Math.round(baseEarnings * (expect.value / 100) * 0.4)

  let tips = 0
  for (const c of audience) {
    const satFactor = c.satisfaction / 100
    const genFactor = c.generosity / 5
    tips += Math.round(c.wealth * satFactor * genFactor * 0.15)
  }

  const badReviewPenalty = calcBadReviewGold(customers)

  let snackRevenue = 0
  const consumedSnacks: Record<string, number> = {}
  for (const c of audience) {
    let buyChance = 0.6
    if (festival) {
      const festTagMatch = festival.preferredTags.some(
        (t) => c.preferenceTags.includes(t)
      )
      if (festTagMatch) buyChance += 0.15
    }
    if (c.satisfaction > 50 && Math.random() < buyChance) {
      const available = snacks.filter((s) => s.stock > 0)
      if (available.length > 0) {
        const weightedAvailable: Snack[] = []
        for (const s of available) {
          const demandMul = festival?.snackDemandMul?.[s.category] ?? 1
          const festivalOnlyBonus = s.festivalOnly === festival?.id ? 2.5 : 1
          const weight = Math.round(demandMul * festivalOnlyBonus)
          for (let i = 0; i < weight; i++) {
            weightedAvailable.push(s)
          }
        }
        const s = weightedAvailable[Math.floor(Math.random() * weightedAvailable.length)]
        snackRevenue += s.price - s.cost
        consumedSnacks[s.id] = (consumedSnacks[s.id] || 0) + 1
      }
    }
  }
  for (const [id, n] of Object.entries(consumedSnacks)) {
    const s = snacks.find((x) => x.id === id)
    if (s) s.stock = Math.max(0, s.stock - n)
  }

  const festivalBonusCalc = calcFestivalBonus(festival, story, branch, customers, snacks, festivalPrepared)
  const festivalBonus = Math.round(baseEarnings * (festivalBonusCalc.value / 100) * 1.5)

  const missedPenalty = calcMissedFestivalPenalty(festival, false)

  const totalEarnings =
    baseEarnings +
    tasteMatchBonus +
    seatViewBonus +
    storyHeatBonus +
    serialExpectBonus +
    tips +
    snackRevenue +
    festivalBonus -
    badReviewPenalty

  const avgSatisfaction =
    audience.length > 0
      ? Math.round(audience.reduce((s, c) => s + c.satisfaction, 0) / audience.length)
      : 0

  const satisfactionDelta = Math.round((avgSatisfaction - 50) * 0.15)
  const heatDelta = Math.round((heat.value - 50) * 0.1)
  const badReviewDelta = -badReview.value
  let festivalRepDelta = 0
  if (festival && festivalPrepared) {
    festivalRepDelta = 4
  }
  if (missedPenalty.reputationPenalty > 0) {
    festivalRepDelta -= missedPenalty.reputationPenalty
  }
  const reputationDelta = satisfactionDelta + heatDelta + badReviewDelta + festivalRepDelta

  return {
    day,
    audienceCount,
    baseEarnings,
    tasteMatchBonus,
    seatViewBonus,
    storyHeatBonus,
    serialExpectBonus,
    badReviewPenalty,
    tips,
    snackRevenue,
    festivalBonus,
    totalEarnings,
    reputationDelta,
    avgSatisfaction,
  }
}
