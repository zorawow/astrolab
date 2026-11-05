import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AppState, KnowledgeProgress, MasteryLevel, NoteItem, QuizRecord } from '../types'
import { idbGet, idbSet, idbDel } from './db'
import { emptyProgress, applyReview, recordAnswer, markStudied, type ReviewRating } from './review'
import { dayKey, uid } from './util'

// ---- idb 适配 zustand persist ----
const idbStorage = {
  getItem: async (name: string) => idbGet(name),
  setItem: async (name: string, value: string) => idbSet(name, value),
  removeItem: async (name: string) => idbDel(name),
}

export const BACKUP_VERSION = 1

function initialData(): AppState {
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
  }
}

interface Actions {
  completeCourse: (courseId: string, relatedIds: string[]) => void
  setCourseProgress: (courseId: string, ratio: number) => void
  recordQuiz: (
    questionId: string,
    type: QuizRecord['type'],
    correct: boolean,
    practiced: boolean,
    relatedIds: string[],
  ) => void
  reviewKnowledge: (id: string, rating: ReviewRating) => void
  toggleFavorite: (id: string) => void
  addNote: (knowledgeId: string, text: string) => void
  deleteNote: (id: string) => void
  setSunSign: (id: string) => void
  setTheme: (theme: 'dark' | 'light') => void
  exportData: () => string
  importData: (json: string) => { ok: boolean; error?: string }
  clearAll: () => void
  _setHydrated: () => void
}

export type Store = AppState & Actions & { hydrated: boolean }

function touchStreak(state: AppState, now: number): Pick<AppState, 'streak' | 'studyDates'> {
  const today = dayKey(now)
  const last = state.streak.lastDate
  let count = state.streak.count
  if (last === today) {
    // 不变
  } else if (last === dayKey(new Date(now - 86400000))) {
    count = state.streak.count + 1
  } else {
    count = 1
  }
  const studyDates = state.studyDates.includes(today)
    ? state.studyDates
    : [...state.studyDates, today]
  return { streak: { count, lastDate: today }, studyDates }
}

