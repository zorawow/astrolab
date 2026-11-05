import type { Question, SingleQuestion } from '../types'

/**
 * 十二宫位基础题库：每宫三种练习方向各 1 题（共 36 题）
 *  forward  宫位 → 含义
 *  reverse  含义 → 宫位
 *  scenario 情境 → 应用
 * 另外提供 8 道对比辨析题与 4 道综合应用题。
 * 每题都带 unitId / direction / 完整解析（为什么对、每个干扰项为什么错、推理链、复习指向）。
 */

const NAME: Record<string, string> = {
  'h-1': '第一宫', 'h-2': '第二宫', 'h-3': '第三宫', 'h-4': '第四宫',
  'h-5': '第五宫', 'h-6': '第六宫', 'h-7': '第七宫', 'h-8': '第八宫',
  'h-9': '第九宫', 'h-10': '第十宫', 'h-11': '第十一宫', 'h-12': '第十二宫',
}

/** 各宫简明生活领域：作为正向题的正确选项，也是干扰项解析的依据 */
const AREA: Record<string, string> = {
  'h-1': '自我呈现、外在气质与第一印象',
  'h-2': '个人资源、收入方式与自我价值感',
  'h-3': '日常沟通、基础学习与近处环境',
  'h-4': '家庭、根基与私下的归属感',
  'h-5': '创造、玩乐与自我展现的喜悦',
  'h-6': '日常任务、流程习惯与健康照料',
  'h-7': '一对一伴侣、合作与契约关系',
  'h-8': '共享资源、亲密信任与危机转化',
  'h-9': '高等教育、世界观与跨文化远行',
  'h-10': '事业方向、公共角色与社会评价',
  'h-11': '朋友、社群与共同的未来愿景',
  'h-12': '独处、潜意识与不易言明的幕后领域',
}

interface HouseSpec {
  id: string
  /** 反向题给出的线索（不直接照抄 AREA，考察真实理解） */
  clue: string
  /** 该宫为什么主管这一领域 */
  why: string
  /** 情境题题干 */
  scenario: string
  fwdWrong: [string, string, string]
  revWrong: [string, string, string]
  scnWrong: [string, string, string]
  /** 常见混淆对象 */
  confuseWith: string
}

