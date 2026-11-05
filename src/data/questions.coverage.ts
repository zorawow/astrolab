import type { KnowledgeCategory, Question, QuestionDirection, SingleQuestion } from '../types'

/**
 * 十二星座 / 十大行星 / 五大相位：每个知识单元各 2 题（定义辨析 + 情境应用或几何关系）。
 * 干扰项从其他单元的真实描述中取用，解析逐项说明「为什么不是它」。
 */

interface UnitSpec {
  id: string
  name: string
  short: string
  /** 深入解释，作为定义题的正确答案理由 */
  why: string
  /** 定义题的 3 个干扰单元 id */
  wrongIds: [string, string, string]
  /** 情境题题干 */
  scenario: string
  /** 情境题的 3 个干扰单元 id */
  scenarioWrong: [string, string, string]
  /** 情境题的推理链 */
  chain: string[]
  reviewIds: string[]
  commonError: string
  extra?: string
}

const LETTERS = ['a', 'b', 'c', 'd'] as const

export function makeSingle(o: {
  id: string
  topic: string
  category: KnowledgeCategory
  prompt: string
  correctText: string
  wrong: { text: string; note: string }[]
  whyCorrect: string
  chain: string[]
  reviewIds: string[]
  unitId: string
  direction: QuestionDirection
  commonError: string
  extra?: string
  relatedIds?: string[]
  position: number
}): SingleQuestion {
  const pos = o.position % 4
  const options: { id: string; text: string }[] = []
  const optionNotes: Record<string, string> = {}
  let wi = 0
  for (let i = 0; i < 4; i++) {
    if (i === pos) options.push({ id: LETTERS[i], text: o.correctText })
    else {
      const w = o.wrong[wi++]
      options.push({ id: LETTERS[i], text: w.text })
      optionNotes[LETTERS[i]] = w.note
    }
  }
  return {
    id: o.id,
    type: 'single',
    topic: o.topic,
    category: o.category,
    unitId: o.unitId,
    direction: o.direction,
    relatedIds: o.relatedIds ?? [...new Set([o.unitId, ...o.reviewIds])].slice(0, 4),
    prompt: o.prompt,
    options,
    answer: LETTERS[pos],
    explanation: o.whyCorrect,
    commonError: o.commonError,
    analysis: {
      whyCorrect: o.whyCorrect,
      optionNotes,
      reasoningChain: o.chain,
      reviewIds: o.reviewIds,
      extra: o.extra,
      notToInfer: '情境题训练的是占星体系内部的解释方法，不能从行为表现反推星盘配置。',
    },
  }
}

function buildGroup(
  specs: UnitSpec[],
  category: KnowledgeCategory,
  label: string,
  defDirection: QuestionDirection,
  appDirection: QuestionDirection,
  idPrefix: string,
): Question[] {
  const byId = Object.fromEntries(specs.map((s) => [s.id, s]))
  return specs.flatMap((s, i) => {
    const defWrong = s.wrongIds.map((wid) => ({
      text: byId[wid].short,
      note: `「${byId[wid].short}」描述的是${byId[wid].name}，不是${s.name}。${s.why}`,
    }))
    const appWrong = s.scenarioWrong.map((wid) => ({
      text: byId[wid].name,
      note: `${byId[wid].name}的传统主题是「${byId[wid].short}」，与题干情境的关键词不吻合。`,
    }))

    const defQ = makeSingle({
      id: `${idPrefix}-${s.id}-d`,
      topic: `${s.name} · 核心辨析`,
      category,
      prompt: `关于「${s.name}」，下列哪一项描述正确？`,
      correctText: s.short,
      wrong: defWrong,
      whyCorrect: `${s.name}：${s.short}。${s.why}`,
      chain: [
        `第一步 明确题目考的是${s.name}的基本定位。`,
        `第二步 回忆它的元素／守护／主题组合：${s.short}。`,
        `第三步 逐项排除：${s.wrongIds.map((w) => `${byId[w].name}＝${byId[w].short}`).join('；')}。`,
        `第四步 确认唯一与${s.name}对应的描述。`,
      ],
      reviewIds: s.reviewIds,
      unitId: s.id,
      direction: defDirection,
      commonError: s.commonError,
      extra: s.extra,
      position: i,
    })

    const appQ = makeSingle({
      id: `${idPrefix}-${s.id}-a`,
      topic: `${s.name} · 情境应用`,
      category,
      prompt: `${s.scenario}\n按传统占星解释，这一情境主要对应哪个${label}？`,
      correctText: s.name,
      wrong: appWrong,
      whyCorrect: `题干情境的关键词指向「${s.short}」，对应${s.name}。${s.why}`,
      chain: s.chain,
      reviewIds: s.reviewIds,
      unitId: s.id,
      direction: appDirection,
      commonError: s.commonError,
      position: i + 2,
    })

    return [defQ, appQ]
  })
}

