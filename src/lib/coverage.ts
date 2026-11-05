import type {
  AppState,
  KnowledgeProgress,
  MasteryStatus,
  UnitPractice,
} from '../types'
import type { CurriculumModule } from '../data/curriculum'
import { unitName } from '../data/curriculum'
import { isDue } from './review'
import { daysBetween } from './util'

/**
 * ===== 掌握状态判定规则（统一、可解释，写在这里供 UI 与检查脚本共用）=====
 *
 * none      尚未学习：没有学习记录，也没有任何练习。
 * studied   已学习但未练习：完成课程／知识卡被标记学习，但 attempts = 0。
 * weak      需要加强：满足任一项 —— wrong ≥ 2；正确率 < 60%；
 *                    attempts < 2；练习题型 < 2 种（证据不足）。
 * basic     基本掌握：attempts ≥ 2 且正确率 ≥ 60% 且练过 ≥ 2 种题型，
 *                    且尚未达到熟练条件。
 * mastered  熟练掌握：先满足 basic，再满足任一项 ——
 *                    间隔 ≥ 1 天后再次答对（spacedCorrect ≥ 1）；
 *                    或 attempts ≥ 4 且正确率 ≥ 80%。
 *
 * 关键约束：答对一道题绝不会直接进入「基本掌握」或「熟练掌握」。
 */
export const MASTERY_RULES = {
  minAttemptsForBasic: 2,
  minTypesForBasic: 2,
  minAccuracyForBasic: 0.6,
  wrongForWeak: 2,
  minAttemptsForMasteredByVolume: 4,
  minAccuracyForMasteredByVolume: 0.8,
  spacedGapDays: 1,
} as const

export const STATUS_LABEL: Record<MasteryStatus, string> = {
  none: '尚未学习',
  studied: '已学习未练习',
  weak: '需要加强',
  basic: '基本掌握',
  mastered: '熟练掌握',
}

/** 与 ui.tsx 的 Badge color 取值保持一致，避免运行时传入无效色值 */
export type StatusColor = 'primary' | 'gold' | 'muted' | 'danger' | 'success'

export const STATUS_COLOR: Record<MasteryStatus, StatusColor> = {
  none: 'muted',
  studied: 'gold',
  weak: 'danger',
  basic: 'primary',
  mastered: 'success',
}

export function emptyUnitPractice(now = Date.now()): UnitPractice {
  return {
    attempts: 0,
    correct: 0,
    wrong: 0,
    types: [],
    firstAt: now,
    lastAt: now,
    lastCorrectAt: null,
    spacedCorrect: 0,
  }
}

/** 一次练习后更新单元记录（纯函数） */
export function updateUnitPractice(
  prev: UnitPractice | undefined,
  o: { correct: boolean; practiced?: boolean; type: string; now: number },
): UnitPractice {
  const p = prev ?? emptyUnitPractice(o.now)
  const types = p.types.includes(o.type) ? p.types : [...p.types, o.type]
  let spacedCorrect = p.spacedCorrect
  let lastCorrectAt = p.lastCorrectAt
  if (o.correct) {
    if (p.lastCorrectAt != null && daysBetween(p.lastCorrectAt, o.now) >= MASTERY_RULES.spacedGapDays) {
      spacedCorrect += 1
    }
    lastCorrectAt = o.now
  }
  return {
    ...p,
    attempts: p.attempts + 1,
    correct: p.correct + (o.correct ? 1 : 0),
    // 推理／引导题只记「练习过」，不计对错，避免把开放式练习伪装成答对
    wrong: p.wrong + (!o.correct && !o.practiced ? 1 : 0),
    types,
    lastAt: o.now,
    lastCorrectAt,
    spacedCorrect,
  }
}

export function unitAccuracy(p?: UnitPractice): number {
  if (!p || p.attempts === 0) return 0
  return Math.round((p.correct / p.attempts) * 100)
}