const SPECS: HouseSpec[] = [
  {
    id: 'h-1', clue: '一个人以什么姿态进入世界、别人第一眼接收到的气质与本能反应',
    why: '第一宫由上升点 ASC 开启，是出生瞬间「从不可见到可见」的分界，因此传统上把出场方式与自我呈现归给它。',
    scenario: '分析一张星盘时，想讨论这个人「刚进一个新环境会怎么出场、还没开口就给人什么感觉」，应重点观察哪个宫位？',
    fwdWrong: ['h-4', 'h-10', 'h-8'], revWrong: ['h-7', 'h-4', 'h-10'], scnWrong: ['h-7', 'h-10', 'h-6'],
    confuseWith: 'h-7',
  },
  {
    id: 'h-2', clue: '完全由自己支配的收入、物品、才能，以及「我值多少」的价值感',
    why: '第二宫承接第一宫「我出现了」，接着回答「我凭什么站稳、什么属于我」，所以同时管资源与自我价值。',
    scenario: '读盘时想讨论一个人「如何积累属于自己的资源、谈报酬时怎样估量自己的能力」，应重点观察哪个宫位？',
    fwdWrong: ['h-8', 'h-10', 'h-6'], revWrong: ['h-8', 'h-10', 'h-5'], scnWrong: ['h-8', 'h-6', 'h-10'],
    confuseWith: 'h-8',
  },
  {
    id: 'h-3', clue: '说话写作、日常学习、手足邻里与短途往返的信息交换',
    why: '第三宫按「生活半径」分类，管的是不需远行就能碰到的近处网络，特点是近、具体、来回往返。',
    scenario: '想讨论一张盘里「这个人每天怎么接收和转述信息、与身边人和近处环境如何往来」，应重点观察哪个宫位？',
    fwdWrong: ['h-9', 'h-4', 'h-11'], revWrong: ['h-9', 'h-6', 'h-11'], scnWrong: ['h-9', 'h-11', 'h-4'],
    confuseWith: 'h-9',
  },
  {
    id: 'h-4', clue: '原生家庭与成年后自己建立的家、私人生活、可以退回去的安全基地',
    why: '第四宫由天底 IC 标记，位于星盘最下方，象征不被看见却托住一切的根基，因此归给家庭与归属。',
    scenario: '分析星盘时，想理解一个人「什么样的环境才算安顿下来、私下需要怎样的归属」，应重点观察哪个宫位？',
    fwdWrong: ['h-10', 'h-12', 'h-1'], revWrong: ['h-10', 'h-12', 'h-1'], scnWrong: ['h-10', 'h-1', 'h-12'],
    confuseWith: 'h-10',
  },
  {
    id: 'h-5', clue: '不带实用目的的创作、游戏、恋爱表达与「我想被看见」的喜悦',
    why: '第五宫承接第四宫的安顿，是第一次主动向外输出，把属于自己的东西投射出去并期待回响。',
    scenario: '想讨论一个人「纯粹因为喜欢而做的作品、以及怎样把有趣的一面亮给别人」，应重点观察哪个宫位？',
    fwdWrong: ['h-7', 'h-11', 'h-3'], revWrong: ['h-7', 'h-11', 'h-10'], scnWrong: ['h-7', 'h-11', 'h-6'],
    confuseWith: 'h-7',
  },
  {
    id: 'h-6', clue: '任务怎么排、习惯怎么养、身体怎么日常照料，以及具体可交付的服务',
    why: '第六宫处理「维持系统正常运作」：事务的日常维护与身体的日常维护共通点是规律、细节、可持续。',
    scenario: '读盘时想理解一个人「怎样把一天的事拆成可执行步骤、如何维持作息与流程」，应重点观察哪个宫位？',
    fwdWrong: ['h-10', 'h-12', 'h-2'], revWrong: ['h-10', 'h-12', 'h-3'], scnWrong: ['h-10', 'h-12', 'h-2'],
    confuseWith: 'h-10',
  },
  {
    id: 'h-7', clue: '伴侣、合伙人、需要双方签字的约定，以及一对一关系里的协商',
    why: '第七宫由下降点 DSC 开启，正对第一宫，象征「我面对的那个明确的你」与由此产生的配合和承诺。',
    scenario: '分析星盘时，想讨论这个人「进入一对一合作会怎么分职责、怎样把关系说清楚」，应重点观察哪个宫位？',
    fwdWrong: ['h-1', 'h-11', 'h-5'], revWrong: ['h-1', 'h-11', 'h-5'], scnWrong: ['h-1', 'h-11', 'h-5'],
    confuseWith: 'h-1',
  },
  {
    id: 'h-8', clue: '共同账户与债务、深层亲密与信任，以及旧结构瓦解后的转化',
    why: '第八宫紧接第七宫：关系成立后出现无法各自保留的部分，资源、秘密与风险都跨越了个人边界。',
    scenario: '想讨论一张盘里「两个人共同承担的资源、以及关系带来的不可逆改变」，应重点观察哪个宫位？',
    fwdWrong: ['h-2', 'h-5', 'h-12'], revWrong: ['h-2', 'h-7', 'h-12'], scnWrong: ['h-2', 'h-7', 'h-12'],
    confuseWith: 'h-2',
  },
  {
    id: 'h-9', clue: '高等教育、哲学信念、跨文化远行，以及为经验寻找整体意义',
    why: '第九宫与第三宫正对，把近处收集的信息推到「这意味着什么」的层面，判据是视野与框架的更新。',
    scenario: '读盘时想理解一个人「如何形成与更新自己的世界观、通过什么方式把视野推远」，应重点观察哪个宫位？',
    fwdWrong: ['h-3', 'h-10', 'h-11'], revWrong: ['h-3', 'h-10', 'h-6'], scnWrong: ['h-3', 'h-10', 'h-11'],
    confuseWith: 'h-3',
  },
  {
    id: 'h-10', clue: '想在社会上承担什么角色、获得怎样的公众评价，以及公共形象与成就',
    why: '第十宫由天顶 MC 标记，是星盘最上方、最公开的位置，因此归给事业方向、声望与社会责任。',
    scenario: '分析星盘时，想讨论一个人「希望被社会看见成什么、在职业与公共领域承担什么」，应重点观察哪个宫位？',
    fwdWrong: ['h-6', 'h-4', 'h-2'], revWrong: ['h-6', 'h-4', 'h-2'], scnWrong: ['h-6', 'h-4', 'h-2'],
    confuseWith: 'h-6',
  },
  {
    id: 'h-11', clue: '朋友、自愿组成的社群，以及一群人共同认可的未来方向',
    why: '第十一宫把关系从一对一扩展到多人网络，靠共同愿景而非契约维系，因此朋友与未来同宫。',
    scenario: '想讨论一张盘里「这个人会参与怎样的团体、愿意和一群人一起把什么变成现实」，应重点观察哪个宫位？',
    fwdWrong: ['h-7', 'h-5', 'h-10'], revWrong: ['h-7', 'h-5', 'h-9'], scnWrong: ['h-7', 'h-5', 'h-10'],
    confuseWith: 'h-7',
  },
  {
    id: 'h-12', clue: '需要独处恢复、梦境与讲不清的直觉，以及不署名的幕后照料',
    why: '第十二宫位于上升点之前，是尚未浮现到光下的最后一段，象征边界变薄、难以命名的内容。',
    scenario: '读盘时想理解一个人「怎样与不易言明的内在经验相处、什么时候需要退出可命名的世界」，应重点观察哪个宫位？',
    fwdWrong: ['h-6', 'h-4', 'h-8'], revWrong: ['h-6', 'h-4', 'h-8'], scnWrong: ['h-6', 'h-4', 'h-8'],
    confuseWith: 'h-6',
  },
]

