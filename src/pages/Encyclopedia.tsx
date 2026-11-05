import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Star } from 'lucide-react'
import { useStore } from '../lib/store'
import { ALL_KNOWLEDGE, CATEGORY_LABEL, getByCategory } from '../data'
import type { KnowledgeCategory } from '../types'
import { Card, Glyph, Badge } from '../components/ui'

const CATEGORIES: (KnowledgeCategory | 'all')[] = [
  'all',
  'zodiac',
  'planet',
  'house',
  'aspect',
  'element',
  'modality',
  'term',
]

export default function Encyclopedia() {
  const navigate = useNavigate()
  const store = useStore()
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState<KnowledgeCategory | 'all'>('all')
  const [favOnly, setFavOnly] = useState(false)

  const list = useMemo(() => {
    let base = cat === 'all' ? ALL_KNOWLEDGE : getByCategory(cat)
    if (favOnly) base = base.filter((k) => store.favorites.includes(k.id))
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      base = base.filter((k) =>
        [k.name, k.nameEn, k.symbol, k.summary, ...k.keywords].join(' ').toLowerCase().includes(q),
      )
    }
    return base
  }, [cat, favOnly, query, store.favorites])

  return (
    <div className="fade-up space-y-4 pt-2">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">占星知识百科</h1>
        <p className="text-dim text-sm mt-1">共 {ALL_KNOWLEDGE.length} 张知识卡 · 点击查看详情</p>
      </header>

      {/* 搜索 */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索星座、行星、宫位、术语…"
          className="w-full rounded-xl pl-10 pr-3 py-3 surface-2 outline-none border border-token text-sm"
        />
      </div>

      {/* 分类 + 收藏 */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`tap shrink-0 rounded-full px-3.5 py-1.5 text-sm border ${
              cat === c
                ? 'bg-lilac/20 text-primary border-lilac'
                : 'surface-2 text-dim border-token'
            }`}
          >
            {c === 'all' ? '全部' : CATEGORY_LABEL[c]}
          </button>
        ))}
        <button
          onClick={() => setFavOnly((v) => !v)}
          className={`tap shrink-0 rounded-full px-3.5 py-1.5 text-sm border flex items-center gap-1 ${
            favOnly ? 'bg-gold/20 text-accent border-gold' : 'surface-2 text-dim border-token'
          }`}
        >
          <Star size={14} /> 收藏
        </button>
      </div>

      {/* 列表 */}
      <div className="space-y-3">
        {list.map((k) => {
          const fav = store.favorites.includes(k.id)
          const prog = store.knowledge[k.id]
          return (
            <Card key={k.id} onClick={() => navigate(`/wiki/${k.id}`)} className="flex items-center gap-4">
              <Glyph symbol={k.symbol} size={48} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold truncate">{k.name}</span>
                  <span className="text-xs text-dim">{k.nameEn}</span>
                </div>
                <p className="text-sm text-dim truncate">{k.summary}</p>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  <Badge color="muted">{CATEGORY_LABEL[k.category]}</Badge>
                  {prog && prog.lastStudied != null && (
                    <Badge color="gold">
                      掌握 {['未学', '初识', '了解', '熟悉', '掌握', '精通'][prog.mastery]}
                    </Badge>
                  )}
                </div>
              </div>
              {fav && <Star size={18} className="text-gold shrink-0 fill-gold" />}
            </Card>
          )
        })}
        {list.length === 0 && (
          <div className="text-center text-dim py-10">没有找到匹配的内容</div>
        )}
      </div>
    </div>
  )
}
