import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AppState, ChallengeState, KnowledgeProgress, MasteryLevel, NoteItem, QuizRecord, UnitPractice } from '../types'
import { idbGet, idbSet, idbDel } from './db'
import { emptyProgress, applyReview, recordAnswer, markStudied, type ReviewRating } from './review'
import { updateUnitPractice } from './coverage'
import { buildChallengeQueue, isChallengeComplete, coveredUnits, questionsForUnit, MODULES_BY_ID } from '../data/curriculum'
import { QUESTIONS_BY_ID } from '../data/questions'
import { KNOWLEDGE_BY_ID } from '../data'
import { dayKey, uid } from './util'
import { initialData, normalizeState, BACKUP_VERSION } from './state'

export { BACKUP_VERSION }

// ---- idb 适配 zustand persist ----
const idbStorage = {
  getItem: async (name: string) => idbGet(name),
  setItem: async (name: string, value: string) => idbSet(name, value),
  removeItem: async (name: string) => idbDel(name),
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
  /** 完整掌握挑战：创建/恢复、记录、重置 */
  startChallenge: (moduleId: string) => ChallengeState | null
  recordChallengeAnswer: (moduleId: string, questionId: string, correct: boolean) => void
  resetChallenge: (moduleId: string) => void
  /** 挑战中实时的知识单元覆盖数 */
  challengeCovered: (moduleId: string) => number
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

/** 题目的主知识单元：优先显式 unitId，旧题回退到第一个合法知识点 id */
function unitOfQuestion(questionId: string, relatedIds: string[]): string | undefined {
  const q = QUESTIONS_BY_ID[questionId]
  if (q?.unitId && KNOWLEDGE_BY_ID[q.unitId]) return q.unitId
  const ids = q?.relatedIds ?? relatedIds
  return ids.find((id) => Boolean(KNOWLEDGE_BY_ID[id]))
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
            if (!KNOWLEDGE_BY_ID[id]) continue
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
            if (!KNOWLEDGE_BY_ID[id]) continue
            knowledge = bumpKnowledge(knowledge, id, (p) =>
              recordAnswer(p, correct || practiced, now),
            )
          }

          // v2：按知识单元记录真实练习覆盖、题型与正确率
          const unitId = unitOfQuestion(questionId, relatedIds)
          const practiceByUnit: Record<string, UnitPractice> = { ...(s.practiceByUnit ?? {}) }
          if (unitId) {
            practiceByUnit[unitId] = updateUnitPractice(practiceByUnit[unitId], {
              correct,
              practiced,
              type,
              now,
            })
          }

          const wrongQuestions = { ...s.wrongQuestions }
          if (correct || practiced) {
            // 推理/引导题只记录练习，不进错题本
            delete wrongQuestions[questionId]
          } else {
            wrongQuestions[questionId] = now
          }
          const record: QuizRecord = { questionId, type, correct, practiced, at: now }
          const quizHistory = [record, ...s.quizHistory].slice(0, 500)
          const streak = touchStreak(s, now)
          return { knowledge, practiceByUnit, wrongQuestions, quizHistory, ...streak }
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

      // ===== 完整掌握挑战 =====
      startChallenge: (moduleId) => {
        const s = get()
        const existing = s.challenge?.[moduleId]
        if (existing && !existing.completed && existing.queue.length > 0) return existing

        const answeredIds = s.quizHistory.map((r) => r.questionId)
        const queue = buildChallengeQueue(moduleId, s.practiceByUnit ?? {}, answeredIds)
        if (queue.length === 0) return null
        const now = Date.now()
        const next: ChallengeState = {
          moduleId,
          queue,
          index: 0,
          results: {},
          completed: false,
          startedAt: now,
          updatedAt: now,
        }
        set({ challenge: { ...(s.challenge ?? {}), [moduleId]: next } })
        return next
      },

      recordChallengeAnswer: (moduleId, questionId, correct) =>
        set((s) => {
          const cur = s.challenge?.[moduleId]
          if (!cur) return {}
          const results = {
            ...cur.results,
            [questionId]: { correct, at: Date.now() },
          }
          // 队列做完后若仍有知识点没被覆盖，自动追加该单元的客观题，
          // 保证「完整挑战」不会在只考了部分知识点时被判定完成。
          let queue = [...cur.queue]
          const m = MODULES_BY_ID[moduleId]
          const covered = coveredUnits(
            moduleId,
            queue.filter((id) => Boolean(results[id])),
          )
          if (m && cur.index + 1 >= queue.length && m.units.some((u) => !covered.has(u))) {
            for (const u of m.units) {
              if (covered.has(u)) continue
              const extra = questionsForUnit(u).find(
                (x) =>
                  x.type !== 'guided' && x.type !== 'reasoning' && !queue.includes(x.id),
              )
              if (extra) queue.push(extra.id)
            }
          }
          const idx = Math.min(cur.index + 1, queue.length)
          const completed = isChallengeComplete(moduleId, queue, results)
          const next: ChallengeState = {
            ...cur,
            queue,
            index: idx,
            results,
            completed,
            updatedAt: Date.now(),
          }
          return { challenge: { ...(s.challenge ?? {}), [moduleId]: next } }
        }),

      resetChallenge: (moduleId) =>
        set((s) => {
          const challenge = { ...(s.challenge ?? {}) }
          delete challenge[moduleId]
          return { challenge }
        }),

      challengeCovered: (moduleId) => {
        const cur = get().challenge?.[moduleId]
        if (!cur) return 0
        return coveredUnits(
          moduleId,
          cur.queue.filter((id) => Boolean(cur.results[id])),
        ).size
      },

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
            practiceByUnit: s.practiceByUnit,
            challenge: s.challenge,
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
          const d = data as Record<string, unknown>
          if (!('completedCourses' in d || 'knowledge' in d || 'quizHistory' in d || 'challenge' in d)) {
            return { ok: false, error: '这不是 AstroLab 学习数据备份' }
          }
          // v1 备份自动补齐 v2 字段（practiceByUnit / challenge），旧记录原样保留
          const merged: AppState = normalizeState(data)
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
      version: 1, // persist 版本保持 1，通过 merge 平滑补字段，避免触发破坏性迁移
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
        practiceByUnit: s.practiceByUnit,
        challenge: s.challenge,
      }),
      // 旧版存储（v1 备份 / 已上线用户）没有 practiceByUnit 与 challenge，
      // 在这里补齐默认值；其余字段原样保留，学习记录不会丢失。
      merge: (persisted, current) => ({
        ...current,
        ...normalizeState(persisted),
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