const LETTERS = ['a', 'b', 'c', 'd'] as const

interface Opt { id: string; text: string }

function buildSingle(params: {
  id: string
  topic: string
  prompt: string
  correctText: string
  wrong: { text: string; note: string }[]
  whyCorrect: string
  chain: string[]
  reviewIds: string[]
  unitId: string
  direction: 'forward' | 'reverse' | 'scenario' | 'contrast' | 'application'
  commonError: string
  extra?: string
  relatedIds?: string[]
  position: number
}): SingleQuestion {
  const pos = params.position % 4
  const options: Opt[] = []
  const notes: Record<string, string> = {}
  let wi = 0
  for (let i = 0; i < 4; i++) {
    if (i === pos) {
      options.push({ id: LETTERS[i], text: params.correctText })
    } else {
      const w = params.wrong[wi++]
      options.push({ id: LETTERS[i], text: w.text })
      notes[LETTERS[i]] = w.note
    }
  }
  const correctId = LETTERS[pos]
  return {
    id: params.id,
    type: 'single',
    topic: params.topic,
    category: 'house',
    unitId: params.unitId,
    direction: params.direction,
    relatedIds: params.relatedIds ?? [params.unitId, ...params.reviewIds.filter((r) => r !== params.unitId)].slice(0, 3),
    prompt: params.prompt,
    options,
    answer: correctId,
    explanation: params.whyCorrect,
    commonError: params.commonError,
    analysis: {
      whyCorrect: params.whyCorrect,
      optionNotes: notes,
      reasoningChain: params.chain,
      reviewIds: params.reviewIds,
      extra: params.extra,
      notToInfer: '情境题训练的是占星体系内部的解释方法，不能从一个人的实际行为反推其星盘配置。',
    },
  }
}

function areaNote(id: string, targetArea: string): string {
  return `「${NAME[id]}」主管的是${AREA[id]}，与题目所问的${targetArea}不是同一领域。`
}

const houseQuestions: Question[] = SPECS.flatMap((s, i) => {
  const area = AREA[s.id]
  const name = NAME[s.id]
  const wrongFwd = s.fwdWrong.map((wid) => ({
    text: AREA[wid],
    note: `这描述的是${NAME[wid]}（${AREA[wid]}），不是${name}。${s.why}`,
  }))
  const wrongRev = s.revWrong.map((wid) => ({
    text: NAME[wid],
    note: areaNote(wid, s.clue),
  }))
  const wrongScn = s.scnWrong.map((wid) => ({
    text: NAME[wid],
    note: `${areaNote(wid, s.clue)}题目中的情境关键词应落到${name}的${area}。`,
  }))
  const confused = s.confuseWith
  const commonError = `最容易把${name}与${NAME[confused]}混淆：${name}管${area}，${NAME[confused]}管${AREA[confused]}。`
  const reviewIds = [s.id, confused]

  const forward = buildSingle({
    id: `qh-${s.id}-f`,
    topic: `${name} · 宫位→含义`,
    prompt: `在占星体系中，${name}主要对应以下哪一类生活领域？`,
    correctText: area,
    wrong: wrongFwd,
    whyCorrect: `${name}主管${area}。${s.why}因此四个选项中只有「${area}」与它对应。`,
    chain: [
      '第一步 看清题目方向：这是「宫位 → 含义」，要由宫位名称反推它主管的生活领域。',
      `第二步 回忆${name}的定位：${s.why}`,
      `第三步 逐个排除：${s.fwdWrong.map((w) => `${NAME[w]}＝${AREA[w]}`).join('；')}，都与${name}无关。`,
      `第四步 确认「${area}」正是${name}的范围，得到唯一答案。`,
    ],
    reviewIds,
    unitId: s.id,
    direction: 'forward',
    commonError,
    extra: `进阶：读盘时还要看${name}的宫头星座与宫内行星，才能从「领域」推进到「具体怎么表现」。`,
    position: i,
  })

  const reverse = buildSingle({
    id: `qh-${s.id}-r`,
    topic: `${name} · 含义→宫位`,
    prompt: `如果想从占星的角度研究「${s.clue}」，通常会重点关注哪个宫位？`,
    correctText: name,
    wrong: wrongRev,
    whyCorrect: `题干关键词「${s.clue}」指向${area}，属于${name}。${s.why}`,
    chain: [
      '第一步 把题干里的关键词拆出来，先别急着看选项。',
      `第二步 把这些关键词归到一个生活领域：${s.clue} → ${area}。`,
      `第三步 对照十二宫分工：${s.revWrong.map((w) => `${NAME[w]}管${AREA[w]}`).join('；')}，都不是这组关键词的重点。`,
      `第四步 由领域反推宫位，落在${name}。`,
    ],
    reviewIds,
    unitId: s.id,
    direction: 'reverse',
    commonError,
    position: i + 1,
  })

  const scenario = buildSingle({
    id: `qh-${s.id}-s`,
    topic: `${name} · 情境→应用`,
    prompt: `${s.scenario}`,
    correctText: name,
    wrong: wrongScn,
    whyCorrect: `题干描述的情境核心是${area}，对应${name}。${s.why}这类题目练的是「把生活情境翻译成宫位语言」。`,
    chain: [
      '第一步 把情境里的动词与名词挑出来，判断它问的是哪类生活主题。',
      `第二步 归纳成领域：${area}。`,
      `第三步 检查干扰项：${s.scnWrong.map((w) => `${NAME[w]}实际管${AREA[w]}`).join('；')}，与情境不合。`,
      `第四步 定位${name}，并说明这是占星体系内部的解释训练，不是从行为诊断星盘。`,
    ],
    reviewIds,
    unitId: s.id,
    direction: 'scenario',
    commonError,
    position: i + 2,
  })

  return [forward, reverse, scenario]
})