// ===== 十二星座 =====
const ZODIAC_SPECS: UnitSpec[] = [
  {
    id: 'z-aries', name: '白羊座', short: '火象基本，火星守护，重在开创与先行动',
    why: '它是春分起第一段，基本模式负责启动、火元素提供热度，所以原型是「不等条件齐备就先动身」。',
    wrongIds: ['z-leo', 'z-capricorn', 'z-gemini'],
    scenario: '讨论还没排完风险，有人已经做出一版粗糙原型说「先跑起来再改」。',
    scenarioWrong: ['z-virgo', 'z-taurus', 'z-capricorn'],
    chain: ['抓情境关键词：不等讨论结束、先做出东西。', '判断这是「启动」而非「核对／守成／规划」。', '对照：处女重核对、金牛重稳定、摩羯重结构，都不合。', '落在火象基本的白羊座。'],
    reviewIds: ['z-aries', 'p-mars', 'mo-cardinal', 'el-fire'], commonError: '把白羊与狮子混为一谈：同火象但模式不同，一个点火、一个守火。',
    extra: '进阶：同为火象，白羊基本、狮子固定、射手变动——用模式区分就不会混。',
  },
  {
    id: 'z-taurus', name: '金牛座', short: '土象固定，金星守护，重在稳定与质感',
    why: '土元素要求可触摸可验证，固定模式要求不轻易变动，于是形成「慢、稳、耐久」的原型。',
    wrongIds: ['z-virgo', 'z-libra', 'z-aries'],
    scenario: '宁可少买几件，也挑一个能用十年、手感顺手的工具，并每月固定存一笔。',
    scenarioWrong: ['z-aries', 'z-gemini', 'z-sagittarius'],
    chain: ['抓关键词：少而耐久、可积累、不追波动。', '判断这是「稳定与质感」而非「抢先／求广／扩展」。', '排除白羊（先动）、双子（多通道）、射手（推远视野）。', '落在土象固定的金牛座。'],
    reviewIds: ['z-taurus', 'p-venus', 'mo-fixed', 'el-earth'], commonError: '把金牛读成「拜金」，或与同土象的处女混用。',
  },
  {
    id: 'z-gemini', name: '双子座', short: '风象变动，水星守护，重在多通道的信息连接',
    why: '风象处理流通，变动模式负责转接，因此它的原型是「保持通道畅通」而非「知道很多」。',
    wrongIds: ['z-virgo', 'z-sagittarius', 'z-libra'],
    scenario: '把技术同事的术语翻成客户听得懂的话，再把客户反馈带回去，顺手又开了三条资料线索。',
    scenarioWrong: ['z-virgo', 'z-sagittarius', 'z-cancer'],
    chain: ['抓关键词：两头转译、多条线索来回。', '判断这是「信息流通与连接」而非「核对精度／整体意义／照顾」。', '排除处女（求准）、射手（求意义）、巨蟹（求归属）。', '落在风象变动的双子座。'],
    reviewIds: ['z-gemini', 'p-mercury', 'mo-mutable', 'el-air'], commonError: '把双子与处女混同：同由水星守护，但一个求广、一个求准。',
  },
  {
    id: 'z-cancer', name: '巨蟹座', short: '水象基本，月亮守护，重在建立归属与照顾',
    why: '水象处理情感联结，基本模式主动开创，因此它开创的是「关系与安全感的结构」。',
    wrongIds: ['z-scorpio', 'z-pisces', 'z-capricorn'],
    scenario: '新成员入职第一天，有人主动记得名字、说明茶水间在哪、先不安排难题。',
    scenarioWrong: ['z-virgo', 'z-libra', 'z-aquarius'],
    chain: ['抓关键词：先把人安顿好、营造可照顾的范围。', '判断这是「主动建立归属」而非「核对／协商／重构系统」。', '排除处女、天秤、水瓶。', '落在水象基本的巨蟹座。'],
    reviewIds: ['z-cancer', 'p-moon', 'mo-cardinal', 'el-water'], commonError: '把巨蟹读成「只顾家、情绪化」，忽略它是基本（开创）星座。',
  },
  {
    id: 'z-leo', name: '狮子座', short: '火象固定，太阳守护，重在持续发光与被看见',
    why: '火元素要表达，固定模式要稳定，两者相乘是「一直在场的光」——持续输出并愿意承担被看见。',
    wrongIds: ['z-aries', 'z-sagittarius', 'z-taurus'],
    scenario: '一个每周固定更新的栏目，不因某次冷场就停；带队时还公开点名肯定成员。',
    scenarioWrong: ['z-aries', 'z-virgo', 'z-aquarius'],
    chain: ['抓关键词：一直在线、稳定输出、愿意被看见。', '判断这是「持续」而非「抢先开头／挑错／去中心化」。', '排除白羊、处女、水瓶。', '落在火象固定的狮子座。'],
    reviewIds: ['z-leo', 'p-sun', 'mo-fixed', 'el-fire'], commonError: '把狮子与白羊混同：一个点火、一个守火。',
  },
  {
    id: 'z-virgo', name: '处女座', short: '土象变动，水星守护，重在分辨核对与改进',
    why: '土元素要求具体可验证，变动模式负责调整，于是原型是「持续优化」而非一次做对。',
    wrongIds: ['z-taurus', 'z-gemini', 'z-pisces'],
    scenario: '活动结束后逐步复盘，标出「哪一步总卡住、下次换个顺序」，并把说明书含糊的一句改清楚。',
    scenarioWrong: ['z-gemini', 'z-taurus', 'z-leo'],
    chain: ['抓关键词：逐条核对、找出可改处、让流程更可用。', '判断这是「分辨与改进」而非「收集信息／守住结果／持续发光」。', '排除双子、金牛、狮子。', '落在土象变动的处女座。'],
    reviewIds: ['z-virgo', 'p-mercury', 'mo-mutable', 'el-earth'], commonError: '把处女窄化成洁癖，或与双子混用。',
  },
  {
    id: 'z-libra', name: '天秤座', short: '风象基本，金星守护，重在对等协商与平衡',
    why: '风象处理关系中的往来，基本模式主动开创，于是它主动建立的是「双方都认的规则」。',
    wrongIds: ['z-taurus', 'z-aries', 'z-aquarius'],
    scenario: '两人分任务时，先列出彼此时间与擅长，再定一个双方都认的分法，而不是干脆自己全做。',
    scenarioWrong: ['z-aries', 'z-capricorn', 'z-cancer'],
    chain: ['抓关键词：先看两端、建立双方认可的形式。', '判断这是「对等协商」而非「抢先／建制／照顾」。', '排除白羊、摩羯、巨蟹。', '落在风象基本的天秤座。'],
    reviewIds: ['z-libra', 'p-venus', 'mo-cardinal', 'el-air'], commonError: '把天秤读成没主见，或与金牛混同（同由金星守护但一个求平、一个求稳）。',
  },
  {
    id: 'z-scorpio', name: '天蝎座', short: '水象固定，冥王星守护，重在深度与彻底转化',
    why: '水象处理情感联结，固定模式要求不放松，于是原型是「不浅尝」，要触到最不易说出口的一层。',
    wrongIds: ['z-cancer', 'z-pisces', 'z-aries'],
    scenario: '合伙时把最难谈的退出条款先摆上桌，宁可当下不舒服，也不留模糊地带。',
    scenarioWrong: ['z-libra', 'z-gemini', 'z-sagittarius'],
    chain: ['抓关键词：不留模糊、要求彻底的真实。', '判断这是「深度」而非「表面协调／信息流通／视野扩展」。', '排除天秤、双子、射手。', '落在水象固定的天蝎座。'],
    reviewIds: ['z-scorpio', 'p-pluto', 'mo-fixed', 'el-water'], commonError: '把天蝎读成「记仇／危险」，忽略深度与信任这条主线。',
  },
  {
    id: 'z-sagittarius', name: '射手座', short: '火象变动，木星守护，重在意义与视野扩展',
    why: '火元素要有方向地往外，变动模式负责扩散，于是原型是「不断把地平线往后推」。',
    wrongIds: ['z-gemini', 'z-aries', 'z-leo'],
    scenario: '为了解决一个具体问题，去读另一个领域的基础教材，因为「原来的框架解释不了」。',
    scenarioWrong: ['z-gemini', 'z-virgo', 'z-capricorn'],
    chain: ['抓关键词：换框架、追问整体意义。', '判断这是「视野扩展」而非「信息收集／细节核对／结构建设」。', '排除双子、处女、摩羯。', '落在火象变动的射手座。'],
    reviewIds: ['z-sagittarius', 'p-jupiter', 'mo-mutable', 'el-fire'], commonError: '把射手读成只爱旅游，忽略意义与框架的更新。',
  },
  {
    id: 'z-capricorn', name: '摩羯座', short: '土象基本，土星守护，重在结构与长期建设',
    why: '土元素要求现实可行，基本模式主动开创，于是它开创的是「制度与路径」而非点子。',
    wrongIds: ['z-aries', 'z-taurus', 'z-virgo'],
    scenario: '把大目标拆成季度可验收的节点，预留缓冲，愿意用三年慢慢累积。',
    scenarioWrong: ['z-aries', 'z-sagittarius', 'z-aquarius'],
    chain: ['抓关键词：长期、可验收、按层级推进。', '判断这是「建制」而非「抢先／扩展／质疑规则」。', '排除白羊、射手、水瓶。', '落在土象基本的摩羯座。'],
    reviewIds: ['z-capricorn', 'p-saturn', 'mo-cardinal', 'el-earth'], commonError: '把土星／摩羯读成厄运，忽略长期建设这一层。',
  },
  {
    id: 'z-aquarius', name: '水瓶座', short: '风象固定，天王星守护，重在突破与群体视角',
    why: '风象处理观念，固定模式要求稳定，于是它固定的是「不被既有规则绑住」这件事本身。',
    wrongIds: ['z-capricorn', 'z-libra', 'z-gemini'],
    scenario: '大家默认会议必须同步到场，有人提出异步文档＋定期汇总，让不同时区的人都能参与。',
    scenarioWrong: ['z-capricorn', 'z-libra', 'z-virgo'],
    chain: ['抓关键词：质疑默认前提、让规则换个写法。', '判断这是「系统重构」而非「在结构内建制／维持对等／改进细节」。', '排除摩羯、天秤、处女。', '落在风象固定的水瓶座。'],
    reviewIds: ['z-aquarius', 'p-uranus', 'mo-fixed', 'el-air'], commonError: '把水瓶误当水象，或读成「冷漠不合群」。',
  },
  {
    id: 'z-pisces', name: '双鱼座', short: '水象变动，海王星守护，重在共情与边界消融',
    why: '水象处理共鸣，变动模式负责消融，于是原型是「不急着划清界线」。',
    wrongIds: ['z-cancer', 'z-scorpio', 'z-virgo'],
    scenario: '一进屋没人说话，却察觉到气氛紧张，于是先放慢语气；安慰完朋友，自己莫名低落半天。',
    scenarioWrong: ['z-virgo', 'z-cancer', 'z-gemini'],
    chain: ['抓关键词：感应氛围、分不清是谁的情绪。', '判断这是「边界变软」而非「分类核对／建立归属／信息流通」。', '排除处女、巨蟹、双子。', '落在水象变动的双鱼座。'],
    reviewIds: ['z-pisces', 'p-neptune', 'mo-mutable', 'el-water'], commonError: '把双鱼读成「爱幻想」的评语，或与巨蟹、天蝎混同。',
  },
]

