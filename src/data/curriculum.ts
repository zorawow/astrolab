import type { Course, Question, QuestionDirection, UnitPractice } from '../types'
import { KNOWLEDGE_BY_ID, getTeaching } from './index'
import { QUESTIONS, QUESTIONS_BY_ID } from './questions'

/**
 * 课程 → 知识点 → 题目 → 练习记录 的唯一关联中枢。
 * 每个模块都有一份完整知识点清单；禁止「只测几个点却显示模块完成」。
 */
export interface CurriculumModule {
  id: string
  title: string
  desc: string
  stage: number
  /** 该模块必须分别掌握的知识单元（知识卡 id） */
  units: string[]
  /** 每个知识单元必须覆盖的练习方向 */
  directions: QuestionDirection[]
  /** 是否生成逐单元微课程 */
  hasUnitCourses: boolean
}

const houseUnits = Array.from({ length: 12 }, (_, i) => `h-${i + 1}`)
const zodiacUnits = [
  'z-aries', 'z-taurus', 'z-gemini', 'z-cancer', 'z-leo', 'z-virgo',
  'z-libra', 'z-scorpio', 'z-sagittarius', 'z-capricorn', 'z-aquarius', 'z-pisces',
]
const planetUnits = [
  'p-sun', 'p-moon', 'p-mercury', 'p-venus', 'p-mars',
  'p-jupiter', 'p-saturn', 'p-uranus', 'p-neptune', 'p-pluto',
]
const aspectUnits = ['a-conj', 'a-sext', 'a-sq', 'a-trine', 'a-opp']

export const MODULES: CurriculumModule[] = [
  {
    id: 'houses',
    title: '十二宫位',
    desc: '12 个生活领域，每宫须完成「宫位→含义 / 含义→宫位 / 情境→应用」三类练习',
    stage: 3,
    units: houseUnits,
    directions: ['forward', 'reverse', 'scenario'],
    hasUnitCourses: true,
  },
  {
    id: 'zodiac',
    title: '十二星座',
    desc: '12 个星座，覆盖核心象征、守护星、元素模式、区别与情境应用',
    stage: 1,
    units: zodiacUnits,
    directions: ['definition', 'application'],
    hasUnitCourses: true,
  },
  {
    id: 'planets',
    title: '十大行星',
    desc: '10 个天体，覆盖象征主题、彼此区别、落座与落宫解释',
    stage: 2,
    units: planetUnits,
    directions: ['definition', 'application'],
    hasUnitCourses: true,
  },
  {
    id: 'aspects',
    title: '主要相位',
    desc: '5 个主要相位，覆盖定义、角度几何、象征解释与彼此区别',
    stage: 4,
    units: aspectUnits,
    directions: ['definition', 'geometry'],
    hasUnitCourses: true,
  },
  {
    id: 'chart',
    title: '综合星盘解读',
    desc: '行星 / 星座 / 宫位 / 相位 / 日月升 / 基本组合解释',
    stage: 5,
    units: ['t-chart', 't-rising', 't-mc', 'p-sun', 'p-moon', 't-ruler', 't-orb', 'a-conj', 'h-10'],
    directions: ['application'],
    hasUnitCourses: false,
  },
  {
    id: 'fundamentals',
    title: '元素 · 模式 · 术语',
    desc: '四元素、三模式与核心术语的完整覆盖',
    stage: 1,
    units: [
      'el-fire', 'el-earth', 'el-air', 'el-water',
      'mo-cardinal', 'mo-fixed', 'mo-mutable',
      't-tropical', 't-ruler', 't-orb', 't-chart', 't-rising', 't-mc', 't-ic',
    ],
    directions: ['definition'],
    hasUnitCourses: false,
  },
]

export const MODULES_BY_ID: Record<string, CurriculumModule> = Object.fromEntries(
  MODULES.map((m) => [m.id, m]),
)

export function getModule(id: string): CurriculumModule | undefined {
  return MODULES_BY_ID[id]
}

/** 某个知识单元所属的所有模块 */
export function modulesOfUnit(unitId: string): CurriculumModule[] {
  return MODULES.filter((m) => m.units.includes(unitId))
}

export function unitName(unitId: string): string {
  return KNOWLEDGE_BY_ID[unitId]?.name ?? unitId
}