// ===== 对比辨析题：每道都解释「错选与正选的关键区别」并给两个生活例子 =====
const contrastQuestions: Question[] = [
  buildSingle({
    id: 'qh-c-1', topic: '第二宫 vs 第八宫', direction: 'contrast', unitId: 'h-2',
    prompt: '关于「第二宫」与「第八宫」的区别，下列哪一项正确？',
    correctText: '第二宫是个人可独立支配的资源，第八宫是与他人共享、受他人影响的资源',
    wrong: [
      { text: '两宫都只管钱，可互换使用', note: '这是把资源主题压扁了：两宫的区别恰恰在「所有权是否独立」，不能互换。' },
      { text: '第二宫管共享资源，第八宫管个人收入', note: '方向完全颠倒。第二宫是「我的」，第八宫是「我们的」。' },
      { text: '第二宫管事业成就，第八宫管家庭', note: '事业属第十宫、家庭属第四宫，与这两宫的主题无关。' },
    ],
    whyCorrect: '第二宫承接「我出现了」，回答「我凭什么站稳」；第八宫承接「关系成立了」，处理无法各自保留的部分。例子①：自己的工资卡归二宫，两人共同担保的房贷归八宫。例子②：自己攒钱买的工具归二宫，合伙时谈退出条款归八宫。判据是「是否与他人共享、是否受他人影响」。',
    chain: ['先定位两宫在宫位顺序中的位置：2 宫在自我之后，8 宫在关系之后。', '再抓核心差别：资源的所有权边界是否独立。', '用两个生活例子验证：工资卡 vs 共同贷款；个人工具 vs 合伙条款。', '排除「可互换」「方向颠倒」「错配到十宫四宫」三项。'],
    reviewIds: ['h-2', 'h-8'], commonError: '看到「钱」就不分边界，把两宫混用。',
    relatedIds: ['h-2', 'h-8'], position: 0,
  }),
  buildSingle({
    id: 'qh-c-2', topic: '第四宫 vs 第十宫', direction: 'contrast', unitId: 'h-4',
    prompt: '一对正对宫位中，「私人根基」与「公共角色」分别对应哪两宫？',
    correctText: '第四宫＝私人根基，第十宫＝公共角色',
    wrong: [
      { text: '第一宫＝私人根基，第七宫＝公共角色', note: '一宫／七宫是「自我—他人」横轴，不是公私竖轴。' },
      { text: '第六宫＝私人根基，第十宫＝公共角色', note: '六宫讲日常工作方式（过程），不是私下的家与归属。' },
      { text: '第四宫＝公共角色，第十宫＝私人根基', note: '方向颠倒：IC 在最下方最私密，MC 在最上方最公开。' },
    ],
    whyCorrect: '第四宫由天底 IC 标记，在星盘最下方；第十宫由天顶 MC 标记，在最上方。例子①：下班关上门只想不被打扰，是四宫；同一段发言被行业会议记录转发，是十宫。例子②：搬家后把书摆出来才算安顿（四宫），而决定要不要站到台前承担责任（十宫）。两宫正对，构成公私竖轴。',
    chain: ['先认轴：题目说的是「私人／公共」，对应竖轴 IC—MC。', '定位 IC → 第四宫（私下的根），MC → 第十宫（公开的角色）。', '排除横轴一／七宫，以及把六宫的「过程」当成「归属」的选项。', '用「下班关门」与「会议记录」两个场景验证方向。'],
    reviewIds: ['h-4', 'h-10', 't-ic', 't-mc'], commonError: '把四／十宫的公私竖轴与一／七宫的自我—他人横轴弄混。',
    relatedIds: ['h-4', 'h-10'], position: 1,
  }),
  buildSingle({
    id: 'qh-c-3', topic: '第五宫 vs 第十一宫', direction: 'contrast', unitId: 'h-5',
    prompt: '「个人创造表达」与「群体共同愿景」在宫位上的正确区分是？',
    correctText: '第五宫是个人创造与自我展现，第十一宫是社群参与与共同目标',
    wrong: [
      { text: '第五宫是群体，第十一宫是个人', note: '方向颠倒；五宫以「我」为主，十一宫以「我们」为主。' },
      { text: '两宫都讲社交，没有实质区别', note: '一个是单向的自我表达，一个是多人的自愿联合，层级不同。' },
      { text: '第五宫是朋友，第七宫是创作', note: '朋友属十一宫，创作属五宫，七宫是一对一契约关系，全部错位。' },
    ],
    whyCorrect: '第五宫是「我把自己亮出来」，第十一宫是「我们一起想做成什么」。例子①：周末画一张没人约稿的图是五宫；几个人因共同目标固定每周碰面是十一宫。例子②：想在聚会上被看见是五宫；为社群写一份三年规划是十一宫。前者是独唱，后者是合唱。',
    chain: ['先判断题眼：题目问「个人」与「群体」的层级差别。', '把五宫定位为自我表达、十一宫定位为自愿联合。', '排除颠倒与「没有区别」的说法，再用独唱／合唱的类比验证。', '补一层：七宫是一对一契约，属于第三种关系层级。'],
    reviewIds: ['h-5', 'h-11', 'h-7'], commonError: '把「社交」当成单一主题，忽略个人／一对一／群体的层级。',
    relatedIds: ['h-5', 'h-11'], position: 2,
  }),
  buildSingle({
    id: 'qh-c-4', topic: '第六宫 vs 第十宫', direction: 'contrast', unitId: 'h-6',
    prompt: '若把「日常工作方式」误答成「事业与公众角色」，错在哪里？',
    correctText: '前者属第六宫（过程与维护），后者属第十宫（社会位置与评价）',
    wrong: [
      { text: '没有错，两宫本来就是同一个意思', note: '若可互换，就不会同时存在两个宫位；差别在「怎么做」与「被看成什么」。' },
      { text: '日常工作属第十宫，事业属第六宫', note: '方向颠倒：六宫是任务流程，十宫是公共角色。' },
      { text: '日常工作属第二宫，事业属第十宫', note: '二宫是个人资源与价值感，不是任务执行方式。' },
    ],
    whyCorrect: '第六宫处理「今天这些事怎么稳稳做完」，第十宫处理「我在社会分工中占据什么位置、被怎样评价」。例子①：把待办拆成可勾选步骤（六宫）vs 决定这份经历在履历里意味着什么（十宫）。例子②：调整椅子高度照顾腰（六宫）vs 作为负责人在行业会议上发言（十宫）。记公式：六宫是动词，十宫是名词。',
    chain: ['先把「工作」一词拆成两个意思：日常劳务 / 职业生涯。', '把过程与维护归六宫，把位置与评价归十宫。', '用待办清单与履历、椅子高度与会议发言两组例子对照。', '排除「同义」「颠倒」「错配二宫」三项。'],
    reviewIds: ['h-6', 'h-10'], commonError: '中文「工作」涵盖太广，最容易把六宫答成十宫。',
    relatedIds: ['h-6', 'h-10'], position: 3,
  }),
  buildSingle({
    id: 'qh-c-5', topic: '第三宫 vs 第九宫', direction: 'contrast', unitId: 'h-3',
    prompt: '「收集近处具体信息」与「建立整体世界观」分别归哪两宫？',
    correctText: '第三宫＝近处信息流通，第九宫＝意义与远景的建构',
    wrong: [
      { text: '第三宫＝世界观，第九宫＝日常沟通', note: '方向颠倒：三宫问「发生了什么」，九宫问「这意味着什么」。' },
      { text: '两宫都只关上学，按学历高低区分', note: '判据是生活半径与抽象层次，不是学历等级。' },
      { text: '第三宫＝远行，第九宫＝邻里', note: '远近完全反了；短途与邻里属三宫。' },
    ],
    whyCorrect: '第三宫管近、具体、即时往返；第九宫管远、抽象、成体系。例子①：群聊里转述一条消息（三宫）vs 读一整套理论后改写自己的判断框架（九宫）。例子②：通勤听播客、帮邻居代收（三宫）vs 在异地长期生活后发现「理所当然」只是地方习惯（九宫）。',
    chain: ['抓判据：题目对比的是「近／远」「事实／意义」。', '把信息流通归三宫、意义建构归九宫。', '排除颠倒、按学历分级、远近反置三项。', '用群聊转述 vs 理论重构、通勤 vs 异地生活两组例子复核。'],
    reviewIds: ['h-3', 'h-9'], commonError: '看到「学习」就以为三宫管学历、九宫管旅游。',
    relatedIds: ['h-3', 'h-9'], position: 0,
  }),
  buildSingle({
    id: 'qh-c-6', topic: '第一宫 vs 第七宫', direction: 'contrast', unitId: 'h-1',
    prompt: '关于第一宫与第七宫这条对轴，正确的是？',
    correctText: '第一宫讲自我如何出场，第七宫讲与一个明确的对方协商与立约',
    wrong: [
      { text: '第一宫讲内心，第七宫讲外表', note: '一宫偏外在呈现而非内心深处；七宫也不是「外表」。' },
      { text: '两宫都讲关系，只是程度不同', note: '一宫的起点是「我」，七宫的起点是「你和我」，主题方向不同。' },
      { text: '第一宫讲伴侣，第七宫讲自我', note: '方向完全颠倒；ASC 开一宫，DSC 开七宫。' },
    ],
    whyCorrect: 'ASC 与 DSC 是同一条横轴的两端。例子①：推门进屋时的第一反应（一宫）vs 坐下来和合伙人分职责、写退出条款（七宫）。例子②：照片里拘谨、本人却开朗（一宫的现场气质）vs 长期相处中谁先让步（七宫的协商）。',
    chain: ['先认轴：一／七宫是自我—他人横轴。', '把「出场与启动」归一宫，「协商与约定」归七宫。', '排除把一宫说成「内心」以及把两宫都说成关系的选项。', '用推门第一反应 vs 合伙条款、现场气质 vs 长期让步验证。'],
    reviewIds: ['h-1', 'h-7', 't-rising'], commonError: '把上升当成「内心」、把七宫当成泛泛的人际。',
    relatedIds: ['h-1', 'h-7'], position: 1,
  }),
  buildSingle({
    id: 'qh-c-7', topic: '第六宫 vs 第十二宫', direction: 'contrast', unitId: 'h-12',
    prompt: '同样「在幕后」，第六宫与第十二宫最实用的区分是什么？',
    correctText: '第六宫有明确任务、流程与交付；第十二宫处理尚未成形、难以命名的内容',
    wrong: [
      { text: '两宫都代表不吉利，无需区分', note: '宫位不是吉凶标签；两者都是正常的生活领域。' },
      { text: '第六宫管潜意识，第十二宫管排班', note: '方向颠倒：排班与流程属六宫，潜意识属十二宫。' },
      { text: '按白天／晚上来分', note: '判据是「有没有清单」，不是时间段。' },
    ],
    whyCorrect: '例子①：把活动物料逐项对齐、发现遗漏补上（六宫，有清单）vs 醒来记得一个说不清情节却挥之不去的画面（十二宫，没有清单）。例子②：定期记账与作息（六宫）vs 连续社交后只想关掉消息安静待着（十二宫）。记法：「有没有清单」。',
    chain: ['先找共同点：都不在聚光灯下。', '再抓差别：是否有明确任务、流程与交付。', '用物料清单 vs 梦境画面、记账 vs 独处两组例子验证。', '排除「吉凶标签」「方向颠倒」「按时间分」三项。'],
    reviewIds: ['h-6', 'h-12', 'h-4'], commonError: '把「幕后」当成同一个主题，或直接把十二宫当凶宫。',
    relatedIds: ['h-6', 'h-12'], position: 2,
  }),
  buildSingle({
    id: 'qh-c-8', topic: '太阳 vs 上升', direction: 'contrast', unitId: 'h-1',
    prompt: '「核心自我认同」与「外在呈现方式」在星盘里主要分别对应什么？',
    correctText: '太阳＝核心自我与意志；上升点／第一宫＝外在气质与本能反应',
    wrong: [
      { text: '太阳＝伪装，上升＝真我', note: '把人格简化成单一核心；本能反应同样是真实自我的一部分。' },
      { text: '太阳＝外在呈现，上升＝核心意志', note: '方向颠倒：太阳是「我想成为谁」，上升是「我怎么被看见」。' },
      { text: '两者完全相同，只是叫法不同', note: '一个管意志方向，一个管出场方式；太阳摩羯配上升双子并不矛盾。' },
    ],
    whyCorrect: '例子①：主动选择更像「自己想成为的人」会走的路（太阳）vs 推门进屋时没经过思考的第一反应（上升）。例子②：希望稳重可靠（太阳摩羯）却看起来机灵话多（上升双子），两者同时成立。太阳是主动选择的意志，上升是往往未经选择的呈现。',
    chain: ['拆题眼：题目对比「核心认同」与「呈现方式」。', '把意志方向归太阳，把出场与本能反应归上升／一宫。', '排除「伪装说」「颠倒」「同义」三项。', '用「太阳摩羯＋上升双子」的组合验证二者可以并存。'],
    reviewIds: ['p-sun', 't-rising', 'h-1'], commonError: '把上升说成假面具，或把两者当成同一个意思。',
    relatedIds: ['p-sun', 't-rising', 'h-1'], position: 3,
  }),
]

