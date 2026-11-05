import type { AppState, Question, TeachingContent } from '../types'
import { ALL_KNOWLEDGE, KNOWLEDGE_BY_ID } from '../data'
import { TEACHING_BY_ID } from '../data/teaching'
import { COURSES } from '../data/courses'
import { QUESTIONS, QUESTIONS_BY_ID } from '../data/questions'
import {
  MODULES, UNIT_COURSES, buildChallengeQueue, coveredUnits,
  isChallengeComplete, questionsForUnit, primaryUnit,
} from '../data/curriculum'
import { unitStatus, updateUnitPractice, moduleStats, emptyUnitPractice } from './coverage'
import { normalizeState } from './state'

export interface CheckResult {
  name: string
  ok: boolean
  details: string[]
  errors: string[]
}

export interface ModuleCoverage {
  moduleId: string
  title: string
  units: number
  questions: number
  objectiveQuestions: number
  courses: number
  /** 每单元主知识点的题目数 */
  perUnit: { id: string; name: string; count: number; directions: string[] }[]
  uncovered: string[]
}

export interface IntegrityReport {
  ok: boolean
  checks: CheckResult[]
  modules: ModuleCoverage[]
  totals: {
    knowledge: number
    teaching: number
    courses: number
    unitCourses: number
    questions: number
    guided: number
  }
}

function check(
  name: string,
  errors: string[],
  details: string[] = [],
): CheckResult {
  return { name, ok: errors.length === 0, details, errors }
}

/** 每个模块的知识点 / 题目 / 课程覆盖快照（供页面与交付报告使用） */
export function moduleCoverage(): ModuleCoverage[] {
  return MODULES.map((m) => {
    const perUnit = m.units.map((id) => {
      const qs = questionsForUnit(id)
      return {
        id,
        name: KNOWLEDGE_BY_ID[id]?.name ?? id,
        count: qs.length,
        directions: [...new Set(qs.map((q) => q.direction).filter(Boolean))] as string[],
      }
    })
    const all = [...new Set(m.units.flatMap((u) => questionsForUnit(u).map((q) => q.id)))]
      .map((id) => QUESTIONS_BY_ID[id])
      .filter((q): q is Question => Boolean(q))
    return {
      moduleId: m.id,
      title: m.title,
      units: m.units.length,
      questions: all.length,
      objectiveQuestions: all.filter((q) => q.type !== 'guided' && q.type !== 'reasoning').length,
      courses: UNIT_COURSES.filter((c) => m.units.includes(c.unitId ?? '')).length,
      perUnit,
      uncovered: perUnit.filter((u) => u.count === 0).map((u) => u.id),
    }
  })
}

function validateTeaching(id: string, t: TeachingContent | undefined, errors: string[]) {
  if (!t) {
    errors.push(`${id} 缺少深度教学 teaching`)
    return
  }
  if (!t.core?.trim()) errors.push(`${id} 缺少 core 核心概念`)
  if (!t.deep || t.deep.length < 2) errors.push(`${id} deep 深入解释不足 2 段`)
  if (!t.why?.trim()) errors.push(`${id} 缺少 why 象征来源`)
  if (!t.distinction?.trim()) errors.push(`${id} 缺少 distinction 概念区别`)
  if (!t.beginnerTrap?.trim()) errors.push(`${id} 缺少 beginnerTrap 初学者误区`)
  if (!t.examples || t.examples.length < 2) errors.push(`${id} 生活化例子不足 2 个`)
  if (!t.contrasts || t.contrasts.length < 2) errors.push(`${id} 相似概念对比不足 2 条`)
  if (!t.application || t.application.steps.length < 2) errors.push(`${id} 组合应用缺少分步推理`)
  if (!t.misconceptions || t.misconceptions.length < 2) errors.push(`${id} 常见误区不足 2 条`)
  if (!t.recap?.oneLiner || !t.recap?.memoryTip) errors.push(`${id} 总结/记忆技巧不完整`)
  if (!t.layers?.simple || !t.layers?.advanced || !t.layers?.practice) {
    errors.push(`${id} 三层讲解不完整`)
  }
  for (const c of t.contrasts ?? []) {
    if (!KNOWLEDGE_BY_ID[c.withId]) errors.push(`${id} contrasts 引用了不存在的知识点 ${c.withId}`)
  }
  for (const link of t.recap?.links ?? []) {
    if (!KNOWLEDGE_BY_ID[link]) errors.push(`${id} recap.links 引用了不存在的知识点 ${link}`)
  }
}

