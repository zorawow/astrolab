import type { SimpleItem } from '../types'

export const TERMS: SimpleItem[] = [
  {
    id: 't-rising',
    category: 'term',
    name: '上升点（ASC）',
    nameEn: 'Ascendant',
    symbol: 'ASC',
    keywords: ['面具', '起点', '第一宫', '外在'],
    summary: '星盘东方地平线升起的星座，是第一宫起点，代表外在气质。',
    detail:
      '上升点（ASC）是出生时东方地平线所落的黄道位置，它开启第一宫。上升星座描述你给人的第一印象、本能反应与「 outward 的自我」。常与太阳星座不同，是解读星盘的关键入口。',
    examples: ['太阳狮子＋上升双鱼：内在自信，外在柔和含蓄。'],
    misconceptions: ['误以为上升＝假象。它也是真实的一部分，是「初始反应」。'],
    relatedIds: ['h-1', 't-ruler', 't-chart'],
  },
  {
    id: 't-mc',
    category: 'term',
    name: '天顶（MC）',
    nameEn: 'Midheaven',
    symbol: 'MC',
    keywords: ['事业', '公众', '目标', '第十宫'],
    summary: '星盘最高点，第十宫起点，代表社会身份与事业方向。',
    detail:
      '天顶（MC, Midheaven）是星盘子午线的顶端，开启第十宫。它关注你在公共领域的角色、职业追求与社会贡献，与「你想被世界看见成什么」有关。',
    examples: ['MC 落摩羯：事业上重视结构与长期成就。'],
    misconceptions: ['误以为 MC＝收入多少。它更关地位、方向与公众形象。'],
    relatedIds: ['h-10', 't-chart'],
  },
  {
    id: 't-ic',
    category: 'term',
    name: '天底（IC）',
    nameEn: 'Imum Coeli',
    symbol: 'IC',
    keywords: ['根源', '家庭', '内在', '第四宫'],
    summary: '星盘最低点，第四宫起点，代表家庭与内在根基。',
    detail:
      '天底（IC）与天顶相对，是星盘的底部，开启第四宫。它象征根源：家庭、父母影响、私人空间与内在的归属。',
    examples: ['IC 落巨蟹：家庭与情感根基是重要支撑。'],
    misconceptions: ['误以为 IC 不重要。它是「回归之处」，与 MC 同等关键。'],
    relatedIds: ['h-4', 't-chart'],
  },
  {
    id: 't-ruler',
    category: 'term',
    name: '守护星',
    nameEn: 'Ruler',
    symbol: '★',
    keywords: ['主管', '对应', '能量来源', '链接'],
    summary: '每星座有主管行星，行星的能量「穿过」该星座表达。',
    detail:
      '守护关系把行星与星座连接起来：例如火星守护白羊、金星守护金牛与天秤。理解守护星是理解「行星落在某星座如何被修饰」的钥匙——行星提供主题，星座提供表达方式。',
    examples: ['火星（行动）落在白羊（火象开创）：行动直接、冲劲十足。'],
    misconceptions: ['误以为守护星＝唯一解释。还需结合宫位与相位。'],
    relatedIds: ['z-aries', 'p-mars', 'p-venus', 't-chart'],
  },
  {
    id: 't-orb',
    category: 'term',
    name: '容许度',
    nameEn: 'Orb',
    symbol: '±°',
    keywords: ['容差', '精准', '强度', '相位'],
    summary: '相位允许的误差角度，越小通常影响越强。',
    detail:
      '容许度（Orb）指两颗行星实际角度与「标准相位角度」之间的允许偏差。例如合相标准 0°，若两星相距 5°，则在 5° 容许度内算合相。一般容许度越小，相位越精确、影响越明显。不同占星流派容许度不同。',
    examples: ['太阳与月亮相距 3° 的对冲，比相距 8° 的对冲更强。'],
    misconceptions: ['误以为只要星座相对就自动形成相位。必须角度在容许度内。'],
    relatedIds: ['a-conj', 'a-opp', 'a-sq', 'a-trine', 'a-sext'],
  },
  {
    id: 't-chart',
    category: 'term',
    name: '本命星盘',
    nameEn: 'Natal Chart',
    symbol: '✷',
    keywords: ['快照', '地图', '出生', '定位'],
    summary: '出生时刻地点的天体位置图，是占星分析的基础。',
    detail:
      '本命星盘（Natal Chart）是某人出生瞬间、某地天空的「快照」：行星落在黄道十二星座与十二宫位中，彼此形成相位。它像一张性格与生命主题的能量地图。现代西方热带占星以黄道带（非实际恒星位置）为准。',
    examples: ['解读顺序通常是：行星 → 星座 → 宫位 → 相位 → 整体。'],
    misconceptions: [
      '误以为星盘＝命运判决书。它是倾向与主题地图，不是必然结果。',
      '占星对人格/未来的解释未被科学证实，应作为自我反思工具，而非预测依据。',
    ],
    relatedIds: ['t-rising', 't-mc', 't-ruler', 't-tropical'],
  },
  {
    id: 't-tropical',
    category: 'term',
    name: '热带黄道',
    nameEn: 'Tropical Zodiac',
    symbol: '♈',
    keywords: ['季节', '回归', '体系', '西方'],
    summary: '以春分点为白羊起点的黄道体系，现代西方占星采用。',
    detail:
      '热带黄道（Tropical Zodiac）以地球公转造成的季节循环为基准：春分点定为白羊座 0°。它与实际恒星背景（恒星黄道）已因岁差偏移约 24°，但现代西方占星仍用热带体系，把星座视为「季节能量」而非恒星位置。',
    examples: ['无论 actual 星空如何，每年春分都标记为白羊座起点。'],
    misconceptions: ['误以为星座＝当晚天空看到的恒星群。热带体系是季节模型。'],
    relatedIds: ['t-chart', 'z-aries'],
  },
]

export const TERMS_BY_ID: Record<string, SimpleItem> = Object.fromEntries(
  TERMS.map((t) => [t.id, t]),
)