function bumpKnowledge(
  knowledge: Record<string, KnowledgeProgress>,
  id: string,
  fn: (p: KnowledgeProgress) => KnowledgeProgress,
): Record<string, KnowledgeProgress> {
  const prev = knowledge[id] ?? emptyProgress(id)
  return { ...knowledge, [id]: fn(prev) }
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialData(),
      hydrated: false,

      _setHydrated: () => set({ hydrated: true }),

      completeCourse: (courseId, relatedIds) =>
        set((s) => {
          const now = Date.now()
          const completed = s.completedCourses.includes(courseId)
            ? s.completedCourses
            : [...s.completedCourses, courseId]
          let knowledge = { ...s.knowledge }
          for (const id of relatedIds) {
            knowledge = bumpKnowledge(knowledge, id, (p) => markStudied(p, now))
          }
          const streak = touchStreak(s, now)
          return {
            completedCourses: completed,
            courseProgress: { ...s.courseProgress, [courseId]: 1 },
            knowledge,
            ...streak,
          }
        }),

      setCourseProgress: (courseId, ratio) =>
        set((s) => ({
          courseProgress: { ...s.courseProgress, [courseId]: Math.max(0, Math.min(1, ratio)) },
        })),

      recordQuiz: (questionId, type, correct, practiced, relatedIds) =>
        set((s) => {
          const now = Date.now()
          let knowledge = { ...s.knowledge }
          for (const id of relatedIds) {
            knowledge = bumpKnowledge(knowledge, id, (p) =>
              recordAnswer(p, correct || practiced, now),
            )
          }
          const wrongQuestions = { ...s.wrongQuestions }
          if (correct) {
            delete wrongQuestions[questionId]
          } else {
            wrongQuestions[questionId] = now
          }
          const record: QuizRecord = { questionId, type, correct, practiced, at: now }
          const quizHistory = [record, ...s.quizHistory].slice(0, 300)
          const streak = touchStreak(s, now)
          return { knowledge, wrongQuestions, quizHistory, ...streak }
        }),

      reviewKnowledge: (id, rating) =>
        set((s) => {
          const now = Date.now()
          const knowledge = bumpKnowledge(s.knowledge, id, (p) => applyReview(p, rating, now))
          const streak = touchStreak(s, now)
          return { knowledge, ...streak }
        }),

      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        })),

      addNote: (knowledgeId, text) =>
        set((s) => {
          const note: NoteItem = { id: uid('note'), knowledgeId, text, at: Date.now() }
          return { notes: [note, ...s.notes] }
        }),

      deleteNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      setSunSign: (id) => set({ sunSign: id }),

      setTheme: (theme) => set({ theme }),

      exportData: () => {
        const s = get()
        const payload = {
          app: 'AstroLab',
          backupVersion: BACKUP_VERSION,
          exportedAt: new Date().toISOString(),
          data: {
            version: s.version,
            createdAt: s.createdAt,
            completedCourses: s.completedCourses,
            courseProgress: s.courseProgress,
            knowledge: s.knowledge,
            favorites: s.favorites,
            wrongQuestions: s.wrongQuestions,
            quizHistory: s.quizHistory,
            notes: s.notes,
            streak: s.streak,
            studyDates: s.studyDates,
            sunSign: s.sunSign,
            theme: s.theme,
          },
        }
        return JSON.stringify(payload, null, 2)
      },

      importData: (json) => {
        try {
          const parsed = JSON.parse(json)
          const data = parsed?.data ?? parsed
          if (!data || typeof data !== 'object') {
            return { ok: false, error: '文件格式不正确' }
          }
          const base = initialData()
          const merged: AppState = {
            version: data.version ?? base.version,
            createdAt: data.createdAt ?? base.createdAt,
            completedCourses: data.completedCourses ?? [],
            courseProgress: data.courseProgress ?? {},
            knowledge: data.knowledge ?? {},
            favorites: data.favorites ?? [],
            wrongQuestions: data.wrongQuestions ?? {},
            quizHistory: data.quizHistory ?? [],
            notes: data.notes ?? [],
            streak: data.streak ?? base.streak,
            studyDates: data.studyDates ?? [],
            sunSign: data.sunSign ?? base.sunSign,
            theme: data.theme ?? base.theme,
          }
          set({ ...merged })
          return { ok: true }
        } catch (e) {
          return { ok: false, error: '解析失败：' + (e as Error).message }
        }
      },

      clearAll: () => set({ ...initialData(), hydrated: true }),
    }),
    {
      name: 'astrolab-state',
      version: BACKUP_VERSION,
      storage: createJSONStorage(() => idbStorage),
      partialize: (s) => ({
        version: s.version,
        createdAt: s.createdAt,
        completedCourses: s.completedCourses,
        courseProgress: s.courseProgress,
        knowledge: s.knowledge,
        favorites: s.favorites,
        wrongQuestions: s.wrongQuestions,
        quizHistory: s.quizHistory,
        notes: s.notes,
        streak: s.streak,
        studyDates: s.studyDates,
        sunSign: s.sunSign,
        theme: s.theme,
      }),
      // 外层在 hydrate 开始时同步执行，先捕获 _setHydrated 的引用。
      // 内层无论「成功 / 失败 / 无历史数据」都会被调用；失败时 zustand 传入 undefined，
      // 若依赖内层 state 就会跳过置位，导致 App 永久停在「正在唤醒星图…」。
      onRehydrateStorage: (state) => {
        const markHydrated = state?._setHydrated
        return () => {
          markHydrated?.()
        }
      },
    },
  ),
)

// ---- 派生计算 ----
export function dueReviewCount(s: Store): number {
  return Object.values(s.knowledge).filter((k) => {
    if (k.nextReview == null) return false
    // 复用 review.isDue 的逻辑
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    return k.nextReview <= start.getTime()
  }).length
}

export function totalProgress(s: Store, totalCourses: number): number {
  if (totalCourses === 0) return 0
  return Math.round((s.completedCourses.length / totalCourses) * 100)
}

export function masteryLabel(m: MasteryLevel): string {
  return ['未学', '初识', '了解', '熟悉', '掌握', '精通'][m] ?? '未学'
}
