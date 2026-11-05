import type { KnowledgeBase, TeachingContent } from '../../types'
import { HOUSE_TEACHING_A } from './housesA'
import { HOUSE_TEACHING_B } from './housesB'
import { ZODIAC_TEACHING } from './zodiac'
import { PLANET_TEACHING, ASPECT_TEACHING } from './bodies'
import { MISC_TEACHING } from './misc'

/** 全站深度教学内容索引：每个知识卡 id → 完整教学 */
export const TEACHING_BY_ID: Record<string, TeachingContent> = {
  ...HOUSE_TEACHING_A,
  ...HOUSE_TEACHING_B,
  ...ZODIAC_TEACHING,
  ...PLANET_TEACHING,
  ...ASPECT_TEACHING,
  ...MISC_TEACHING,
}

export function getTeaching(id: string): TeachingContent | undefined {
  return TEACHING_BY_ID[id]
}

/**
 * 把深度教学挂到知识卡上。保留原有 summary/detail/examples/misconceptions
 * 作为百科简版，teaching 作为课程与知识详情页的深度版。
 */
export function attachTeaching<T extends KnowledgeBase>(items: T[]): T[] {
  for (const item of items) {
    const t = TEACHING_BY_ID[item.id]
    if (t) item.teaching = t
  }
  return items
}

/** 供完整性检查使用：返回没有深度教学的知识卡 id */
export function missingTeaching(ids: string[]): string[] {
  return ids.filter((id) => !TEACHING_BY_ID[id])
}