/** 题目的主知识单元：优先显式 unitId，旧题回退到第一个合法知识点 id */
export function primaryUnit(q: Question): string | undefined {
  if (q.unitId && KNOWLEDGE_BY_ID[q.unitId]) return q.unitId
  return q.relatedIds.find((id) => Boolean(KNOWLEDGE_BY_ID[id]))
}

export const QUESTIONS_BY_UNIT: Record<string, Question[]> = (() => {
  const map: Record<string, Question[]> = {}
  for (const q of QUESTIONS) {
    const u = primaryUnit(q)
    if (!u) continue
    ;(map[u] ??= []).push(q)
  }
  return map
})()

export function questionsForUnit(unitId: string): Question[] {
  return QUESTIONS_BY_UNIT[unitId] ?? []
}

export function unitDirections(unitId: string): QuestionDirection[] {
  return [...new Set(questionsForUnit(unitId).map((q) => q.direction).filter(Boolean))] as QuestionDirection[]
}

// ===== 逐知识单元微课程（由结构化教学数据生成，不在页面里硬编码） =====

function courseId(unitId: string): string {
  return `cu-${unitId}`
}

function buildUnitCourse(module: CurriculumModule, unitId: string, order: number): Course | null {
  const k = KNOWLEDGE_BY_ID[unitId]
  const t = getTeaching(unitId)
  if (!k || !t) return null

  const qs = questionsForUnit(unitId)
  const ids = qs.map((q) => q.id)
  // 随堂小题取前 2 道（学完一个点立即用），其余作为课后练习
  const micro = ids.slice(0, Math.min(2, ids.length))
  const exercise = ids.slice(micro.length, micro.length + 4)

  const sections: Course['sections'] = [
    { heading: '一句话理解', body: t.core },
    { heading: '为什么这样理解', body: t.why },
    {
      heading: '举个例子',
      body: t.examples.map((e) => `【${e.scene}】${e.text}`).join('\n\n'),
    },
    {
      heading: '容易和什么混淆',
      body: t.contrasts
        .map((c) => `与「${KNOWLEDGE_BY_ID[c.withId]?.name ?? c.withId}」：${c.point}`)
        .join('\n\n'),
      misconception: t.misconceptions.map((m) => `${m.text} 纠正：${m.fix}`).join('\n'),
    },
    { heading: '试着自己判断', body: `${t.application.title}。先自己按「行星 → 宫位 → 星座 → 校验边界」想一遍，再展开下方「实际应用」查看分步示范。` },
    {
      heading: '记住这一点',
      body: `${t.recap.oneLiner}\n关键词：${t.recap.keywords.join(' · ')}\n记忆法：${t.recap.memoryTip}`,
      connection: `相关知识点：${t.recap.links.map((id) => KNOWLEDGE_BY_ID[id]?.name ?? id).join('、')}`,
    },
  ]

  return {
    id: courseId(unitId),
    stage: module.stage,
    order,
    title: `${k.name} · ${k.nameEn}`,
    estMinutes: 8,
    objectives: [
      `能用一句话说清${k.name}是什么`,
      `能解释${k.name}为什么具有这些传统象征意义`,
      `能区分${k.name}与至少两个相似概念`,
      `能按步骤完成一次${k.name}的组合应用推理`,
    ],
    hook: t.layers.simple,
    sections,
    summary: t.recap.oneLiner,
    exerciseIds: exercise,
    microExerciseIds: micro,
    relatedKnowledgeIds: [unitId, ...t.recap.links.filter((id) => Boolean(KNOWLEDGE_BY_ID[id]))],
    unitId,
  }
}

/** 39 节逐知识单元完整微课程：12 宫 + 12 星座 + 10 行星 + 5 相位 */
export const UNIT_COURSES: Course[] = MODULES.filter((m) => m.hasUnitCourses).flatMap((m) =>
  m.units.map((u, i) => buildUnitCourse(m, u, 10 + i)).filter((c): c is Course => Boolean(c)),
)

export const UNIT_COURSES_BY_ID: Record<string, Course> = Object.fromEntries(
  UNIT_COURSES.map((c) => [c.id, c]),
)

export function courseForUnit(unitId: string): Course | undefined {
  return UNIT_COURSES_BY_ID[courseId(unitId)]
}

// ===== 完整掌握挑战：排队算法 =====

