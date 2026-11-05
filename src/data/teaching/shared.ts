import type { TeachingContent, TeachingExample } from '../../types'

/**
 * 紧凑教学条目规格。所有文字都必须显式撰写，构造器只负责装配字段，
 * 不生成任何同质化内容，也不复制定义来凑段落。
 */
export interface ShortSpec {
  /** ① 一句话核心概念 */
  core: string
  /** ② 深入解释，至少两段，内容不得重复 */
  deep: [string, string] | [string, string, string]
  /** ② 象征意义的来源 */
  why: string
  /** ② 与类似概念的区别 */
  distinction: string
  /** ② 初学者最易误解处 */
  beginnerTrap: string
  /** ③ ≥2 个不同生活场景，[场景名, 说明] */
  examples: [string, string][] | TeachingExample[]
  /** ④ 相似概念对比，[知识点 id, 区别说明] */
  contrasts: [string, string][]
  /** ⑤ 组合应用，[标题, 分步推理, 结论] */
  app: [string, string[], string]
  /** ⑥ ≥2 条误区，[误解, 来源, 纠正] */
  misconceptions: [string, string, string][]
  /** ⑦ [关键词, 一句总结, 理解性记忆法, 关联知识点] */
  recap: [string[], string, string, string[]]
  /** 分层：简单理解（默认显示） */
  simple: string
  /** 分层：实际应用 */
  practice: string
  /** 传统／现代差异标注 */
  traditionalNote?: string
  /** 明确不应推断的内容 */
  notToInfer?: string
}

export function short(s: ShortSpec): TeachingContent {
  const examples: TeachingExample[] = Array.isArray(s.examples[0])
    ? (s.examples as [string, string][]).map(([scene, text]) => ({ scene, text }))
    : (s.examples as TeachingExample[])

  return {
    core: s.core,
    deep: [...s.deep],
    why: s.why,
    distinction: s.distinction,
    beginnerTrap: s.beginnerTrap,
    examples,
    contrasts: s.contrasts.map(([withId, point]) => ({ withId, point })),
    application: {
      title: s.app[0],
      steps: s.app[1],
      conclusion: s.app[2] + (s.notToInfer ? ` 注意：${s.notToInfer}` : ''),
    },
    misconceptions: s.misconceptions.map(([text, origin, fix]) => ({ text, origin, fix })),
    recap: {
      keywords: s.recap[0],
      oneLiner: s.recap[1],
      memoryTip: s.recap[2],
      links: s.recap[3],
    },
    traditionalNote: s.traditionalNote,
    layers: {
      simple: s.simple,
      advanced: [s.deep[0], s.why, s.distinction].join('\n\n'),
      practice: s.practice,
    },
  }
}