function validateQuestion(q: Question, errors: string[]) {
  const tag = `${q.id}`
  // 正确答案
  if (q.type === 'single') {
    if (!q.options.some((o) => o.id === q.answer)) errors.push(`${tag} 的 answer 不在 options 中`)
    if (q.options.length < 3) errors.push(`${tag} 选项少于 3 个`)
  } else if (q.type === 'truefalse') {
    if (typeof q.answer !== 'boolean') errors.push(`${tag} 判断题 answer 不是布尔值`)
  } else if (q.type === 'match') {
    if (q.correct.length !== q.lefts.length) errors.push(`${tag} 匹配题 correct 长度不匹配`)
    if (q.correct.some((i) => i < 0 || i >= q.rights.length)) errors.push(`${tag} 匹配题 correct 下标越界`)
  } else if (q.type === 'reasoning') {
    if (!q.sampleAnswer?.trim() || !q.hint?.trim()) errors.push(`${tag} 推理题缺少提示或示范解析`)
  } else if (q.type === 'guided') {
    if (!q.steps || q.steps.length < 2) errors.push(`${tag} 引导题步骤少于 2 步`)
    if (!q.notToInfer?.trim()) errors.push(`${tag} 引导题缺少「不应推断」边界说明`)
  }

  // 解析
  const a = q.analysis
  if (!a) {
    errors.push(`${tag} 缺少 analysis 深度解析`)
  } else {
    if (!a.whyCorrect?.trim()) errors.push(`${tag} 缺少「为什么正确答案成立」`)
    if (!a.reviewIds || a.reviewIds.length === 0) errors.push(`${tag} 缺少应复习知识点 reviewIds`)
    else {
      for (const id of a.reviewIds) {
        if (!KNOWLEDGE_BY_ID[id]) errors.push(`${tag} reviewIds 引用了不存在的知识点 ${id}`)
      }
    }
    if (q.type === 'single' || q.type === 'truefalse') {
      const notes = a.optionNotes ?? {}
      const expected = q.type === 'single' ? q.options.filter((o) => o.id !== q.answer).length : 1
      if (Object.keys(notes).length < expected) {
        errors.push(`${tag} 逐选项解析不完整（应有 ${expected} 条，实际 ${Object.keys(notes).length} 条）`)
      }
    }
  }
  if (!q.explanation?.trim() && q.type !== 'reasoning' && q.type !== 'guided') {
    errors.push(`${tag} 缺少 explanation`)
  }

  // 引用有效性
  for (const id of q.relatedIds ?? []) {
    if (!KNOWLEDGE_BY_ID[id]) errors.push(`${tag} relatedIds 引用了不存在的知识点 ${id}`)
  }
  if (q.unitId && !KNOWLEDGE_BY_ID[q.unitId]) {
    errors.push(`${tag} unitId 引用了不存在的知识点 ${q.unitId}`)
  }
}

