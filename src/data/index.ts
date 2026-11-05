import type { KnowledgeItem, KnowledgeCategory } from '../types'
import { ZODIAC } from './zodiac'
import { PLANETS } from './planets'
import { HOUSES } from './houses'
import { ASPECTS } from './aspects'
import { ELEMENTS } from './elements'
import { MODALITIES } from './modalities'
import { TERMS } from './terminology'

export const ALL_KNOWLEDGE: KnowledgeItem[] = [
  ...ZODIAC,
  ...PLANETS,
  ...HOUSES,
  ...ASPECTS,
  ...ELEMENTS,
  ...MODALITIES,
  ...TERMS,
]

export const KNOWLEDGE_BY_ID: Record<string, KnowledgeItem> =
  Object.fromEntries(ALL_KNOWLEDGE.map((k) => [k.id, k]))

export const CATEGORY_LABEL: Record<KnowledgeCategory, string> = {
  zodiac: '十二星座',
  planet: '行星与天体',
  house: '十二宫位',
  aspect: '主要相位',
  element: '四元素',
  modality: '三模式',
  term: '基础术语',
}

export function getKnowledge(id: string): KnowledgeItem | undefined {
  return KNOWLEDGE_BY_ID[id]
}

export function getByCategory(cat: KnowledgeCategory): KnowledgeItem[] {
  return ALL_KNOWLEDGE.filter((k) => k.category === cat)
}

export function searchKnowledge(query: string): KnowledgeItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return ALL_KNOWLEDGE.filter((k) => {
    const hay = [
      k.name,
      k.nameEn,
      k.symbol,
      k.summary,
      k.detail,
      ...k.keywords,
    ]
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
}
