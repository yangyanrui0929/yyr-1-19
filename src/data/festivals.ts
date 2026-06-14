import type { Festival, FestivalId, Snack, Story } from '@/types'

export const FESTIVAL_CYCLE = 30

export const FESTIVALS: Festival[] = [
  {
    id: 'qingming',
    name: '清明',
    emoji: '🌧️',
    dayInCycle: 5,
    cycleLength: FESTIVAL_CYCLE,
    customerBonus: 4,
    snackDemandMul: { '茶': 1.5, '点心': 1.3 },
    preferredTags: ['思亲', '神怪', '婉约', '诗词'],
    description: '清明时节雨纷纷，路上行人欲断魂。客人们思念故人，爱听鬼怪灵异、追忆往昔的故事。',
  },
  {
    id: 'zhongqiu',
    name: '中秋',
    emoji: '🌕',
    dayInCycle: 13,
    cycleLength: FESTIVAL_CYCLE,
    customerBonus: 5,
    snackDemandMul: { '点心': 2.0, '茶': 1.2 },
    preferredTags: ['团圆', '爱情', '才子佳人', '婉约'],
    description: '月圆人团圆，中秋佳节宾客盈门。大家爱听花好月圆、才子佳人的故事。',
  },
  {
    id: 'chongyang',
    name: '重阳',
    emoji: '🍁',
    dayInCycle: 21,
    cycleLength: FESTIVAL_CYCLE,
    customerBonus: 3,
    snackDemandMul: { '茶': 1.8, '小吃': 1.4 },
    preferredTags: ['义气', '武侠', '江湖', '励志'],
    description: '重阳登高望远，豪情万丈。江湖人士齐聚，偏爱侠义忠勇的英雄故事。',
  },
  {
    id: 'laba',
    name: '腊八',
    emoji: '🍲',
    dayInCycle: 28,
    cycleLength: FESTIVAL_CYCLE,
    customerBonus: 3,
    snackDemandMul: { '小吃': 1.6, '点心': 1.4 },
    preferredTags: ['世情', '励志', '历史', '谋略'],
    description: '腊八熬粥济贫，人间冷暖尽在其中。客人们爱听世态炎凉、发奋图强的故事。',
  },
]

export function getFestivalByDay(day: number): Festival | null {
  const dayInCycle = ((day - 1) % FESTIVAL_CYCLE) + 1
  return FESTIVALS.find((f) => f.dayInCycle === dayInCycle) ?? null
}

export function getUpcomingFestival(day: number): Festival | null {
  const dayInCycle = ((day - 1) % FESTIVAL_CYCLE) + 1
  let best: Festival | null = null
  let bestDist = Infinity
  for (const f of FESTIVALS) {
    const dist = f.dayInCycle > dayInCycle
      ? f.dayInCycle - dayInCycle
      : f.dayInCycle + FESTIVAL_CYCLE - dayInCycle
    if (dist > 0 && dist < bestDist) {
      bestDist = dist
      best = f
    }
  }
  return best
}

export const FESTIVAL_SNACKS: (Omit<Snack, 'stock'> & { festivalOnly: FestivalId; perishable: boolean })[] = [
  {
    id: 'qingtuan',
    name: '青团',
    category: '点心',
    maxStock: 30,
    price: 10,
    cost: 5,
    quality: 4,
    emoji: '🟢',
    festivalOnly: 'qingming',
    perishable: true,
  },
  {
    id: 'yuebing',
    name: '中秋月饼',
    category: '点心',
    maxStock: 25,
    price: 15,
    cost: 7,
    quality: 5,
    emoji: '🥮',
    festivalOnly: 'zhongqiu',
    perishable: true,
  },
  {
    id: 'juhuacha',
    name: '菊花茶',
    category: '茶',
    maxStock: 40,
    price: 12,
    cost: 6,
    quality: 4,
    emoji: '🌼',
    festivalOnly: 'chongyang',
    perishable: true,
  },
  {
    id: 'labazhou',
    name: '腊八粥',
    category: '小吃',
    maxStock: 50,
    price: 8,
    cost: 3,
    quality: 3,
    emoji: '🍲',
    festivalOnly: 'laba',
    perishable: true,
  },
]

