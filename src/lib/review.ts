import type { KnowledgeProgress, MasteryLevel } from '../types'
import { addDays, startOfToday } from './util'

export type ReviewRating = 'none' | 'vague' | 'ok' | 'familiar'

const INTERVALS: Record<ReviewRating, number> = {
  none: 0, // 完全不会 → 今天就要复习
  vague: 1, // 有点模糊 → 明天
  ok: 3, // 基本记住 → 3 天后
  familiar: 7, // 非常熟悉 → 7 天后
}

const MASTERY_DELTA: Record<ReviewRating, number> = {
  none: -1,
  vague: 0,
  ok: 1,
  familiar: 1,
}

export function emptyProgress(id: string): KnowledgeProgress {
  return {
    id,
    lastStudied: null,
    correct: 0,
    wrong: 0,
    mastery: 0,
    nextReview: null,
  }
}

export function clampMastery(v: number): MasteryLevel {
  return Math.max(0, Math.min(5, v)) as MasteryLevel
}

/** 用户主动点击复习评级 */
export function applyReview(
  p: KnowledgeProgress,
  rating: ReviewRating,
  now = Date.now(),
): KnowledgeProgress {
  return {
    ...p,
    lastStudied: now,
    mastery: clampMastery(p.mastery + MASTERY_DELTA[rating]),
    nextReview: addDays(now, INTERVALS[rating]),
  }
}

/** 答题后更新掌握情况 */
export function recordAnswer(
  p: KnowledgeProgress,
  correct: boolean,
  now = Date.now(),
): KnowledgeProgress {
  if (correct) {
    return {
      ...p,
      lastStudied: now,
      correct: p.correct + 1,
      mastery: clampMastery(p.mastery + 1),
      // 答对 → 3 天后再巩固
      nextReview: addDays(now, 3),
    }
  }
  return {
    ...p,
    lastStudied: now,
    wrong: p.wrong + 1,
    mastery: clampMastery(p.mastery - 1),
    // 答错 → 今天就要复习
    nextReview: startOfToday(),
  }
}

/** 完成课程时标记已学习（安排到明天复习） */
export function markStudied(p: KnowledgeProgress, now = Date.now()): KnowledgeProgress {
  const fresh = p.lastStudied == null
  return {
    ...p,
    lastStudied: now,
    mastery: fresh ? clampMastery(Math.max(1, p.mastery)) : p.mastery,
    nextReview: addDays(now, 1),
  }
}

/** 是否今天到期需要复习 */
export function isDue(p: KnowledgeProgress): boolean {
  if (p.nextReview == null) return false
  return p.nextReview <= startOfToday()
}
