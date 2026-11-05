import type { SimpleItem } from '../types'

export const MODALITIES: SimpleItem[] = [
  {
    id: 'mo-cardinal',
    category: 'modality',
    name: '基本模式',
    nameEn: 'Cardinal',
    symbol: '🜁',
    keywords: ['开创', '启动', '主动', '发起'],
    summary: '基本星座（白羊、巨蟹、天秤、摩羯）负责「开始」。',
    detail:
      '三模式之一。基本（Cardinal）能量是「发起者」：在每个季节开端启动新能量。基本星座主动、爱带头，但可能开始多、收尾少。',
    examples: ['基本星座多在季节起点：春（白羊）、夏（巨蟹）、秋（天秤）、冬（摩羯）。'],
    misconceptions: ['误以为基本＝最重要。三种模式各有功能，并无高下。'],
    relatedIds: ['z-aries', 'z-cancer', 'z-libra', 'z-capricorn', 'el-fire', 'el-water', 'el-air', 'el-earth'],
  },
  {
    id: 'mo-fixed',
    category: 'modality',
    name: '固定模式',
    nameEn: 'Fixed',
    symbol: '🜔',
    keywords: ['稳定', '坚持', '深化', '守住'],
    summary: '固定星座（金牛、狮子、天蝎、水瓶）负责「维持与深化」。',
    detail:
      '固定（Fixed）能量是「坚守者」：把开始的能量稳住、做深、做久。固定星座持久、专注，但可能抗拒改变。',
    examples: ['固定星座在季节中段：稳固既有成果。'],
    misconceptions: ['误以为固定＝顽固。它是把事情做扎实的耐力。'],
    relatedIds: ['z-taurus', 'z-leo', 'z-scorpio', 'z-aquarius'],
  },
  {
    id: 'mo-mutable',
    category: 'modality',
    name: '变动模式',
    nameEn: 'Mutable',
    symbol: '🜃',
    keywords: ['适应', '灵活', '过渡', '连接'],
    summary: '变动星座（双子、处女、射手、双鱼）负责「适应与过渡」。',
    detail:
      '变动（Mutable）能量是「调适者」：在季节末尾灵活过渡、连接不同事物。变动星座适应力强、善于沟通，但可能不够稳定或难以决断。',
    examples: ['变动星座在季节末端：为下一季做准备与转换。'],
    misconceptions: ['误以为变动＝没立场。它是根据情境灵活调整的智慧。'],
    relatedIds: ['z-gemini', 'z-virgo', 'z-sagittarius', 'z-pisces'],
  },
]

export const MODALITIES_BY_ID: Record<string, SimpleItem> = Object.fromEntries(
  MODALITIES.map((m) => [m.id, m]),
)
