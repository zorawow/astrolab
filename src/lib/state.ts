import type { AppState, ChallengeState, UnitPractice } from '../types'

/** 备份格式版本：v2 新增 practiceByUnit / challenge，v1 旧备份可无损升级 */
export const BACKUP_VERSION = 2

export function initialData(): AppState {
  return {
    version: BACKUP_VERSION,
    createdAt: Date.now(),
    completedCourses: [],
    courseProgress: {},
    knowledge: {},
    favorites: [],
    wrongQuestions: {},
    quizHistory: [],
    notes: [],
    streak: { count: 0, lastDate: null },
    studyDates: [],
    sunSign: 'z-aries',
    theme: 'dark',
    practiceByUnit: {},
    challenge: {},
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v)
}

function arr<T>(v: unknown, fallback: T[]): T[] {
  return Array.isArray(v) ? (v as T[]) : fallback
}

function rec<T>(v: unknown): Record<string, T> {
  return isRecord(v) ? (v as Record<string, T>) : {}
}

/**
 * 把任意来源的数据（v1 旧备份、导入 JSON、水合结果）补齐为完整 AppState。
 * 原则：旧字段原样保留；缺失的新字段补空对象；不做任何删除或重置。
 * 纯函数，可在 Node 环境用于自动检查。
 */
export function normalizeState(data: unknown): AppState {
  const base = initialData()
  if (!isRecord(data)) return base
  const d = data

  const theme = d.theme === 'light' ? 'light' : d.theme === 'dark' ? 'dark' : base.theme
  const streak = isRecord(d.streak)
    ? {
        count: typeof d.streak.count === 'number' ? d.streak.count : 0,
        lastDate: typeof d.streak.lastDate === 'string' ? d.streak.lastDate : null,
      }
    : base.streak

  return {
    version: typeof d.version === 'number' ? d.version : BACKUP_VERSION,
    createdAt: typeof d.createdAt === 'number' ? d.createdAt : base.createdAt,
    completedCourses: arr<string>(d.completedCourses, []),
    courseProgress: rec<number>(d.courseProgress),
    knowledge: rec<AppState['knowledge'][string]>(d.knowledge),
    favorites: arr<string>(d.favorites, []),
    wrongQuestions: rec<number>(d.wrongQuestions),
    quizHistory: arr<AppState['quizHistory'][number]>(d.quizHistory, []),
    notes: arr<AppState['notes'][number]>(d.notes, []),
    streak,
    studyDates: arr<string>(d.studyDates, []),
    sunSign: typeof d.sunSign === 'string' ? d.sunSign : base.sunSign,
    theme,
    // v1 备份没有这两个字段 —— 补空对象，历史学习记录一条不丢
    practiceByUnit: rec<UnitPractice>(d.practiceByUnit),
    challenge: rec<ChallengeState>(d.challenge),
  }
}