/**
 * 排队规则（可解释、确定性）：
 * 1. 单元按「已练习次数」升序，未练过的排最前。
 * 2. 按方向轮转出题：每一轮给所有单元各出一道该方向的题，
 *    保证「所有知识点至少考一次」之前不会反复抽同一个点。
 * 3. 全部单元都被覆盖后，追加对比辨析题（contrast）。
 * 4. 最后追加综合运用题（application）。
 * 同一道题只出现一次。
 */
export function buildChallengeQueue(
  moduleId: string,
  practice: Record<string, UnitPractice> = {},
  answeredIds: string[] = [],
): string[] {
  const m = MODULES_BY_ID[moduleId]
  if (!m) return []

  const answered = new Set(answeredIds)
  const picked = new Set<string>()
  const queue: string[] = []

  const push = (q: Question | undefined) => {
    if (!q || picked.has(q.id)) return
    picked.add(q.id)
    queue.push(q.id)
  }

  const unitsByNeed = [...m.units].sort(
    (a, b) => (practice[a]?.attempts ?? 0) - (practice[b]?.attempts ?? 0),
  )

  const pickFor = (unit: string, dir: QuestionDirection): Question | undefined => {
    const pool = questionsForUnit(unit).filter(
      (q) => q.direction === dir && q.type !== 'guided' && q.type !== 'reasoning',
    )
    // 优先没做过的题，再优先没答对过的题
    return (
      pool.find((q) => !answered.has(q.id)) ??
      pool.find((q) => answered.has(q.id)) ??
      undefined
    )
  }

  // 轮转：每一轮覆盖一个方向，所有单元各出一道
  for (const dir of m.directions) {
    for (const unit of unitsByNeed) push(pickFor(unit, dir))
  }

  // 兜底：某些单元缺某方向时，用该单元任意客观题补足，确保全覆盖。
  // 只认「主知识单元」，避免用一道顺带提到某宫的综合题冒充已覆盖该宫。
  const alreadyCovered = coveredUnits(moduleId, queue)
  for (const unit of unitsByNeed) {
    if (alreadyCovered.has(unit)) continue
    const any = questionsForUnit(unit).find(
      (q) => q.type !== 'guided' && q.type !== 'reasoning' && !picked.has(q.id),
    )
    push(any)
  }

  // 全部知识点覆盖后：对比辨析
  const contrastPool = QUESTIONS.filter(
    (q) =>
      q.direction === 'contrast' &&
      q.type !== 'guided' &&
      q.type !== 'reasoning' &&
      !picked.has(q.id) &&
      (q.relatedIds.some((r) => m.units.includes(r)) || (q.unitId && m.units.includes(q.unitId))),
  )
  for (const q of contrastPool.slice(0, 6)) push(q)

  // 最后：综合运用
  const applyPool = QUESTIONS.filter(
    (q) =>
      q.direction === 'application' &&
      q.type !== 'guided' &&
      q.type !== 'reasoning' &&
      !picked.has(q.id) &&
      (q.relatedIds.some((r) => m.units.includes(r)) || (q.unitId && m.units.includes(q.unitId))),
  )
  for (const q of applyPool.slice(0, 6)) push(q)

  return queue
}

/**
 * 队列实际覆盖到的知识单元（用于「已练习 N/M」与完成判定）。
 * 严格按题目的主知识单元 unitId 计：一道题只算覆盖 1 个知识点。
 * 这样对比题、综合题都不能替代某个知识点自己的基础练习，
 * 杜绝「只测了几个点就显示模块完成」。
 */
export function coveredUnits(moduleId: string, questionIds: string[]): Set<string> {
  const m = MODULES_BY_ID[moduleId]
  const covered = new Set<string>()
  if (!m) return covered
  for (const id of questionIds) {
    const q = QUESTIONS_BY_ID[id]
    const u = q ? primaryUnit(q) : undefined
    if (u && m.units.includes(u)) covered.add(u)
  }
  return covered
}

/** 挑战是否真正完成：所有单元被覆盖 + 队列全部作答 */
export function isChallengeComplete(
  moduleId: string,
  queue: string[],
  results: Record<string, { correct: boolean; at: number }>,
): boolean {
  const m = MODULES_BY_ID[moduleId]
  if (!m || queue.length === 0) return false
  const allAnswered = queue.every((id) => Boolean(results[id]))
  const covered = coveredUnits(moduleId, queue.filter((id) => Boolean(results[id])))
  return allAnswered && covered.size === m.units.length
}