// ===== 综合应用题：需要先做多层推理 =====
const applicationQuestions: Question[] = [
  buildSingle({
    id: 'qh-a-1', topic: '火星落第十宫', direction: 'application', unitId: 'h-10',
    prompt: '按「行星主题 × 宫位领域 × 星座风格」的顺序，火星落在第十宫、且火星在摩羯座，最合理的传统解释路径是？',
    correctText: '火星＝行动主张 → 十宫＝公共角色 → 摩羯＝按结构长期推进 → 以纪律经营职业角色',
    wrong: [
      { text: '火星＝情绪需求 → 十宫＝家庭 → 直接得出「恋家」', note: '三重错位：火星不是情绪（月亮才是），十宫不是家庭（四宫才是），结论也跳过了星座层。' },
      { text: '只看火星在摩羯，就能断定职业成就高低', note: '漏掉宫位层，且占星不产出成就高低的结论。' },
      { text: '星座与宫位可以互相替代，选一个即可', note: '星座是风格、宫位是领域，两个维度必须相乘。' },
    ],
    whyCorrect: '正确做法是逐层拆：①火星代表行动力、主张与推进方式；②第十宫把主题投注到事业与公共角色；③摩羯（土象基本、土星守护）让行动偏按结构与长期目标走；④合成「以纪律和规划经营公共角色，愿意承担可累积的责任」；⑤校验边界——不能由此断言具体职业、职级或收入。例子：面对一个需要三年推进的项目，倾向先定标准与节点；面对临时插队的要求，会先检查它是否破坏长期安排。',
    chain: ['第一步 拆行星：火星＝行动、主张、推进。', '第二步 拆宫位：第十宫＝事业、公共角色与社会评价。', '第三步 拆星座：摩羯＝土象基本、重结构与长期成果。', '第四步 三者相乘，得到可解释的描述，而不是一句笼统结论。', '第五步 明确不应推断的内容：职业名称、职级、成就高低。'],
    reviewIds: ['h-10', 'p-mars', 'z-capricorn', 'h-6'], commonError: '只看行星落座就下结论，漏掉宫位；或把「过程」与「位置」混淆。',
    relatedIds: ['h-10', 'p-mars', 'z-capricorn'], position: 0,
  }),
  buildSingle({
    id: 'qh-a-2', topic: '金星落第七宫', direction: 'application', unitId: 'h-7',
    prompt: '要解释「金星落在第七宫」，下列哪条推理顺序最完整？',
    correctText: '先拆金星（吸引与价值）→ 再拆七宫（一对一关系）→ 再补星座风格 → 最后声明不推断的内容',
    wrong: [
      { text: '直接给出「一定会结婚」的结论', note: '跳过全部推理层，且占星不预测具体事件。' },
      { text: '只看第七宫，行星是什么不重要', note: '漏掉行星主题，解读会失去「什么能量」这一层。' },
      { text: '先确定对方长相，再反推宫位', note: '方向完全反了，且本站不产出人物画像。' },
    ],
    whyCorrect: '例子①：金星在天秤（风象基本、金星守护）→ 传统解释讨论「以公平沟通与共同审美建立关系，重视对等」。例子②：金星在金牛（土象固定）→ 更偏「以稳定可靠与感官上的安心维系关系」。同一个七宫，因星座不同而解读不同；这正是「行星 × 宫位 × 星座」的意义。最后必须补一句：不推断对方外貌、相遇时间或关系结局。',
    chain: ['第一步 行星：金星＝吸引、审美、价值判断。', '第二步 宫位：第七宫＝一对一关系与协商。', '第三步 星座：天秤偏对等沟通，金牛偏稳定安心。', '第四步 合成可解释的相处方式描述。', '第五步 声明不推断人物画像与关系结局。'],
    reviewIds: ['h-7', 'p-venus', 'z-libra', 'z-taurus'], commonError: '把组合解释当成固定答案，忽略星座这一层。',
    relatedIds: ['h-7', 'p-venus'], position: 1,
  }),
  buildSingle({
    id: 'qh-a-3', topic: '月亮落第四宫', direction: 'application', unitId: 'h-4',
    prompt: '「月亮落在第四宫、月亮在巨蟹座」的传统解释，最合理的合成结果是？',
    correctText: '情绪安稳与家／熟悉环境高度连动，倾向通过照顾与营造归属来安顿自己',
    wrong: [
      { text: '可以据此判断此人原生家庭必定和睦', note: '把象征主题当成对真实经历的因果推断，越界了。' },
      { text: '代表此人一定会从事房地产行业', note: '把「家」的主题直接翻译成职业预测，占星不产出职业名称。' },
      { text: '月亮在这里没有任何特别含义', note: '月亮与四宫主题叠合（且月亮守护巨蟹），表达集中，是有信息量的。' },
    ],
    whyCorrect: '拆法：月亮＝情绪需求与安全感；第四宫＝家与内在基地；巨蟹＝水象基本、月亮守护，重照顾与情感联结。三者叠合，传统解释讨论「安全感与熟悉环境连动」。两个生活例子：①搬家后第一件事把书和杯子摆出来才算安顿；②在外应对一天评价后，回家只想不被打扰。注意：这只描述主题，不判断家庭是否和睦、也不推断职业。',
    chain: ['第一步 月亮＝情绪需求与安全感来源。', '第二步 第四宫＝家、根基、私人生活。', '第三步 巨蟹＝照顾、记忆、情感联结（月亮守护）。', '第四步 合成「通过营造归属安顿自己」。', '第五步 划边界：不推断家庭境遇、童年经历或职业。'],
    reviewIds: ['h-4', 'p-moon', 'z-cancer', 'h-10'], commonError: '把「主题叠合」误当成对真实家庭经历的判断。',
    relatedIds: ['h-4', 'p-moon', 'z-cancer'], position: 2,
  }),
  buildSingle({
    id: 'qh-a-4', topic: '水星落第三宫', direction: 'application', unitId: 'h-3',
    prompt: '解释「水星落在第三宫、水星在处女座」时，下列哪一项是必须避免的越界推断？',
    correctText: '由此断定此人的智商水平、学业成绩或具体职业',
    wrong: [
      { text: '说明日常沟通偏精确、爱核对细节', note: '这属于占星体系内的合理描述，不是越界。' },
      { text: '指出水星是主题、三宫是领域、处女是风格', note: '这正是正确的三层拆法。' },
      { text: '提醒还需结合相位与整盘其他位置', note: '这是必要的谨慎说明。' },
    ],
    whyCorrect: '题目问「必须避免」的越界。合理路径是：水星＝思考与信息处理；第三宫＝日常沟通与近处学习；处女＝土象变动、水星守护，重分辨与可用；合成「在日常交流中把话说准、适合细读文字与流程」。两个生活例子：①群聊里把含糊表述改清楚；②把重复流程整理成模板。但占星不被科学证实为能力测评，也不预测成绩与职业，因此「断定智商／成绩／职业」是越界的。',
    chain: ['先按三层拆出合理描述：行星主题 × 宫位领域 × 星座风格。', '用「改清楚表述」「整理模板」两个例子验证描述是否落在日常沟通上。', '再检查选项：哪一条把象征风格当成了能力测量或事件预测。', '确定「智商／成绩／职业」属于越界推断。'],
    reviewIds: ['h-3', 'p-mercury', 'z-virgo', 'h-9'], commonError: '把水星当成智力指标，或把占星解释当成能力评估。',
    relatedIds: ['h-3', 'p-mercury', 'z-virgo'], position: 3,
  }),
]

export const HOUSE_QUESTIONS: Question[] = [
  ...houseQuestions,
  ...contrastQuestions,
  ...applicationQuestions,
]
