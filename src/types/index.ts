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

// ===== 教学升级：结构化深度讲解 =====

/** 生活化例子：每个知识点至少两个不同场景 */
export interface TeachingExample {
  scene: string
  text: string
}

/** 相似概念对比：必须解释「区别」，而不是并列关键词 */
export interface TeachingContrast {
  withId: string
  point: string
}

/** 常见误区：误解是什么、从哪来、如何纠正 */
export interface TeachingMisconception {
  text: string
  origin: string
  fix: string
}

/** 组合应用：在完整星盘中分步推理 */
export interface TeachingApplication {
  title: string
  steps: string[]
  conclusion: string
}

/** 总结与记忆技巧 */
export interface TeachingRecap {
  keywords: string[]
  oneLiner: string
  memoryTip: string
  links: string[]
}

export interface TeachingContent {
  /** ① 核心概念：一句简单准确的话 */
  core: string
  /** ② 深入解释：多段、多层次，禁止重复同一句定义 */
  deep: string[]
  /** ② 为什么具有这种象征意义 */
  why: string
  /** ② 与类似概念的区别 */
  distinction: string
  /** ② 初学者最容易误解的地方 */
  beginnerTrap: string
  /** ③ 生活化例子：≥2 个不同场景 */
  examples: TeachingExample[]
  /** ④ 相似概念对比 */
  contrasts: TeachingContrast[]
  /** ⑤ 组合应用：分步推理 */
  application: TeachingApplication
  /** ⑥ 常见误区：≥2 条 */
  misconceptions: TeachingMisconception[]
  /** ⑦ 总结与记忆技巧 */
  recap: TeachingRecap
  /** 传统占星与现代占星解释差异（如有） */
  traditionalNote?: string
  /** 分层讲解：默认只显示 simple */
  layers: { simple: string; advanced: string; practice: string }
}

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
  /** 深度教学（旧知识卡字段保留，作为百科简版） */
  teaching?: TeachingContent
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
  /** 逐知识单元课程的主知识点 id；普通课程为 undefined */
  unitId?: string
  /** 讲解过程中插入的随堂小题（学完一个点立即练） */
  microExerciseIds?: string[]
}

// ===== 测验题目 =====

export type QuestionType = 'single' | 'truefalse' | 'match' | 'reasoning' | 'guided'

/**
 * 练习方向（用于覆盖检查）：
 * forward 宫位→含义 / reverse 含义→宫位 / scenario 情境→应用
 * definition 定义 / geometry 几何关系 / contrast 对比辨析 / application 综合运用
 */
export type QuestionDirection =
  | 'forward'
  | 'reverse'
  | 'scenario'
  | 'definition'
  | 'geometry'
  | 'contrast'
  | 'application'

/** 深度解析：答对答错都要讲清「为什么」 */
export interface QuestionAnalysis {
  /** 正确答案为什么成立 + 推理过程 */
  whyCorrect: string
  /** 每个干扰项为什么不合适（key = 选项 id，判断题用 true/false） */
  optionNotes?: Record<string, string>
  /** 引导式推理链，逐步展示 */
  reasoningChain?: string[]
  /** 应复习的知识点 id */
  reviewIds: string[]
  /** 答对时的进阶补充 */
  extra?: string
  /** 明确「不应推断的内容」，避免把占星当因果规律 */
  notToInfer?: string
}

export interface QuestionBase {
  id: string
  type: QuestionType
  topic: string
  category: KnowledgeCategory
  relatedIds: string[]
  explanation?: string
  commonError?: string
  /** 本题主要训练的知识单元（覆盖追踪以此为准） */
  unitId?: string
  /** 本题的考察方向 */
  direction?: QuestionDirection
  /** 深度解析；旧题没有时由 explanation 兜底渲染 */
  analysis?: QuestionAnalysis
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

/** 引导式推理题：先逐步思考，再展示完整推理过程与示范解读 */
export interface GuidedStep {
  prompt: string
  hint: string
  answer: string
}

export interface GuidedQuestion extends QuestionBase {
  type: 'guided'
  prompt: string
  steps: GuidedStep[]
  /** 明确不应从该组合推断的内容 */
  notToInfer: string
}

export type Question =
  | SingleQuestion
  | TrueFalseQuestion
  | MatchQuestion
  | ReasoningQuestion
  | GuidedQuestion

// ===== 学习状态 =====

export type MasteryLevel = 0 | 1 | 2 | 3 | 4 | 5

/** 5 态知识掌握状态（规则见 lib/coverage.ts 的 MASTERY_RULES） */
export type MasteryStatus = 'none' | 'studied' | 'weak' | 'basic' | 'mastered'

/** 每个知识单元的练习记录（覆盖追踪的真实数据来源） */
export interface UnitPractice {
  attempts: number
  correct: number
  wrong: number
  /** 练习过的题型，去重 */
  types: string[]
  firstAt: number
  lastAt: number
  lastCorrectAt: number | null
  /** 间隔 ≥1 天后再次答对的次数（用于「熟练掌握」判定） */
  spacedCorrect: number
}

/** 完整掌握挑战的可恢复进度 */
export interface ChallengeState {
  moduleId: string
  /** 已排定的题目 id 顺序 */
  queue: string[]
  /** 当前做到第几题 */
  index: number
  results: Record<string, { correct: boolean; at: number }>
  completed: boolean
  startedAt: number
  updatedAt: number
}

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
  /** v2：按知识单元的练习覆盖记录 */
  practiceByUnit: Record<string, UnitPractice>
  /** v2：各模块完整掌握挑战的可恢复进度 */
  challenge: Record<string, ChallengeState>
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