export function unitStatus(
  practice: UnitPractice | undefined,
  knowledge: KnowledgeProgress | undefined,
): MasteryStatus {
  const studied = knowledge?.lastStudied != null
  const attempts = practice?.attempts ?? 0

  if (!studied && attempts === 0) return 'none'
  if (attempts === 0) return 'studied'

  const wrong = practice?.wrong ?? 0
  const accuracy = (practice?.correct ?? 0) / attempts
  const types = practice?.types.length ?? 0
  const spacedCorrect = practice?.spacedCorrect ?? 0

  if (
    wrong >= MASTERY_RULES.wrongForWeak ||
    accuracy < MASTERY_RULES.minAccuracyForBasic ||
    attempts < MASTERY_RULES.minAttemptsForBasic ||
    types < MASTERY_RULES.minTypesForBasic
  ) {
    return 'weak'
  }

  if (
    spacedCorrect >= 1 ||
    (attempts >= MASTERY_RULES.minAttemptsForMasteredByVolume &&
      accuracy >= MASTERY_RULES.minAccuracyForMasteredByVolume)
  ) {
    return 'mastered'
  }

  return 'basic'
}

export interface UnitStat {
  id: string
  name: string
  status: MasteryStatus
  attempts: number
  correct: number
  wrong: number
  accuracy: number
  types: string[]
  due: boolean
  lastAt: number | null
}

export interface ModuleStats {
  moduleId: string
  title: string
  total: number
  learned: number
  practiced: number
  weak: number
  basic: number
  mastered: number
  coveragePct: number
  /** 已到期需复习的单元 */
  needReview: string[]
  /** 完全没有练习过的单元 */
  notPracticed: string[]
  /** 推荐的下一步学习单元（未练优先，其次需要加强） */
  recommended: string[]
  units: UnitStat[]
}

/**
 * 模块统计全部来自真实记录，不使用任何模拟数据。
 * learned  = 有学习记录（课程完成 / 知识卡标记）的单元数
 * practiced= attempts > 0 的单元数
 */
export function moduleStats(m: CurriculumModule, s: AppState): ModuleStats {
  const units: UnitStat[] = m.units.map((id) => {
    const p = s.practiceByUnit?.[id]
    const k = s.knowledge?.[id]
    return {
      id,
      name: unitName(id),
      status: unitStatus(p, k),
      attempts: p?.attempts ?? 0,
      correct: p?.correct ?? 0,
      wrong: p?.wrong ?? 0,
      accuracy: unitAccuracy(p),
      types: p?.types ?? [],
      due: k ? isDue(k) : false,
      lastAt: p?.lastAt ?? null,
    }
  })

  const learned = units.filter((u) => s.knowledge?.[u.id]?.lastStudied != null).length
  const practiced = units.filter((u) => u.attempts > 0).length
  const weak = units.filter((u) => u.status === 'weak').length
  const basic = units.filter((u) => u.status === 'basic').length
  const mastered = units.filter((u) => u.status === 'mastered').length
  const notPracticed = units.filter((u) => u.attempts === 0).map((u) => u.id)
  const needReview = units.filter((u) => u.due || u.status === 'weak').map((u) => u.id)
  const recommended = [
    ...notPracticed,
    ...units.filter((u) => u.status === 'weak' && u.attempts > 0).map((u) => u.id),
    ...units.filter((u) => u.status === 'basic').map((u) => u.id),
  ].filter((id, i, arr) => arr.indexOf(id) === i)

  return {
    moduleId: m.id,
    title: m.title,
    total: units.length,
    learned,
    practiced,
    weak,
    basic,
    mastered,
    coveragePct: units.length === 0 ? 0 : Math.round((practiced / units.length) * 100),
    needReview,
    notPracticed,
    recommended,
    units,
  }
}

/** 全站待复习单元（跨模块，去重） */
export function dueUnits(s: AppState, modules: CurriculumModule[]): string[] {
  const ids = new Set<string>()
  for (const m of modules) {
    for (const u of moduleStats(m, s).units) {
      if (u.due || u.status === 'weak') ids.add(u.id)
    }
  }
  return [...ids]
}