// ===== 十大行星 =====
const PLANET_SPECS: UnitSpec[] = [
  {
    id: 'p-sun', name: '太阳', short: '核心自我、意志与想成为谁',
    why: '它是星盘中唯一自身发光的天体，象征意识、身份与主动选择的方向。',
    wrongIds: ['p-moon', 'p-venus', 'p-mars'],
    scenario: '放弃更稳妥的路径，选那条更像「自己想成为的人」会走的路。',
    scenarioWrong: ['p-moon', 'p-venus', 'p-saturn'],
    chain: ['抓关键词：主动选择、认同什么。', '判断这是「意志方向」而非「安心／愉悦／设限」。', '排除月亮、金星、土星。', '落在太阳。'],
    reviewIds: ['p-sun', 'p-moon', 't-rising'], commonError: '把太阳与上升混为一谈：一个管我想成为谁，一个管我怎么被看见。',
  },
  {
    id: 'p-moon', name: '月亮', short: '情绪需求、安全感与习惯性反应',
    why: '它反射光、运行快、盈亏明显，传统上对应接收、变化与「怎样才安心」。',
    wrongIds: ['p-sun', 'p-venus', 'p-neptune'],
    scenario: '压力一大就想独处；换了更好的住处，却因气味与光线不对而睡不踏实。',
    scenarioWrong: ['p-venus', 'p-sun', 'p-mercury'],
    chain: ['抓关键词：不假思索的安顿动作、熟悉感。', '判断这是「安全感需求」而非「被吸引／意志／思考方式」。', '排除金星、太阳、水星。', '落在月亮。'],
    reviewIds: ['p-moon', 'p-sun', 'h-4'], commonError: '把月亮说成女性专属，或与金星合并成「感情」。',
  },
  {
    id: 'p-mercury', name: '水星', short: '思考方式、语言表达与信息处理',
    why: '它是最靠近太阳、运行最快的行星，传统上被当作在各部分之间传递的信使。',
    wrongIds: ['p-jupiter', 'p-venus', 'p-uranus'],
    scenario: '同一件事，有人先讲结论再补细节，有人按时间铺陈；信息相同，加工与输出方式不同。',
    scenarioWrong: ['p-jupiter', 'p-moon', 'p-mars'],
    chain: ['抓关键词：怎么组织、怎么说出来。', '判断这是「信息加工风格」而非「整体意义／情绪需求／行动」。', '排除木星、月亮、火星。', '落在水星。'],
    reviewIds: ['p-mercury', 'z-gemini', 'z-virgo', 'h-3'], commonError: '把水星当成智力指标，或用来解释一切失误。',
  },
  {
    id: 'p-venus', name: '金星', short: '喜好、审美、吸引与价值判断',
    why: '它稳定明亮、与美与和谐长期相联，象征体系据此把「什么值得、被什么吸引」归给它。',
    wrongIds: ['p-moon', 'p-mars', 'p-jupiter'],
    scenario: '同样预算下，有人凭颜色与手感挑东西；表达重视时，会记住对方提过的小心愿。',
    scenarioWrong: ['p-moon', 'p-mars', 'p-saturn'],
    chain: ['抓关键词：取舍标准、被什么吸引、怎么表达喜欢。', '判断这是「价值与偏好」而非「安心／行动／扩张」。', '排除月亮、火星、土星。', '落在金星。'],
    reviewIds: ['p-venus', 'p-mars', 'z-libra', 'z-taurus'], commonError: '把金星窄化成「只管恋爱」，忽略审美与价值判断。',
  },
  {
    id: 'p-mars', name: '火星', short: '行动力、主张与推进方式',
    why: '它在传统里与热量、急迫相联，象征体系把「发起与推进」归给它。',
    wrongIds: ['p-venus', 'p-saturn', 'p-pluto'],
    scenario: '会上当场提出反对并给出替代方案；把拖了很久的事先做五分钟起步。',
    scenarioWrong: ['p-venus', 'p-saturn', 'p-moon'],
    chain: ['抓关键词：表态、起步、把意图变成动作。', '判断这是「推进」而非「协调／设限／深层转化」。', '排除金星、土星、冥王星。', '落在火星。'],
    reviewIds: ['p-mars', 'p-venus', 'p-saturn', 'z-aries'], commonError: '把火星直接等同于愤怒或暴力。',
  },
  {
    id: 'p-jupiter', name: '木星', short: '扩张、信念与整体意义',
    why: '它是最大的行星，象征体系把「放大、包容、把零散经验连成图景」归给它。',
    wrongIds: ['p-saturn', 'p-mercury', 'p-neptune'],
    scenario: '把两件看似无关的经验连起来，忽然对整件事有了新理解；同时也容易一次答应太多。',
    scenarioWrong: ['p-saturn', 'p-mercury', 'p-venus'],
    chain: ['抓关键词：图景变大、可能变多、也包含过度。', '判断这是「扩张」而非「设限／加工／偏好」。', '排除土星、水星、金星。', '落在木星。'],
    reviewIds: ['p-jupiter', 'p-saturn', 'z-sagittarius', 'h-9'], commonError: '把木星直接当成「幸运星」，忽略扩张的盲点。',
  },
  {
    id: 'p-saturn', name: '土星', short: '责任、边界、时间与长期结构',
    why: '它是传统可见行星中最外层的边界，指向「需要练习、不能靠一时热情完成」的部分。',
    wrongIds: ['p-jupiter', 'p-mars', 'p-pluto'],
    scenario: '每天练半小时、三个月才听得出差别；把「无限打磨」改成「到周五就交付」。',
    scenarioWrong: ['p-jupiter', 'p-mars', 'p-uranus'],
    chain: ['抓关键词：缓慢反馈、设截止线、可累积。', '判断这是「边界与长期承担」而非「扩张／立即推进／突破规则」。', '排除木星、火星、天王星。', '落在土星。'],
    reviewIds: ['p-saturn', 'p-jupiter', 'z-capricorn', 'h-10'], commonError: '把土星读成厄运，忽略它是「哪里值得长期投入」。',
  },
  {
    id: 'p-uranus', name: '天王星', short: '突破、独立与规则重构（世代行星）',
    why: '它是望远镜时代发现的第一颗行星，被赋予「打破旧秩序」的象征，落座为一代人共享。',
    wrongIds: ['p-saturn', 'p-mercury', 'p-neptune'],
    scenario: '沿用多年的人工审批被一个共享文档取代，大家才发现原来不必如此。',
    scenarioWrong: ['p-saturn', 'p-mercury', 'p-pluto'],
    chain: ['抓关键词：默认前提忽然显得可疑、规则整套换掉。', '判断这是「突破」而非「守结构／在规则内传递／深层瓦解」。', '排除土星、水星、冥王星。', '落在天王星，并提醒这是世代行星。'],
    reviewIds: ['p-uranus', 'p-saturn', 'z-aquarius', 'h-11'], commonError: '用天王星落座解释个人日常性格，忽略世代属性。',
  },
  {
    id: 'p-neptune', name: '海王星', short: '想象、共情与边界消融（世代行星）',
    why: '它在望远镜中轮廓朦胧，象征体系把「消融与想象」归给它，落座为一代人共享。',
    wrongIds: ['p-moon', 'p-saturn', 'p-uranus'],
    scenario: '散场后说不清是哪一幕，看什么都有了另一层颜色；安慰完朋友，自己莫名低落半天。',
    scenarioWrong: ['p-moon', 'p-saturn', 'p-mercury'],
    chain: ['抓关键词：轮廓变软、分不清是谁的感受。', '判断这是「边界消融」而非「个人情绪需求／明确边界／规则重构」。', '排除月亮、土星、水星。', '落在海王星，并提醒不作心理诊断。'],
    reviewIds: ['p-neptune', 'p-saturn', 'z-pisces', 'h-12'], commonError: '把海王星浪漫化成「灵性高」，或反过来当成「一定被骗」。',
  },
  {
    id: 'p-pluto', name: '冥王星', short: '深层转化与旧结构重建（世代行星）',
    why: '它处理不能靠小修小补解决的部分：旧结构不适用，必须结束才能重建，落座为一代人共享。',
    wrongIds: ['p-mars', 'p-saturn', 'p-neptune'],
    scenario: '承认整个业务模式已不适用，停掉重来；家族里多年没人提的事终于被摆上桌。',
    scenarioWrong: ['p-mars', 'p-saturn', 'p-uranus'],
    chain: ['抓关键词：不可回头、整个结构换掉。', '判断这是「深层转化」而非「日常行动／加固结构／换规则」。', '排除火星、土星、天王星。', '落在冥王星，并提醒是世代行星。'],
    reviewIds: ['p-pluto', 'p-mars', 'z-scorpio', 'h-8'], commonError: '把冥王星读成「死亡／灾祸」，或用落座解释个人性格。',
  },
]

