import type { Festival, Story, StoryBranch, Customer, Snack, CalcResult } from '@/types'

export function calcFestivalBonus(
  festival: Festival | null,
  story: Story | null,
  branch: StoryBranch | null,
  customers: Customer[],
  snacks: Snack[],
  festivalPrepared: boolean = false
): CalcResult {
  const details: Record<string, number> = {}

  if (!festival) {
    details['无节令'] = 0
    return { value: 0, details }
  }

  let bonus = 0

  if (story && branch) {
    const tagMatch = branch.tags.filter((t) => festival.preferredTags.includes(t)).length
    const storyMatch = story.tags.filter((t) => festival.preferredTags.includes(t)).length
    const totalTagMatch = tagMatch + storyMatch
    const tagBonus = totalTagMatch * 8
    details['应景书目加成'] = tagBonus
    bonus += tagBonus

    if (story.festivalOnly === festival.id) {
      const exclusiveBonus = 20
      details['节令限定书目'] = exclusiveBonus
      bonus += exclusiveBonus
    }
  }

  const festivalSnackStock = snacks
    .filter((s) => s.festivalOnly === festival.id && s.stock > 0)
    .reduce((sum, s) => sum + s.stock, 0)
  const snackBonus = Math.min(25, festivalSnackStock * 2)
  details['节令茶点加成'] = snackBonus
  bonus += snackBonus

  const audience = customers.filter((c) => c.seatId !== null)
  const festivalPrefCount = audience.filter((c) =>
    festival.preferredTags.some((t) => c.preferenceTags.includes(t))
  ).length
  const crowdBonus = festivalPrefCount * 3
  details['应景宾客加成'] = crowdBonus
  bonus += crowdBonus

  if (festivalPrepared) {
    const prepBonus = 15
    details['押中节令热潮'] = prepBonus
    bonus += prepBonus
  }

  const value = Math.min(100, bonus)
  details['最终值'] = value

  return { value, details }
}

export function calcFestivalSpoilage(
  snacks: Snack[],
  prevFestival: Festival | null,
  currentFestival: Festival | null
): { spoiledSnacks: Snack[]; goldLost: number } {
  const spoiledSnacks: Snack[] = []
  let goldLost = 0

  for (const s of snacks) {
    if (!s.perishable || !s.festivalOnly) continue
    if (s.stock <= 0) continue

    if (prevFestival && prevFestival.id === s.festivalOnly && currentFestival?.id !== s.festivalOnly) {
      const spoiledQty = Math.ceil(s.stock * 0.8)
      const loss = s.cost * spoiledQty
      goldLost += loss
      spoiledSnacks.push({ ...s, stock: Math.max(0, s.stock - spoiledQty) })
    }
  }

  return { spoiledSnacks, goldLost }
}

export function calcMissedFestivalPenalty(
  festival: Festival | null,
  festivalMissed: boolean
): { reputationPenalty: number; details: Record<string, number> } {
  const details: Record<string, number> = {}

  if (!festival || !festivalMissed) {
    return { reputationPenalty: 0, details }
  }

  const reputationPenalty = 5
  details[`${festival.name}错失口碑`] = -reputationPenalty

  return { reputationPenalty, details }
}
