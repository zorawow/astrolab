// ===== 基础类型 =====

export type Element = 'fire' | 'earth' | 'air' | 'water'
export type Modality = 'cardinal' | 'fixed' | 'mutable'

export type KnowledgeCategory =
  | 'zodiac'
  | 'planet'
  | 'house'
  | 'aspect'
  | 'element'
  | 'modality'
  | 'term'

export const ELEMENT_LABEL: Record<Element, string> = {
  fire: '火',
  earth: '土',
  air: '风',
  water: '水',
}

export const MODALITY_LABEL: Record<Modality, string> = {
  cardinal: '基本',
  fixed: '固定',
  mutable: '变动',
}

// ===== 知识卡片（百科）=====

export interface KnowledgeBase {
  id: string
  category: KnowledgeCategory
  name: string
  nameEn: string
  symbol: string
  keywords: string[]
  summary: string
  detail: string
  examples: string[]
  misconceptions: string[]
  relatedIds: string[]
}

export interface ZodiacItem extends KnowledgeBase {
  category: 'zodiac'
  element: Element
  modality: Modality
  ruler: string
  dates: string
  glyph: string
}

export interface PlanetItem extends KnowledgeBase {
  category: 'planet'
  astronomical: string
  symbol: string
  themes: string[]
}

export interface HouseItem extends KnowledgeBase {
  category: 'house'
  index: number
  lifeArea: string
}

export interface AspectItem extends KnowledgeBase {
  category: 'aspect'
  angle: number
  nature: 'harmonious' | 'tense' | 'neutral'
}

export interface SimpleItem extends KnowledgeBase {
  category: 'element' | 'modality' | 'term'
}

export type KnowledgeItem =
  | ZodiacItem
  | PlanetItem
  | HouseItem
  | AspectItem
  | SimpleItem

// ===== 课程 =====

export interface CourseSection {
  heading: string
  body: string
  /** 之前的联系 */
  connection?: string
  /** 常见误区 */
  misconception?: string
}

export interface Course {
  id: string
  stage: number
  order: number
  title: string
  estMinutes: number
  objectives: string[]
  hook: string
  sections: CourseSection[]
  summary: string
  /** 本课互动练习的题目 id */
  exerciseIds: string[]
  /** 关联知识点 id（完成课程后标记复习） */
  relatedKnowledgeIds: string[]
}

// ===== 测验题目 =====

export type QuestionType = 'single' | 'truefalse' | 'match' | 'reasoning'

export interface QuestionBase {
  id: string
  type: QuestionType
  topic: string
  category: KnowledgeCategory
  relatedIds: string[]
  explanation?: string
  commonError?: string
}

export interface SingleQuestion extends QuestionBase {
  type: 'single'
  prompt: string
  options: { id: string; text: string }[]
  answer: string
}

export interface TrueFalseQuestion extends QuestionBase {
  type: 'truefalse'
  prompt: string
  answer: boolean
}

export interface MatchQuestion extends QuestionBase {
  type: 'match'
  prompt: string
  instruction: string
  lefts: string[]
  rights: string[]
  /** correct[i] = rights 中对应 lefts[i] 的正确下标 */
  correct: number[]
}

export interface ReasoningQuestion extends QuestionBase {
  type: 'reasoning'
  prompt: string
  hint: string
  sampleAnswer: string
}

export type Question =
  | SingleQuestion
  | TrueFalseQuestion
  | MatchQuestion
  | ReasoningQuestion

// ===== 学习状态 =====

export type MasteryLevel = 0 | 1 | 2 | 3 | 4 | 5

export interface KnowledgeProgress {
  id: string
  lastStudied: number | null
  correct: number
  wrong: number
  mastery: MasteryLevel
  nextReview: number | null
}

export interface QuizRecord {
  questionId: string
  type: QuestionType
  correct: boolean
  /** reasoning 题记为已练习 */
  practiced: boolean
  at: number
}

export interface NoteItem {
  id: string
  knowledgeId: string
  text: string
  at: number
}

export interface AppState {
  version: number
  createdAt: number
  /** 已完成课程 id */
  completedCourses: string[]
  /** 课程学习进度（用于继续学习） */
  courseProgress: Record<string, number>
  /** 知识点掌握情况 */
  knowledge: Record<string, KnowledgeProgress>
  /** 收藏的知识点 id */
  favorites: string[]
  /** 错题（questionId -> 最近一次错误时间） */
  wrongQuestions: Record<string, number>
  /** 测验历史 */
  quizHistory: QuizRecord[]
  /** 学习笔记 */
  notes: NoteItem[]
  /** 连续学习天数相关 */
  streak: { count: number; lastDate: string | null }
  /** 累计学习天数（去重日期） */
  studyDates: string[]
  /** 每日占星所选太阳星座 */
  sunSign: string
  /** 主题 */
  theme: 'dark' | 'light'
}

// ===== 每日占星内容 =====

export interface DailyContent {
  sign: string
  signEn: string
  symbol: string
  theme: string
  relationship: string
  work: string
  reflection: string
  disclaimer: string
}