// ===== 五大相位 =====
const ASPECT_SPECS: UnitSpec[] = [
  {
    id: 'a-conj', name: '合相', short: '0°／能量融合／中性，性质看参与行星',
    why: '角度为 0 意味着两星几乎重合，主题缠在一起；它是中性相位，不自动等于吉。',
    wrongIds: ['a-opp', 'a-sext', 'a-trine'],
    scenario: '两颗行星的黄道经度相差约 2°，落在常见容许度内，主题几乎分不开地一起表达。',
    scenarioWrong: ['a-opp', 'a-sq', 'a-trine'],
    chain: ['先读角度：接近 0°。', '确认落在合相容许度内，相位成立。', '排除正对（180°）、直角（90°）、120° 三种几何关系。', '判为合相，并说明性质取决于参与行星。'],
    reviewIds: ['a-conj', 't-orb', 'a-opp'], commonError: '以为同星座就是合相，或把合相当成一定吉利。',
  },
  {
    id: 'a-sext', name: '六分相', short: '60°／互补机会／需主动运用',
    why: '60° 把圆六等分，连接气质可互补的位置，提供「稍一主动就能用上」的机会。',
    wrongIds: ['a-trine', 'a-sq', 'a-conj'],
    scenario: '朋友随口提到一个招募，正好对上你手上的技能；机会存在，但要不要联系在你。',
    scenarioWrong: ['a-trine', 'a-sq', 'a-opp'],
    chain: ['抓关键词：机会现成、但需要伸手推一下。', '判断这是「需主动的互补」而非「自动流淌／摩擦／正对」。', '排除三分、四分、对冲。', '落在六分相。'],
    reviewIds: ['a-sext', 'a-trine', 't-orb'], commonError: '把六分相当成「较弱的三分相」而忽略它。',
  },
  {
    id: 'a-sq', name: '四分相', short: '90°／同模式不同元素的张力与动力',
    why: '90° 形成直角，连接同模式但不同元素的位置，「都想主动却做法对不上」而产生摩擦。',
    wrongIds: ['a-opp', 'a-trine', 'a-sext'],
    scenario: '急着推进却不断遇到流程与时间限制，逼着人学会策略与耐心。',
    scenarioWrong: ['a-opp', 'a-trine', 'a-conj'],
    chain: ['抓关键词：互相顶住、不得不处理。', '判断这是「直角摩擦」而非「两端拉扯／自然流畅／融合」。', '排除对冲、三分、合相。', '落在四分相，并说明张力也是动力。'],
    reviewIds: ['a-sq', 'a-opp', 'a-trine'], commonError: '把四分相直接读成厄运。',
  },
  {
    id: 'a-trine', name: '三分相', short: '120°／同元素的自然流畅与天赋',
    why: '120° 把圆三等分，连接同元素位置，能量自然流淌，常被视为天赋与舒适区。',
    wrongIds: ['a-sext', 'a-sq', 'a-opp'],
    scenario: '别人要拆解半天的步骤，你听一遍就能顺下来，甚至说不清自己怎么做到的。',
    scenarioWrong: ['a-sext', 'a-sq', 'a-conj'],
    chain: ['抓关键词：不费力、本来就会。', '判断这是「自动流淌」而非「需主动的机会／摩擦／融合」。', '排除六分、四分、合相。', '落在三分相，并补充「太顺也可能疏于练习」。'],
    reviewIds: ['a-trine', 'a-sext', 'a-sq'], commonError: '把三分相读成「越多越好」，忽略舒适区的盲点。',
  },
  {
    id: 'a-opp', name: '对冲相', short: '180°／正对两端需要平衡的拉力',
    why: '180° 是直径两端，象征「正对、互为镜像」，课题是同时容纳两端而非消灭一端。',
    wrongIds: ['a-sq', 'a-conj', 'a-trine'],
    scenario: '一边想按自己的节奏走，一边又放不下别人的需要，常在重要关系里被具体化。',
    scenarioWrong: ['a-sq', 'a-conj', 'a-sext'],
    chain: ['抓关键词：两端同时存在、需要平衡。', '判断这是「正对拉扯」而非「直角摩擦／融合／机会」。', '排除四分、合相、六分。', '落在对冲相，并说明不能只选一端。'],
    reviewIds: ['a-opp', 'a-sq', 't-orb'], commonError: '把对冲相读成「注定冲突」，或以为星座相对就自动成相。',
  },
]

