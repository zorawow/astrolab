import type { SimpleItem } from '../types'

export const ELEMENTS: SimpleItem[] = [
  {
    id: 'el-fire',
    category: 'element',
    name: '火元素',
    nameEn: 'Fire',
    symbol: '🔥',
    keywords: ['行动', '热情', '直觉', '开创'],
    summary: '火象星座（白羊、狮子、射手）象征能量、热情与行动。',
    detail:
      '四元素之一。火代表能量本身：点燃、推动、照亮。火象星座关注「我想做、我能成为」。优点是有动力与自信，阴影是可能冲动、缺乏耐心。',
    examples: ['火象多的人行动快、表达直接。'],
    misconceptions: ['误以为火元素＝脾气差。火是生命力与热情，不是 aggression。'],
    relatedIds: ['z-aries', 'z-leo', 'z-sagittarius', 'mo-cardinal', 'mo-fixed', 'mo-mutable'],
  },
  {
    id: 'el-earth',
    category: 'element',
    name: '土元素',
    nameEn: 'Earth',
    symbol: '🌍',
    keywords: ['现实', '稳定', '感官', '务实'],
    summary: '土象星座（金牛、处女、摩羯）象征现实、稳定与落地。',
    detail:
      '土代表物质与现实：把想法变成可触的结果。土象星座关注「什么真实可用」。优点是可靠、务实，阴影是可能固执或过于看重安全。',
    examples: ['土象多的人重视结果与稳定性。'],
    misconceptions: ['误以为土元素＝无趣。它是把价值落到实处的智慧。'],
    relatedIds: ['z-taurus', 'z-virgo', 'z-capricorn'],
  },
  {
    id: 'el-air',
    category: 'element',
    name: '风元素',
    nameEn: 'Air',
    symbol: '🌬️',
    keywords: ['心智', '沟通', '关系', '理念'],
    summary: '风象星座（双子、天秤、水瓶）象征心智、沟通与连接。',
    detail:
      '风代表思想与关系：信息流动、观点交流。风象星座关注「我想知道、我如何与他人连接」。优点是灵活、客观，阴影是可能疏离或只停留在想法。',
    examples: ['风象多的人爱交流、善分析。'],
    misconceptions: ['误以为风元素＝冷漠。它用理性表达关心。'],
    relatedIds: ['z-gemini', 'z-libra', 'z-aquarius'],
  },
  {
    id: 'el-water',
    category: 'element',
    name: '水元素',
    nameEn: 'Water',
    symbol: '💧',
    keywords: ['情绪', '直觉', '共情', '深层'],
    summary: '水象星座（巨蟹、天蝎、双鱼）象征情绪、直觉与感受。',
    detail:
      '水代表感受与潜意识：情绪、直觉、共情。水象星座关注「我感受什么、我连接多深」。优点是敏锐、有同理心，阴影是可能情绪淹没或边界模糊。',
    examples: ['水象多的人对氛围与情绪敏感。'],
    misconceptions: ['误以为水元素＝脆弱。情绪感知力是强大的接收能力。'],
    relatedIds: ['z-cancer', 'z-scorpio', 'z-pisces'],
  },
]

export const ELEMENTS_BY_ID: Record<string, SimpleItem> = Object.fromEntries(
  ELEMENTS.map((e) => [e.id, e]),
)
