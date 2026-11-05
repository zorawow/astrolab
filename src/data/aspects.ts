import type { AspectItem } from '../types'

export const ASPECTS: AspectItem[] = [
  {
    id: 'a-conj',
    category: 'aspect',
    name: '合相',
    nameEn: 'Conjunction',
    symbol: '☌',
    angle: 0,
    nature: 'neutral',
    keywords: ['合一', '聚焦', '强化', '融合'],
    summary: '两星相距约 0°，能量合而为一、彼此强化。',
    detail:
      '合相指两颗行星落在星盘上很接近的位置（传统容许度约 8°–10°）。它们的能量融合、相互放大，像两个人并肩站在一起。合相本身中性，是「合力」还是「冲突」取决于参与的行星性质。',
    examples: ['太阳合相水星：思维与自我高度一致，表达即本色。'],
    misconceptions: ['误以为合相一定吉利。它只是「能量叠加」，吉凶看行星。'],
    relatedIds: ['t-orb', 't-chart'],
  },
  {
    id: 'a-sext',
    category: 'aspect',
    name: '六分相',
    nameEn: 'Sextile',
    symbol: '⚹',
    angle: 60,
    nature: 'harmonious',
    keywords: ['机会', '轻松', '协调', '互补'],
    summary: '两星相距约 60°，柔和的协调与机会。',
    detail:
      '六分相是 60° 的相位，连接同元素星座（火–火、土–土、风–风、水–水），带来轻松的互补与可把握的机会。它不像三分相那样「自动到来」，需要主动运用。',
    examples: ['金星六分相火星：吸引力与行动协调，关系易有火花。'],
    misconceptions: ['误以为六分相比三分相弱就无意义。它常是「待开发的天赋」。'],
    relatedIds: ['t-orb', 'el-fire', 'el-earth', 'el-air', 'el-water'],
  },
  {
    id: 'a-sq',
    category: 'aspect',
    name: '四分相',
    nameEn: 'Square',
    symbol: '□',
    angle: 90,
    nature: 'tense',
    keywords: ['张力', '挑战', '动力', '冲突'],
    summary: '两星相距约 90°，制造张力与推动改变的动力。',
    detail:
      '四分相是 90° 的相位，连接同模式但不同元素的星座（如基本星座之间），带来摩擦与紧张。它不一定是坏事——张力往往催生行动与成长，是「需要被处理」的能量。',
    examples: ['火星四分相土星：想冲却被限制，需学会耐心与策略。'],
    misconceptions: ['误以为四分相＝厄运。它更多是「待解决的动力」。'],
    relatedIds: ['t-orb', 'mo-cardinal', 'mo-fixed', 'mo-mutable'],
  },
  {
    id: 'a-trine',
    category: 'aspect',
    name: '三分相',
    nameEn: 'Trine',
    symbol: '△',
    angle: 120,
    nature: 'harmonious',
    keywords: ['流畅', '天赋', '和谐', '自然'],
    summary: '两星相距约 120°，天生的流畅与和谐。',
    detail:
      '三分相是 120° 的相位，连接同元素星座，能量自然流动、彼此支持。它常被视为天赋与舒适区，但也可能因为「太顺」而被忽视、缺乏锻炼。',
    examples: ['太阳三分相木星：乐观自信，机会自然靠近。'],
    misconceptions: ['误以为三分相越多越好。过多可能缺乏挑战与驱动力。'],
    relatedIds: ['t-orb', 'el-fire', 'el-earth', 'el-air', 'el-water'],
  },
  {
    id: 'a-opp',
    category: 'aspect',
    name: '对冲相',
    nameEn: 'Opposition',
    symbol: '☍',
    angle: 180,
    nature: 'tense',
    keywords: ['对立', '关系', '平衡', '投射'],
    summary: '两星相距约 180°，对立中寻求平衡与关系。',
    detail:
      '对冲相是 180° 的相位，连接相对星座（如白羊–天秤）。它表现为「内在两股拉力的外化」，常通过重要关系显现，需要平衡而非消灭一方。',
    examples: ['太阳对冲月亮：内在意志与情绪需求拉扯，需在自主与照顾间平衡。'],
    misconceptions: ['误以为对冲相＝注定冲突。它常是「通过他人认识自己」。'],
    relatedIds: ['t-orb', 't-rising'],
  },
]

export const ASPECTS_BY_ID: Record<string, AspectItem> = Object.fromEntries(
  ASPECTS.map((a) => [a.id, a]),
)