// ===== 跨模块对比辨析题 =====
const CONTRAST: Question[] = [
  makeSingle({
    id: 'qcv-c-1', topic: '白羊座 vs 狮子座', category: 'zodiac', direction: 'contrast', unitId: 'z-aries',
    prompt: '白羊座与狮子座同属火象，区分二者的主要维度是？',
    correctText: '模式不同：白羊基本（开创启动），狮子固定（持续发光）',
    wrong: [
      { text: '元素不同', note: '两者都是火象；元素相同正是题目给出的前提。' },
      { text: '一个属风、一个属火', note: '与已知分类矛盾，白羊与狮子都是火象。' },
      { text: '只看太阳星座就能判断', note: '题目问的是星座原型本身的区分维度，与星盘落座无关。' },
    ],
    whyCorrect: '元素给「什么能量」，模式给「怎么运动」。例子①：会上第一个抛出不成熟原型（白羊，点火）vs 每周固定更新一个栏目、从不因冷场而停（狮子，守火）。例子②：抢着开头 vs 一直在场被看见。守护星也帮忙区分：火星对应启动，太阳对应持续发光。',
    chain: ['先确认共同点：都是火象，元素不能用来区分。', '再查模式：白羊基本、狮子固定。', '用「点火／守火」两个生活例子验证。', '补守护星：火星 vs 太阳。'],
    reviewIds: ['z-aries', 'z-leo', 'mo-cardinal', 'mo-fixed'], commonError: '忽略模式，只盯着元素。',
    relatedIds: ['z-aries', 'z-leo'], position: 0,
  }),
  makeSingle({
    id: 'qcv-c-2', topic: '金牛座 vs 处女座', category: 'zodiac', direction: 'contrast', unitId: 'z-taurus',
    prompt: '金牛座与处女座同属土象，下列区分正确的是？',
    correctText: '金牛固定＝稳住已有、重结果；处女变动＝分析过程、持续改进',
    wrong: [
      { text: '金牛变动、处女固定', note: '模式记反了：金牛固定、处女变动。' },
      { text: '两者完全相同，只是守护星写法不同', note: '守护星虽同为水星／金星之别，模式差异已足以分开二者。' },
      { text: '金牛属风象，处女属土象', note: '分类错误，两者都是土象。' },
    ],
    whyCorrect: '例子①：少买几件、挑一个用十年的工具（金牛，守结果）vs 活动后逐条复盘、把流程改顺（处女，改过程）。例子②：每月固定储蓄（金牛）vs 把说明书含糊的一句改清楚（处女）。同土象的差异藏在模式与守护星里。',
    chain: ['确认共同点是土象（现实、可验证）。', '查模式：金牛固定、处女变动。', '把「稳住结果」与「改进过程」各配一个生活例子。', '排除模式记反、同义、元素错误三项。'],
    reviewIds: ['z-taurus', 'z-virgo', 'mo-fixed', 'mo-mutable'], commonError: '以为同元素星座「差不多」。',
    relatedIds: ['z-taurus', 'z-virgo'], position: 1,
  }),
  makeSingle({
    id: 'qcv-c-3', topic: '金星 vs 月亮', category: 'planet', direction: 'contrast', unitId: 'p-venus',
    prompt: '「被什么吸引」与「需要什么才安心」分别对应哪两颗行星？',
    correctText: '金星＝吸引与价值判断；月亮＝情绪需求与安全感',
    wrong: [
      { text: '金星＝安全感，月亮＝吸引', note: '方向颠倒：金星是趋近，月亮是安顿。' },
      { text: '两者都只管恋爱，可互换', note: '喜欢一个人与在他身边安心不是同一件事。' },
      { text: '金星＝行动，月亮＝思考', note: '行动属火星、思考属水星，全部错位。' },
    ],
    whyCorrect: '例子①：被一个人的谈吐与审美吸引、想靠近（金星）vs 忙了一天只想回到熟悉的气味与光线里（月亮）。例子②：挑礼物时判断「他会喜欢什么」（金星）vs 压力大时下意识想独处（月亮）。判据：「趋近」对「安顿」。',
    chain: ['拆题眼：题目对比「被吸引」与「需安心」。', '把趋近归金星、安顿归月亮。', '用挑礼物、回家放松两组例子验证。', '排除颠倒、同义、错配火星水星三项。'],
    reviewIds: ['p-venus', 'p-moon', 'p-mars', 'p-mercury'], commonError: '把两者合并成笼统的「感情」。',
    relatedIds: ['p-venus', 'p-moon'], position: 2,
  }),
  makeSingle({
    id: 'qcv-c-4', topic: '火星 vs 土星', category: 'planet', direction: 'contrast', unitId: 'p-mars',
    prompt: '关于火星与土星在象征上的关系，最准确的是？',
    correctText: '火星＝立即推进的驱动力；土星＝边界、时机与长期结构，两者是油门与刹车',
    wrong: [
      { text: '火星＝厄运，土星＝好运', note: '把行星当成吉凶标签，忽略它们描述的是不同的运作功能。' },
      { text: '两者功能相同，只需选一个看', note: '一个发起、一个设限，缺一都读不出「冲劲与限制如何协商」。' },
      { text: '土星负责起步，火星负责收尾', note: '方向颠倒：起步是火星，结构与收束是土星。' },
    ],
    whyCorrect: '例子①：第一天只做五分钟把工具摆出来（火星）vs 把「无限打磨」改成「到周五交付」（土星）。例子②：当场提出反对（火星）vs 先定标准与节点再动（土星）。两者的相位常被用来讨论冲劲与限制如何配合，而不是谁好谁坏。',
    chain: ['先把「吉凶」框架放下，改看功能。', '把发起归火星、设限与长期归土星。', '用起步 vs 截止线、表态 vs 定标准两组例子验证。', '排除吉凶标签、同义、颠倒三项。'],
    reviewIds: ['p-mars', 'p-saturn', 'p-jupiter'], commonError: '把土星妖魔化，或把两颗行星当成吉凶对立。',
    relatedIds: ['p-mars', 'p-saturn'], position: 3,
  }),
  makeSingle({
    id: 'qcv-c-5', topic: '三分相 vs 六分相', category: 'aspect', direction: 'contrast', unitId: 'a-trine',
    prompt: '同属和谐相位，三分相（120°）与六分相（60°）的关键差别是？',
    correctText: '三分相能量自动流淌、近于天赋；六分相提供需主动运用的机会',
    wrong: [
      { text: '六分相是 120°，三分相是 60°', note: '角度记反了：六分 60°、三分 120°。' },
      { text: '两者都是紧张相位', note: '分类错误，两者都偏和谐；紧张相位是四分与对冲。' },
      { text: '六分相毫无价值，可以直接忽略', note: '把「强度较低」当成「没有意义」，忽略它代表可开发的机会。' },
    ],
    whyCorrect: '例子①：某类事不费力就顺下来、甚至说不清怎么做到的（三分相，天生流淌）vs 朋友转来一个招募、恰好对上技能，但要自己联系才成（六分相，需主动）。例子②：顺水行舟 vs 桌上写好地址的推荐信没寄出去。一个是「本来就在」，一个是「推一下就开」。',
    chain: ['先确认两者都偏和谐，排除「紧张相位」的说法。', '核对角度：60° / 120°。', '比较机制：自动流淌 vs 需主动调用。', '用顺水行舟与推荐信两个例子验证。'],
    reviewIds: ['a-trine', 'a-sext', 'a-sq'], commonError: '把「强度弱」误当成「没有意义」。',
    relatedIds: ['a-trine', 'a-sext'], position: 0,
  }),
  makeSingle({
    id: 'qcv-c-6', topic: '四分相 vs 对冲相', category: 'aspect', direction: 'contrast', unitId: 'a-sq',
    prompt: '同属紧张相位，四分相（90°）与对冲相（180°）的区别是？',
    correctText: '四分相是直角摩擦、需以行动化解；对冲相是两端正对、需在关系与平衡中处理',
    wrong: [
      { text: '四分相是 180°，对冲相是 90°', note: '角度记反；90° 是直角，180° 是直径两端。' },
      { text: '两者都代表注定发生的坏事', note: '把象征张力当成事件预言；现代占星不作吉凶或事件断言。' },
      { text: '两者都让能量自然流淌', note: '那是三分相／六分相的性质，与紧张相位相反。' },
    ],
    whyCorrect: '例子①：想冲却被流程按住、逼你调整策略（四分相，卡住要动）vs 想按自己节奏走又放不下别人的需要（对冲相，两端要共处）。例子②：两扇门同时往里推 vs 拔河时不能让绳子把人拽倒。一个要「解决」，一个要「共存」。',
    chain: ['先确认两者都偏紧张，排除「自然流淌」。', '核对几何：90° 直角 / 180° 正对。', '比较课题：行动化解 vs 协商平衡。', '用两扇门与拔河两组例子验证，并排除事件预言式选项。'],
    reviewIds: ['a-sq', 'a-opp', 'a-trine'], commonError: '把紧张相位等同于厄运。',
    relatedIds: ['a-sq', 'a-opp'], position: 1,
  }),
  makeSingle({
    id: 'qcv-c-7', topic: '星座 vs 宫位', category: 'house', direction: 'contrast', unitId: 'h-1',
    prompt: '「星座」与「宫位」在星盘中的分工，正确的是？',
    correctText: '星座＝能量风格（怎么表达）；宫位＝生活领域（在哪发生）',
    wrong: [
      { text: '星座＝生活领域，宫位＝能量风格', note: '方向完全颠倒，这是最常见的混淆。' },
      { text: '两者完全一样，只是叫法不同', note: '一个管风格、一个管舞台；「火星在白羊」与「火星在十宫」回答的是不同问题。' },
      { text: '第 N 宫天然等于第 N 个星座', note: '这是「自然黄道」的类比，被误当成等号；宫头可以是任何星座。' },
    ],
    whyCorrect: '例子①：火星在白羊＝行动直接（风格）vs 火星在第十宫＝行动力投注于事业舞台（领域）。例子②：第二宫的宫头可以是双子，此时讨论资源主题要找水星（宫主星），而不是直接套用金牛座。记住公式：行星给主题、星座给风格、宫位给领域。',
    chain: ['先拆题眼：题目问的是两个维度的分工。', '把「怎么表达」归星座、「在哪发生」归宫位。', '用火星在白羊 vs 火星在十宫的例子验证。', '排除「同序号天然相等」这一自然黄道误读。'],
    reviewIds: ['h-1', 'z-aries', 't-ruler', 't-chart'], commonError: '把宫位与同序号星座视为天然等同。',
    relatedIds: ['h-1', 'z-aries', 't-ruler'], position: 2,
  }),
  makeSingle({
    id: 'qcv-c-8', topic: '太阳 vs 月亮 vs 上升', category: 'planet', direction: 'contrast', unitId: 'p-sun',
    prompt: '「我想成为谁」「我需要什么才安心」「我怎么被看见」依次对应？',
    correctText: '太阳 → 月亮 → 上升点／第一宫',
    wrong: [
      { text: '月亮 → 太阳 → 上升点', note: '前两位颠倒：月亮是需求，太阳是意志。' },
      { text: '上升点 → 太阳 → 月亮', note: '把「出场方式」当成了核心意志。' },
      { text: '太阳 → 金星 → 月亮', note: '金星是喜好与价值，不是「怎么被看见」。' },
    ],
    whyCorrect: '例子①：主动选了更像自己会走的路（太阳）vs 压力大时只想独处（月亮）vs 推门进屋没经过思考的第一反应（上升）。例子②：太阳摩羯想稳重可靠，上升双子看起来机灵话多，月亮巨蟹需要熟悉的家——三者同时成立，不必一致。',
    chain: ['把三句话逐一翻译成主题：意志 / 安全感 / 呈现。', '对应太阳 / 月亮 / 上升（第一宫）。', '用「太阳摩羯＋上升双子＋月亮巨蟹」的组合验证三者可并存。', '排除颠倒与把金星当呈现方式的选项。'],
    reviewIds: ['p-sun', 'p-moon', 't-rising', 'h-1'], commonError: '把三者合并成「性格」，或把上升说成假面。',
    relatedIds: ['p-sun', 'p-moon', 't-rising'], position: 3,
  }),
]

export const COVERAGE_QUESTIONS: Question[] = [
  ...buildGroup(ZODIAC_SPECS, 'zodiac', '星座', 'definition', 'application', 'qcv-z'),
  ...buildGroup(PLANET_SPECS, 'planet', '行星', 'definition', 'application', 'qcv-p'),
  ...buildGroup(ASPECT_SPECS, 'aspect', '相位', 'definition', 'geometry', 'qcv-a'),
  ...CONTRAST,
]