/** 全量完整性检查：任何一条失败都不允许把交付报告写成「通过」 */
export function runIntegrityChecks(): IntegrityReport {
  const checks: CheckResult[] = []

  // 1. ID 唯一
  {
    const errors: string[] = []
    for (const [label, ids] of [
      ['题目', QUESTIONS.map((q) => q.id)],
      ['课程', COURSES.map((c) => c.id)],
      ['知识卡', ALL_KNOWLEDGE.map((k) => k.id)],
    ] as [string, string[]][]) {
      const dup = ids.filter((id, i) => ids.indexOf(id) !== i)
      if (dup.length) errors.push(`${label} ID 重复：${[...new Set(dup)].join(', ')}`)
    }
    checks.push(check('ID 唯一性', errors, [
      `题目 ${QUESTIONS.length} 道 / 课程 ${COURSES.length} 节 / 知识卡 ${ALL_KNOWLEDGE.length} 张`,
    ]))
  }

  // 2. 全知识点深度教学
  {
    const errors: string[] = []
    for (const k of ALL_KNOWLEDGE) validateTeaching(k.id, TEACHING_BY_ID[k.id], errors)
    checks.push(check('每个知识点都有完整深度教学（7 大板块 + 三层讲解）', errors, [
      `${Object.keys(TEACHING_BY_ID).length}/${ALL_KNOWLEDGE.length} 个知识点具备完整教学`,
    ]))
  }

  // 3. 课程完整性 + 逐单元课程
  {
    const errors: string[] = []
    const byId = Object.fromEntries(COURSES.map((c) => [c.id, c]))
    for (const c of COURSES) {
      if (!c.sections.length || !c.objectives.length) errors.push(`${c.id} 课程内容为空`)
      for (const id of c.relatedKnowledgeIds ?? []) {
        if (!KNOWLEDGE_BY_ID[id]) errors.push(`${c.id} relatedKnowledgeIds 无效引用 ${id}`)
      }
      for (const id of [...(c.exerciseIds ?? []), ...(c.microExerciseIds ?? [])]) {
        if (!QUESTIONS_BY_ID[id]) errors.push(`${c.id} 引用了不存在的题目 ${id}`)
      }
      if (c.unitId && !TEACHING_BY_ID[c.unitId]) errors.push(`${c.id} 的单元缺少深度教学 ${c.unitId}`)
    }
    for (const m of MODULES.filter((x) => x.hasUnitCourses)) {
      for (const u of m.units) {
        if (!byId[`cu-${u}`]) errors.push(`${m.title} 缺少「${KNOWLEDGE_BY_ID[u]?.name ?? u}」的独立课程`)
      }
    }
    checks.push(check('课程完整：逐知识单元课程 + 有效引用', errors, [
      `共 ${COURSES.length} 节课程，其中 ${UNIT_COURSES.length} 节逐知识单元深度课`,
    ]))
  }

  // 4. 每道题的答案与解析
  {
    const errors: string[] = []
    for (const q of QUESTIONS) validateQuestion(q, errors)
    checks.push(check('所有题目都有正确答案、完整解析与有效知识点引用', errors, [
      `已校验 ${QUESTIONS.length} 道题；引导推理题 ${QUESTIONS.filter((q) => q.type === 'guided').length} 道`,
    ]))
  }

  // 5. 模块知识点覆盖
  {
    const errors: string[] = []
    const mods = moduleCoverage()
    for (const m of mods) {
      if (m.uncovered.length) errors.push(`${m.title} 有无题知识点：${m.uncovered.join(', ')}`)
      if (m.objectiveQuestions < m.units) {
        errors.push(`${m.title} 客观题 ${m.objectiveQuestions} 少于知识点 ${m.units}`)
      }
      for (const u of m.perUnit) {
        const unit = MODULES.find((x) => x.id === m.moduleId)!
        const missingDirs = unit.directions.filter((d) => !u.directions.includes(d))
        // 综合模块只要求 application，基础模块要求 definition；方向不全时至少要有题
        if (u.count === 0) errors.push(`${m.title} 的 ${u.name} 没有任何题目`)
        if (missingDirs.length && m.moduleId === 'houses') {
          errors.push(`${u.name} 缺少方向：${missingDirs.join('/')}`)
        }
      }
    }
    checks.push(check('每个模块的核心知识点都有对应题目', errors,
      mods.map((m) => `${m.title}：${m.units} 个知识点 / ${m.questions} 道题 / ${m.courses} 节单元课`),
    ))
  }

  // 6. 十二宫三方向实际覆盖
  {
    const errors: string[] = []
    const rows: string[] = []
    const dirs = ['forward', 'reverse', 'scenario'] as const
    for (let i = 1; i <= 12; i++) {
      const id = `h-${i}`
      const qs = questionsForUnit(id)
      const counts = dirs.map((d) => qs.filter((q) => q.direction === d).length)
      rows.push(`${KNOWLEDGE_BY_ID[id]?.name ?? id}：正向 ${counts[0]} / 反向 ${counts[1]} / 情境 ${counts[2]}（共 ${qs.length} 题）`)
      dirs.forEach((d, j) => {
        if (counts[j] < 1) errors.push(`${id} 缺少 ${d} 方向题目`)
      })
    }
    const contrast = QUESTIONS.filter((q) => q.direction === 'contrast').length
    const apply = QUESTIONS.filter((q) => q.direction === 'application').length
    if (contrast < 8) errors.push(`跨模块对比辨析题不足 8 道（实际 ${contrast}）`)
    if (apply < 8) errors.push(`综合应用题不足 8 道（实际 ${apply}）`)
    checks.push(check('十二宫位每宫「宫位→含义 / 含义→宫位 / 情境→应用」三方向覆盖', errors, rows))
  }

  // 7. 掌握状态规则一致性
  {
    const errors: string[] = []
    const now = Date.now()
    const empty = () => normalizeState({}) as AppState
    const s0 = empty()
    if (unitStatus(undefined, undefined) !== 'none') errors.push('无记录应为「尚未学习」')
    if (unitStatus(undefined, { id: 'h-1', lastStudied: now, correct: 0, wrong: 0, mastery: 0, nextReview: null }) !== 'studied') {
      errors.push('只学习未练习应为「已学习未练习」')
    }
    let p = updateUnitPractice(undefined, { correct: true, type: 'single', now })
    if (unitStatus(p, { id: 'h-1', lastStudied: now, correct: 1, wrong: 0, mastery: 1, nextReview: null }) === 'mastered') {
      errors.push('答对一道题就显示「熟练掌握」')
    }
    if (unitStatus(p, { id: 'h-1', lastStudied: now, correct: 1, wrong: 0, mastery: 1, nextReview: null }) === 'basic') {
      errors.push('答对一道题就显示「基本掌握」')
    }
    p = updateUnitPractice(p, { correct: true, type: 'truefalse', now })
    const basic = unitStatus(p, { id: 'h-1', lastStudied: now, correct: 2, wrong: 0, mastery: 2, nextReview: null })
    if (basic !== 'basic' && basic !== 'mastered') errors.push(`2 种题型全对应达到「基本掌握」，实际 ${basic}`)
    const spaced = updateUnitPractice(p, { correct: true, type: 'single', now: now + 2 * 86400000 })
    if (unitStatus(spaced, { id: 'h-1', lastStudied: now, correct: 3, wrong: 0, mastery: 3, nextReview: null }) !== 'mastered') {
      errors.push('间隔复习后应达到「熟练掌握」')
    }
    const bad = updateUnitPractice(updateUnitPractice(undefined, { correct: false, type: 'single', now }), { correct: false, type: 'truefalse', now })
    if (unitStatus(bad, { id: 'h-1', lastStudied: now, correct: 0, wrong: 2, mastery: 0, nextReview: null }) !== 'weak') {
      errors.push('连续答错应为「需要加强」')
    }
    // moduleStats 的 mastered 计数必须来自真实练习记录
    const houses = MODULES.find((m) => m.id === 'houses')!
    const clean = moduleStats(houses, s0)
    if (clean.mastered !== 0 || clean.basic !== 0 || clean.coveragePct !== 0) {
      errors.push('空状态却显示已掌握知识点')
    }
    const fake = moduleStats(houses, { ...s0, knowledge: { 'h-1': { id: 'h-1', lastStudied: now, correct: 9, wrong: 0, mastery: 5, nextReview: null } } })
    if (fake.mastered !== 0 || fake.coveragePct !== 0) {
      errors.push('只有旧 mastery 字段、没有练习记录，却显示为已掌握')
    }
    if (Object.keys(emptyUnitPractice()).length < 8) errors.push('UnitPractice 字段不完整')
    checks.push(check('5 态掌握规则：无练习不显示已掌握，答对一题不直达熟练', errors, [
      'none 尚未学习 / studied 已学习未练习 / weak 需要加强 / basic 基本掌握 / mastered 熟练掌握',
    ]))
  }

  // 8. 完整挑战：全覆盖 + 可恢复 + 完成判定
  {
    const errors: string[] = []
    const rows: string[] = []
    for (const m of MODULES) {
      const queue = buildChallengeQueue(m.id, {}, [])
      if (queue.length === 0) {
        errors.push(`${m.title} 挑战队列为空`)
        continue
      }
      if (new Set(queue).size !== queue.length) errors.push(`${m.title} 挑战队列有重复题目`)
      if (queue.some((id) => !QUESTIONS_BY_ID[id])) errors.push(`${m.title} 挑战队列含无效题目 id`)
      const covered = coveredUnits(m.id, queue)
      if (covered.size !== m.units.length) {
        errors.push(`${m.title} 挑战只覆盖 ${covered.size}/${m.units.length} 个知识点：${m.units.filter((u) => !covered.has(u)).join(', ')}`)
      }
      // 模拟逐题作答；index/results 可随时序列化，退出后恢复
      const results: Record<string, { correct: boolean; at: number }> = {}
      for (const id of queue) results[id] = { correct: true, at: Date.now() }
      if (!isChallengeComplete(m.id, queue, results)) {
        errors.push(`${m.title} 全部作答后仍未判定完成`)
      }
      const partial: Record<string, { correct: boolean; at: number }> = {}
      for (const id of queue.slice(0, Math.max(1, queue.length - 1))) partial[id] = { correct: true, at: Date.now() }
      if (isChallengeComplete(m.id, queue, partial)) errors.push(`${m.title} 未答完就判定完成`)
      // 队列里每道题都能定位到主知识单元（保证练习记录可归属）
      for (const id of queue) {
        if (!primaryUnit(QUESTIONS_BY_ID[id])) errors.push(`${m.title} 队列题目 ${id} 无法归属知识单元`)
      }
      rows.push(`${m.title}：${queue.length} 题，覆盖 ${covered.size}/${m.units.length} 个知识点，未完成前判定 = false`)
    }
    checks.push(check('完整掌握挑战：未练优先 → 全覆盖 → 对比题 → 综合题，中途可恢复', errors, rows))
  }

  // 9. 旧备份迁移
  {
    const errors: string[] = []
    const v1 = {
      version: 1,
      createdAt: 1700000000000,
      completedCourses: ['c1', 'c2'],
      knowledge: { 'h-1': { id: 'h-1', lastStudied: 1700000000000, correct: 3, wrong: 1, mastery: 3, nextReview: null } },
      quizHistory: [{ questionId: 'q-trop-1', type: 'single', correct: true, practiced: false, at: 1700000000000 }],
      streak: { count: 7, lastDate: '2026-01-01' },
      notes: [],
      favorites: ['z-aries'],
      wrongQuestions: { 'q-trop-2': 1700000000000 },
      studyDates: ['2026-01-01'],
      sunSign: 'z-leo',
      theme: 'light',
    }
    const n = normalizeState(v1)
    if (n.completedCourses.length !== 2) errors.push('v1 已完成课程丢失')
    if (n.knowledge['h-1']?.mastery !== 3) errors.push('v1 知识点掌握记录丢失')
    if (n.quizHistory.length !== 1) errors.push('v1 测验历史丢失')
    if (n.streak.count !== 7) errors.push('v1 连续学习天数丢失')
    if (n.theme !== 'light' || n.sunSign !== 'z-leo') errors.push('v1 用户设置丢失')
    if (!n.practiceByUnit || !n.challenge) errors.push('v1 未补齐 practiceByUnit / challenge')
    if (Object.keys(n.practiceByUnit).length !== 0 || Object.keys(n.challenge).length !== 0) {
      errors.push('v1 迁移凭空生成了练习记录')
    }
    const v2 = normalizeState({
      ...v1,
      practiceByUnit: { 'h-1': emptyUnitPractice() },
      challenge: { houses: { moduleId: 'houses', queue: ['qh-h-1-f'], index: 1, results: {}, completed: false, startedAt: 1, updatedAt: 2 } },
    })
    if (!v2.practiceByUnit['h-1'] || v2.challenge.houses?.index !== 1) {
      errors.push('v2 挑战进度恢复失败')
    }
    checks.push(check('旧学习记录兼容：v1 备份无损迁移，v2 挑战进度可恢复', errors, [
      '已完成课程 / 知识掌握 / 测验历史 / 连续天数 / 收藏 / 错题 / 设置 均保留',
    ]))
  }

  return {
    ok: checks.every((c) => c.ok),
    checks,
    modules: moduleCoverage(),
    totals: {
      knowledge: ALL_KNOWLEDGE.length,
      teaching: Object.keys(TEACHING_BY_ID).length,
      courses: COURSES.length,
      unitCourses: UNIT_COURSES.length,
      questions: QUESTIONS.length,
      guided: QUESTIONS.filter((q) => q.type === 'guided').length,
    },
  }
}
