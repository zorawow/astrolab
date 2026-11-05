import type { Course } from '../types'
import { UNIT_COURSES } from './curriculum'

export const STAGES = [
  { id: 1, title: '十二星座', desc: '符号、元素、模式、守护星与易混对比' },
  { id: 2, title: '十大行星与重要天体', desc: '行星主题与星座如何修饰表达' },
  { id: 3, title: '十二宫位', desc: '生活领域、四轴点与行星落宫' },
  { id: 4, title: '主要相位', desc: '五大相位与容许度' },
  { id: 5, title: '星盘基础认识', desc: '星盘构成与解读顺序' },
]

const BASE_COURSES: Course[] = [
  // ===== 第一阶段：十二星座 =====
  {
    id: 'c1',
    stage: 1,
    order: 1,
    title: '十二星座从哪来',
    estMinutes: 6,
    objectives: ['理解热带黄道为何分成十二段', '区分星座与当晚看到的恒星群'],
    hook: '为什么天空被切成「十二星座」？这 12 个数字是怎么来的？',
    sections: [
      {
        heading: '太阳的一年旅程',
        body: '地球绕太阳公转一圈约 365 天。从地球看，太阳背景的恒星似乎在一年里走过一整圈，这条路径叫「黄道」。古人把黄道大致均分成 12 段，每段 30°，就是十二星座的雏形。',
        connection: '这与你常听的「你是什么座」直接相关：它指太阳在你出生那天落在哪一段。',
      },
      {
        heading: '热带黄道 = 季节模型',
        body: '现代西方热带占星以「春分点」作为白羊座 0°，随季节推进。所以星座其实是季节能量的模型，并不等于当晚天空实际看到的恒星位置（那叫恒星黄道）。',
        misconception: '常见误区：以为星座是「当晚天上那群星星」。热带体系用的是季节坐标，已与恒星背景偏移约 24°。',
      },
    ],
    summary: '十二星座来自黄道均分；现代西方占星用热带（季节）体系，星座是能量模型而非恒星群。',
    exerciseIds: ['q-trop-1', 'q-trop-2'],
    relatedKnowledgeIds: ['t-tropical', 't-chart', 'z-aries'],
  },
  {
    id: 'c2',
    stage: 1,
    order: 2,
    title: '四元素：火土风水',
    estMinutes: 7,
    objectives: ['记住四个元素及其核心特质', '能判断某星座属于哪个元素'],
    hook: '同样都是「火象」，白羊、狮子、射手有何共通气质？',
    sections: [
      {
        heading: '元素是底层能量',
        body: '十二星座按元素分为四组，每组三个：火（白羊、狮子、射手）、土（金牛、处女、摩羯）、风（双子、天秤、水瓶）、水（巨蟹、天蝎、双鱼）。元素描述「这股能量以什么方式存在」。',
      },
      {
        heading: '各组一句话',
        body: '火＝行动与热情；土＝现实与稳定；风＝心智与沟通；水＝情绪与直觉。元素相同的星座，底色气质相近，差别来自模式与守护星。',
        connection: '下一课会讲「模式」，元素 × 模式能更精细地描述一个星座。',
        misconception: '误区：以为火象＝脾气差。火是生命力与热情，不是攻击性。',
      },
    ],
    summary: '四元素（火土风水）是能量的四种存在方式；同元素星座底色相近。',
    exerciseIds: ['q-el-1', 'q-el-2', 'q-el-3'],
    relatedKnowledgeIds: ['el-fire', 'el-earth', 'el-air', 'el-water'],
  },
  {
    id: 'c3',
    stage: 1,
    order: 3,
    title: '三模式：基本固定变动',
    estMinutes: 7,
    objectives: ['记住三种模式及其功能', '理解模式如何调节元素'],
    hook: '为什么同样火象，白羊「冲」、狮子「守」、射手「变」？',
    sections: [
      {
        heading: '模式是「怎么动」',
        body: '每个元素里有三个模式：基本（Cardinal，负责开创启动）、固定（Fixed，负责稳定深化）、变动（Mutable，负责适应过渡）。模式回答「这股能量怎么运动」。',
      },
      {
        heading: '组合举例',
        body: '白羊＝火＋基本 → 开创的行动力；狮子＝火＋固定 → 持续发光；射手＝火＋变动 → 探索扩散。元素给「什么」，模式给「怎么做」。',
        connection: '元素 × 模式 × 守护星，三者共同塑造一个星座。',
        misconception: '误区：以为基本模式「更高级」。三种模式功能不同，没有优劣。',
      },
    ],
    summary: '三模式（基本/固定/变动）描述能量如何运动；与元素组合可精细描述星座。',
    exerciseIds: ['q-mo-1', 'q-mo-2', 'q-mo-3'],
    relatedKnowledgeIds: ['mo-cardinal', 'mo-fixed', 'mo-mutable', 'el-fire'],
  },
  {
    id: 'c4',
    stage: 1,
    order: 4,
    title: '守护行星：行星如何穿过星座',
    estMinutes: 7,
    objectives: ['理解守护关系', '初步建立「行星主题 × 星座表达」框架'],
    hook: '火星守护白羊，金星守护金牛和天秤——「守护」到底是什么意思？',
    sections: [
      {
        heading: '守护＝主管',
        body: '每颗行星「主管」一个或多个星座，形成守护关系：火星↔白羊、金星↔金牛/天秤、水星↔双子/处女、太阳↔狮子、月亮↔巨蟹……守护关系把行星能量与星座连接起来。',
      },
      {
        heading: '行星给主题，星座给表达',
        body: '关键公式：行星代表「什么主题」，星座代表「怎么表达」。例如火星（行动）落在白羊（火象开创）→ 行动直接冲劲足；落在摩羯（土象基本）→ 行动有计划、能坚持。',
        connection: '这是后面「行星落座」解读的核心思路。',
        misconception: '误区：以为守护星是星座的「唯一解释」。还要结合宫位与相位。',
      },
    ],
    summary: '守护关系连接行星与星座；行星给主题、星座给表达，二者相乘才有具体含义。',
    exerciseIds: ['q-ru-1', 'q-ru-2'],
    relatedKnowledgeIds: ['t-ruler', 'p-mars', 'p-venus', 'z-aries'],
  },
  {
    id: 'c5',
    stage: 1,
    order: 5,
    title: '容易混淆的星座对比',
    estMinutes: 8,
    objectives: ['区分常混的星座', '用元素/模式解释差异'],
    hook: '白羊和狮子都火象，为什么原型很不同？金牛和处女都土象，差别在哪？',
    sections: [
      {
        heading: '白羊 vs 狮子',
        body: '同是火象，但白羊是基本（开创）、狮子是固定（守成）。白羊像「第一口火」冲出去；狮子像「已燃的篝火」持续照亮、需要被看见。能量相同，运动方式不同。',
      },
      {
        heading: '金牛 vs 处女',
        body: '同是土象，金牛固定（稳住、拥有），处女变动（分析、改进）。金牛重视「安定的结果」，处女重视「把过程做对」。',
        connection: '用「元素看底色、模式看动作、守护星看焦点」三句话，就能拆开大多数混淆。',
        misconception: '误区：以为同元素星座「差不多」。差异恰恰藏在模式与守护星里。',
      },
    ],
    summary: '同元素星座的差异来自模式与守护星；用「元素·模式·守护」三角度区分。',
    exerciseIds: ['q-zc-1', 'q-zc-2', 'q-zc-3'],
    relatedKnowledgeIds: ['z-aries', 'z-leo', 'z-taurus', 'z-virgo', 'mo-cardinal', 'mo-fixed'],
  },

  // ===== 第二阶段：行星 =====
  {
    id: 'c6',
    stage: 2,
    order: 1,
    title: '太阳与月亮：核心自我与内在需求',
    estMinutes: 7,
    objectives: ['区分太阳与月亮的象征', '理解「对外自我」与「内在需求」'],
    hook: '为什么很多人说「我表面像太阳星座，私底下像月亮星座」？',
    sections: [
      {
        heading: '太阳＝核心自我',
        body: '太阳象征意志力、身份与生命力：你想成为谁、如何被看见。太阳星座是你对外展现的主要风格，常被当作「你的星座」。',
      },
      {
        heading: '月亮＝内在需求',
        body: '月亮象征情绪、安全感来源与无意识习惯：你私下如何感受、需要什么才能安心。月亮星座常是放松时的真实样子。',
        connection: '太阳（意志）与月亮（需求）配合，构成「我想做」与「我需要」的张力。',
        misconception: '误区：以为月亮只关乎女性。任何人的星盘都有月亮，代表普适情绪需求。',
      },
    ],
    summary: '太阳是核心自我与意志，月亮是内在情绪与需求；两者共同构成基础人格画像。',
    exerciseIds: ['q-pl-1', 'q-pl-2', 'q-pl-3'],
    relatedKnowledgeIds: ['p-sun', 'p-moon', 'z-leo', 'z-cancer'],
  },
  {
    id: 'c7',
    stage: 2,
    order: 2,
    title: '水星与金星：沟通与爱',
    estMinutes: 7,
    objectives: ['理解水星与金星的象征主题', '区分「怎么想」与「爱什么」'],
    hook: '为什么有人说话快、有人用词准？为什么有人重浪漫、有人重安稳？',
    sections: [
      {
        heading: '水星＝思维与沟通',
        body: '水星象征如何思考、表达与学习：语言风格、逻辑、信息处理方式。水星落在双子灵活、落在处女细致——同一行星因星座不同而表达各异。',
      },
      {
        heading: '金星＝爱与价值',
        body: '金星象征吸引、审美与价值：你怎么表达爱、什么让你愉悦。金星落在天秤重平衡优雅，落在金牛重感官安稳。',
        connection: '水星管「脑子怎么转」，金星管「心被什么吸引」，二者互补。',
        misconception: '误区：以为水星＝智商、金星＝只管恋爱。它们描述的是风格与价值取向。',
      },
    ],
    summary: '水星管思维沟通，金星管爱与价值；二者解释「怎么想」与「爱什么」。',
    exerciseIds: ['q-pl-4', 'q-pl-5'],
    relatedKnowledgeIds: ['p-mercury', 'p-venus', 'z-gemini', 'z-virgo', 'z-taurus', 'z-libra'],
  },
  {
    id: 'c8',
    stage: 2,
    order: 3,
    title: '火星、木星、土星：行动·扩张·纪律',
    estMinutes: 8,
    objectives: ['区分三颗社会行星的主题', '理解「推力」与「刹车」的平衡'],
    hook: '想冲（火星）、想扩（木星）、要稳（土星）——三者如何配合？',
    sections: [
      {
        heading: '火星＝行动能量',
        body: '火星象征驱动力、愤怒与assert：如何发起行动、面对冲突。它是把意图变成动作的「油门」。',
      },
      {
        heading: '木星＝扩张与成长',
        body: '木星象征乐观、信念与机会：在哪类领域容易扩张与被眷顾。它是「放大键」。',
      },
      {
        heading: '土星＝纪律与边界',
        body: '土星象征责任、限制与成熟：哪里需要付出、建立结构。它是「刹车与地基」。火星冲、木星扩、土星收，三者平衡才有成果。',
        misconception: '误区：以为土星＝厄运。它更多是「需要付出」的领域，回报也最扎实。',
      },
    ],
    summary: '火星（行动）、木星（扩张）、土星（纪律）分别像油门、放大键与刹车，平衡才可持续。',
    exerciseIds: ['q-pl-6', 'q-pl-7', 'q-pl-8'],
    relatedKnowledgeIds: ['p-mars', 'p-jupiter', 'p-saturn', 'z-aries', 'z-sagittarius', 'z-capricorn'],
  },
  {
    id: 'c9',
    stage: 2,
    order: 4,
    title: '三王星：现代行星与时代能量',
    estMinutes: 8,
    objectives: ['认识天王、海王、冥王', '理解世代行星的特征'],
    hook: '为什么天王、海王、冥王常被称为「世代行星」？',
    sections: [
      {
        heading: '三王星的共同点',
        body: '天王星（突破/独立）、海王星（想象/消融）、冥王星（转化/重生）轨道很慢，对个人的影响常是「一代人共享」的主题，而非日常性格细节。',
      },
      {
        heading: '各自一句',
        body: '天王＝觉醒与突变；海王＝灵性与边界消融（也含迷惑）；冥王＝深度转化与重生。它们更多在集体与潜意识层面起作用。',
        connection: '理解三王星有助于看懂「时代氛围」与深层转化。',
        misconception: '误区：以为三王星决定个人日常。它们是世代行星，影响一代人的共同课题。',
      },
    ],
    summary: '三王星（天王/海王/冥王）是世代行星，代表突破、消融与转化等集体与深层主题。',
    exerciseIds: ['q-pl-9', 'q-pl-10'],
    relatedKnowledgeIds: ['p-uranus', 'p-neptune', 'p-pluto', 'z-aquarius', 'z-pisces', 'z-scorpio'],
  },

  // ===== 第三阶段：宫位 =====
  {
    id: 'c10',
    stage: 3,
    order: 1,
    title: '十二宫位总览：生活领域地图',
    estMinutes: 8,
    objectives: ['记住十二宫大致对应的生活领域', '区分星座与宫位'],
    hook: '星盘被切成 12 块「宫位」，每一块代表生活的哪一块地盘？',
    sections: [
      {
        heading: '宫位＝生活领域',
        body: '十二宫位像把人生切成 12 个房间：1 自我、2 资源、3 沟通、4 家庭、5 创造、6 健康工作、7 伴侣、8 深层共享、9 信念远行、10 事业、11 群体、12 潜意识。星座描述「怎么做」，宫位描述「在哪件事上」。',
      },
      {
        heading: '星座 vs 宫位',
        body: '关键区别：星座是「能量风格」（横轴），宫位是「生活舞台」（纵轴）。例如「火星在第十宫」＝行动力用在事业舞台；「火星在白羊」＝行动直接。',
        misconception: '误区：以为宫位和星座是一回事。一个管「风格」，一个管「领域」。',
      },
    ],
    summary: '十二宫位是人生十二个生活领域；星座管风格、宫位管领域，二者交叉才有位置意义。',
    exerciseIds: ['q-h-1', 'q-h-2', 'q-h-3'],
    relatedKnowledgeIds: ['h-1', 'h-7', 'h-10', 't-chart'],
  },
  {
    id: 'c11',
    stage: 3,
    order: 2,
    title: '四轴点：ASC / MC / IC / DSC',
    estMinutes: 7,
    objectives: ['记住四个轴点对应的宫与含义', '理解上升点为何重要'],
    hook: '星盘上有四个关键「角」，为什么上升点（ASC）常被当作解读起点？',
    sections: [
      {
        heading: '上升点与第一宫',
        body: 'ASC（上升点）是东方地平线升起的星座，开启第一宫，代表外在气质与初始反应。它常是解读星盘的起点，因为整张盘都「绕着它转」。',
      },
      {
        heading: '其余三轴',
        body: 'DSC（下降点）开启第七宫，代表重要他人与关系；MC（天顶）开启第十宫，代表事业与公众身份；IC（天底）开启第四宫，代表家庭与根源。四轴构成星盘的骨架。',
        connection: 'ASC 与 DSC、MC 与 IC 两两相对，体现「自我↔他人」「公众↔私密」。',
        misconception: '误区：以为上升点是「假象」。它也是真实自我的一部分——是本能反应。',
      },
    ],
    summary: '四轴点 ASC/MC/IC/DSC 开启 1/10/4/7 宫，是星盘骨架；ASC 是常见解读起点。',
    exerciseIds: ['q-h-4', 'q-h-5', 'q-h-6'],
    relatedKnowledgeIds: ['t-rising', 't-mc', 't-ic', 'h-1', 'h-7', 'h-10', 'h-4'],
  },
  {
    id: 'c12',
    stage: 3,
    order: 3,
    title: '行星落宫基础',
    estMinutes: 7,
    objectives: ['理解「行星落在某宫」的含义', '能举例说明'],
    hook: '「太阳在第十宫」是什么意思？行星落到宫位里怎么读？',
    sections: [
      {
        heading: '行星 + 宫位 = 主题在舞台上',
        body: '行星代表主题，宫位代表生活领域。读法是「行星的主题，落在宫位的领域里发挥作用」。例如太阳在第十宫：自我实现与成就感投注于事业舞台。',
      },
      {
        heading: '再看一例',
        body: '月亮在第四宫：情绪安全感来自家庭与根源。把「行星主题 × 宫位领域 × 星座表达」三者合起来，就是一个位置的具体含义。',
        connection: '这为后面读整张星盘打基础。',
        misconception: '误区：以为只看行星落座就够。宫位告诉你「这件事发生在哪」。',
      },
    ],
    summary: '行星落宫＝「主题投注于某生活领域」；结合星座表达可得具体解读。',
    exerciseIds: ['q-h-7', 'q-h-8'],
    relatedKnowledgeIds: ['h-10', 'h-4', 'p-sun', 'p-moon', 't-ruler'],
  },

  // ===== 第四阶段：相位 =====
  {
    id: 'c13',
    stage: 4,
    order: 1,
    title: '五大主要相位',
    estMinutes: 8,
    objectives: ['记住五个相位的名称与角度', '区分和谐与紧张'],
    hook: '星盘里行星之间的「连线」代表什么？0°/60°/90°/120°/180° 有何不同？',
    sections: [
      {
        heading: '五个核心相位',
        body: '合相 0°（能量合一）、六分相 60°（轻松机会）、四分相 90°（张力动力）、三分相 120°（流畅天赋）、对冲相 180°（对立平衡）。前两者偏和谐，四分/对冲偏紧张，合相中性。',
      },
      {
        heading: '和谐 vs 紧张',
        body: '和谐相位（六分、三分）让能量顺畅；紧张相位（四分、对冲）制造摩擦，但也催生行动。没有「好/坏」，只有「顺」与「需处理」。',
        connection: '下一课讲「容许度」，决定相位是否真的成立。',
        misconception: '误区：以为紧张相位＝坏事。张力常是成长的推动力。',
      },
    ],
    summary: '五大相位按角度区分；和谐相位顺畅、紧张相位有张力，张力也是动力。',
    exerciseIds: ['q-a-1', 'q-a-2', 'q-a-3'],
    relatedKnowledgeIds: ['a-conj', 'a-sext', 'a-sq', 'a-trine', 'a-opp'],
  },
  {
    id: 'c14',
    stage: 4,
    order: 2,
    title: '容许度与相位怎么读',
    estMinutes: 7,
    objectives: ['理解容许度的含义', '知道读相位的要点'],
    hook: '两个星座「相对」就自动形成对冲吗？为什么还要看角度误差？',
    sections: [
      {
        heading: '容许度（Orb）',
        body: '容许度是实际角度与标准相位角度的允许偏差。例如合相标准 0°，两星相距 5° 且在 5° 容许度内才算合相。容许度越小，相位越精确、越强。',
      },
      {
        heading: '读相位的顺序',
        body: '读一个相位要看三件事：是哪两颗行星（主题）、什么相位（关系性质）、容许度多大（强度）。不能只看星座相对就断定成相。',
        misconception: '误区：以为星座相对就自动成相。必须实际角度在容许度内。',
      },
    ],
    summary: '相位的成立看角度是否在容许度内；读相位要同时看行星、性质与精度。',
    exerciseIds: ['q-a-4', 'q-a-5'],
    relatedKnowledgeIds: ['t-orb', 'a-opp', 'a-conj'],
  },

  // ===== 第五阶段：星盘 =====
  {
    id: 'c15',
    stage: 5,
    order: 1,
    title: '一张星盘由什么构成',
    estMinutes: 8,
    objectives: ['说出星盘三大组成部分', '能指认行星/星座/宫位'],
    hook: '打开一张星盘，满圈的圈圈线线，到底该先看哪里？',
    sections: [
      {
        heading: '星盘三要素',
        body: '一张本命星盘 = 行星（谁）+ 星座（怎么表达）+ 宫位（在哪发生），再加上行星之间的相位（连线）。四者合起来才是完整地图。',
      },
      {
        heading: '怎么指认',
        body: '圈外一圈是十二星座刻度；内圈被线分成十二块是宫位；里面的符号是行星，落在某个星座、某个宫；行星之间的连线是相位。先定位行星，再看它落在哪星座、哪宫。',
        connection: '下一课给出解读星盘的基本顺序。',
        misconception: '误区：以为星盘＝命运判决书。它是倾向与主题地图，不是必然结果。',
      },
    ],
    summary: '星盘 = 行星 + 星座 + 宫位 + 相位；先定位行星，再看落座与落宫。',
    exerciseIds: ['q-c-1', 'q-c-2'],
    relatedKnowledgeIds: ['t-chart', 't-rising', 'a-conj'],
  },
  {
    id: 'c16',
    stage: 5,
    order: 2,
    title: '解读星盘的基本顺序',
    estMinutes: 8,
    objectives: ['记住推荐的解读顺序', '完成一次静态示例识别'],
    hook: '如果让你试着读一张星盘，第一步该看什么，最后看什么？',
    sections: [
      {
        heading: '推荐顺序',
        body: '① 看四轴与整体格局（ASC/MC 等）；② 看十大行星落座（主题如何表达）；③ 看行星落宫（主题投注在哪）；④ 看主要相位（行星间如何互动）；⑤ 综合成主题，而非逐条罗列。',
      },
      {
        heading: '静态示例',
        body: '示例：太阳狮子（核心自信）落在第十宫（事业）→ 自我实现感投注于职业与公众角色；月亮巨蟹（需要温情）落在第四宫（家庭）→ 安全感来自家庭。组合看：对外要成就，对内要安稳。',
        connection: '这是静态识别练习；完整互动星盘实验室留到第二轮。',
        misconception: '误区：以为要一次性「算准一切」。占星是逐步整合的主题地图，先抓主线。',
      },
    ],
    summary: '解读顺序：轴点→行星落座→行星落宫→相位→整合；先抓主线再补细节。',
    exerciseIds: ['q-c-3', 'q-r-1'],
    relatedKnowledgeIds: ['t-rising', 't-mc', 'p-sun', 'p-moon', 'h-10', 'h-4'],
  },
]

/**
 * 完整课程表 = 16 节原有专题课（ID 保持不变，旧进度不丢）
 * + 39 节逐知识单元深度课。按「阶段 → 课序」排列。
 */
export const COURSES: Course[] = [...BASE_COURSES, ...UNIT_COURSES].sort(
  (a, b) => a.stage - b.stage || a.order - b.order,
)

export const COURSES_BY_ID: Record<string, Course> = Object.fromEntries(
  COURSES.map((c) => [c.id, c]),
)