export const FESTIVAL_STORIES: Story[] = [
  {
    id: 'fq1',
    title: '清明·幽冥录',
    tags: ['神怪', '思亲', '灵异', '婉约'],
    heat: 95,
    summary: '清明夜半，书生焚纸祭祖，忽见亡妻魂归来，人鬼情未了',
    festivalOnly: 'qingming',
    branches: [
      {
        id: 'fq1-b1',
        title: '第一夜：纸钱化蝶',
        content: '清明之夜，书生张继在坟前烧纸，忽见纸钱化为蝴蝶纷飞，一白衣女子自烟中缓缓走来...',
        tags: ['神怪', '思亲'],
        heatModifier: 15,
      },
      {
        id: 'fq1-b2',
        title: '第一夜：亡妻归途',
        content: '月色朦胧，亡妻的魂魄循着熟悉的路回到家中，看着熟睡的孩子泪如雨下...',
        tags: ['思亲', '婉约'],
        heatModifier: 12,
      },
    ],
  },
  {
    id: 'fz1',
    title: '中秋·嫦娥奔月',
    tags: ['神怪', '团圆', '爱情', '婉约'],
    heat: 95,
    summary: '后羿射日立功，嫦娥误食仙药飞升，夫妻月宫人间两相望',
    festivalOnly: 'zhongqiu',
    branches: [
      {
        id: 'fz1-b1',
        title: '第一折：月下相会',
        content: '中秋之夜，后羿望月思念嫦娥，忽见月中人影挥袖，原来是嫦娥托梦，约他月宫一会...',
        tags: ['团圆', '爱情'],
        heatModifier: 18,
      },
      {
        id: 'fz1-b2',
        title: '第一折：广寒孤影',
        content: '嫦娥独居广寒宫，玉兔捣药桂树飘香，每逢中秋便泪洒月轮，思念人间...',
        tags: ['爱情', '婉约'],
        heatModifier: 14,
      },
    ],
  },
  {
    id: 'fc1',
    title: '重阳·登高壮歌',
    tags: ['武侠', '义气', '江湖', '热血'],
    heat: 95,
    summary: '重阳登高，各路英雄齐聚山顶，共商抗敌大计，义薄云天',
    festivalOnly: 'chongyang',
    branches: [
      {
        id: 'fc1-b1',
        title: '第一回：山巅论剑',
        content: '重阳之日，八大派掌门齐聚华山之巅，论剑比武，胜者为盟主，号令天下群雄...',
        tags: ['武侠', '热血'],
        heatModifier: 16,
      },
      {
        id: 'fc1-b2',
        title: '第一回：歃血为盟',
        content: '群雄于山顶古松下歃血为盟，立誓共御外敌，推举武艺最高者为盟主...',
        tags: ['义气', '江湖'],
        heatModifier: 14,
      },
    ],
  },
  {
    id: 'fl1',
    title: '腊八·施粥记',
    tags: ['世情', '励志', '历史', '谋略'],
    heat: 95,
    summary: '腊八施粥，穷书生得一碗热粥暖身，发奋读书终中状元',
    festivalOnly: 'laba',
    branches: [
      {
        id: 'fl1-b1',
        title: '第一回：寒门苦读',
        content: '腊月寒天，穷书生衣衫褴褛在破庙苦读，逢腊八施粥，一碗热粥暖了身也暖了心...',
        tags: ['励志', '世情'],
        heatModifier: 13,
      },
      {
        id: 'fl1-b2',
        title: '第一回：粥棚奇遇',
        content: '书生在粥棚排队时，偶遇微服私访的知府大人，一番对答惊才绝艳...',
        tags: ['历史', '谋略'],
        heatModifier: 11,
      },
    ],
  },
]

export function getFestivalSnacks(festivalId: FestivalId | null): Omit<Snack, 'stock'>[] {
  return FESTIVAL_SNACKS.filter((s) => !festivalId || s.festivalOnly === festivalId)
}

export function getFestivalStories(festivalId: FestivalId | null): Story[] {
  return FESTIVAL_STORIES.filter((s) => !festivalId || s.festivalOnly === festivalId)
}
