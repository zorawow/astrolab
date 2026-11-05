import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Star, Lightbulb, AlertTriangle, Link2, StickyNote, Trash2,
  RefreshCw, GraduationCap, Sparkles, BarChart3, Zap,
} from 'lucide-react'
import { useStore } from '../lib/store'
import { getKnowledge, getTeaching } from '../data'
import { courseForUnit, questionsForUnit, MODULES } from '../data/curriculum'
import { unitStatus, unitAccuracy, STATUS_LABEL, STATUS_COLOR, MASTERY_RULES } from '../lib/coverage'
import type { AspectItem, KnowledgeItem } from '../types'
import { Card, Button, Glyph, Badge, Disclosure } from '../components/ui'
import { TeachingView } from '../components/TeachingView'
import type { ReviewRating } from '../lib/review'

function AspectDiagram({ angle }: { angle: number }) {
  const size = 160
  const c = size / 2
  const r = 58
  const a1 = -90
  const a2 = a1 + angle
  const rad = (d: number) => (d * Math.PI) / 180
  const x1 = c + r * Math.cos(rad(a1))
  const y1 = c + r * Math.sin(rad(a1))
  const x2 = c + r * Math.cos(rad(a2))
  const y2 = c + r * Math.sin(rad(a2))
  return (
    <div className="flex justify-center py-3">
      <svg width={size} height={size} className="text-primary">
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={3} />
        <line x1={c} y1={c} x2={x1} y2={y1} stroke="var(--primary)" strokeWidth={3} strokeLinecap="round" />
        <line x1={c} y1={c} x2={x2} y2={y2} stroke="var(--gold)" strokeWidth={3} strokeLinecap="round" />
        <circle cx={x1} cy={y1} r={5} fill="var(--primary)" />
        <circle cx={x2} cy={y2} r={5} fill="var(--gold)" />
        <text x={c} y={size - 6} textAnchor="middle" fontSize={13} fill="var(--text-dim)">
          {angle}°
        </text>
      </svg>
    </div>
  )
}

const RATINGS: { key: ReviewRating; label: string }[] = [
  { key: 'none', label: '完全不会' },
  { key: 'vague', label: '有点模糊' },
  { key: 'ok', label: '基本记住' },
  { key: 'familiar', label: '非常熟悉' },
]

export default function KnowledgeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const store = useStore()
  const item: KnowledgeItem | undefined = id ? getKnowledge(id) : undefined
  const [note, setNote] = useState('')

  if (!item) {
    navigate('/wiki')
    return null
  }

  const fav = store.favorites.includes(item.id)
  const isAspect = item.category === 'aspect'
  const notes = store.notes.filter((n) => n.knowledgeId === item.id)
  const teaching = getTeaching(item.id)
  const course = courseForUnit(item.id)
  const qs = questionsForUnit(item.id)
  const practice = store.practiceByUnit?.[item.id]
  const status = unitStatus(practice, store.knowledge?.[item.id])
  const accuracy = unitAccuracy(practice)
  const moduleOfUnit = MODULES.find((m) => m.units.includes(item.id))

  const related: KnowledgeItem[] = (item.relatedIds || [])
    .map((rid) => getKnowledge(rid))
    .filter((k): k is KnowledgeItem => Boolean(k))

  return (
    <div className="fade-up space-y-4 pt-2 pb-24">
      <button onClick={() => navigate(-1)} className="tap flex items-center gap-1 text-dim text-sm">
        <ArrowLeft size={16} /> 返回
      </button>

      {/* 头部 */}
      <Card className="flex items-center gap-4">
        <Glyph symbol={item.symbol} size={64} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{item.name}</h1>
            <span className="text-sm text-dim">{item.nameEn}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <Badge color="muted">{item.keywords[0]}</Badge>
            {item.keywords.slice(1, 3).map((k) => (
              <Badge key={k} color="primary">{k}</Badge>
            ))}
          </div>
        </div>
        <button
          onClick={() => store.toggleFavorite(item.id)}
          className="tap shrink-0 p-2 rounded-full surface-2"
          aria-label="收藏"
        >
          <Star size={22} className={fav ? 'text-gold fill-gold' : 'text-dim'} />
        </button>
      </Card>

      {/* 真实掌握状态（5 态，来自练习记录） */}
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-dim">当前掌握状态</div>
            <div className="font-bold text-lg mt-0.5" data-mastery-status={status}>
              <Badge color={STATUS_COLOR[status]}>{STATUS_LABEL[status]}</Badge>
            </div>
          </div>
          <div className="text-right text-xs text-dim">
            <div>练习 <span className="font-semibold text-[var(--text)]">{practice?.attempts ?? 0}</span> 次</div>
            <div>正确率 <span className="font-semibold text-[var(--text)]">{accuracy}%</span> · 题型 <span className="font-semibold text-[var(--text)]">{practice?.types.length ?? 0}</span> 种</div>
          </div>
        </div>
        <div className="mt-3 h-2 rounded-full surface-2 overflow-hidden">
          <div
            className="h-full bg-lilac transition-all"
            style={{ width: `${Math.min(100, Math.round(((practice?.attempts ?? 0) / MASTERY_RULES.minAttemptsForMasteredByVolume) * 100))}%` }}
          />
        </div>
        <p className="text-[11px] text-dim mt-2 leading-relaxed">
          规则：至少 {MASTERY_RULES.minAttemptsForBasic} 次练习、{MASTERY_RULES.minTypesForBasic} 种题型、正确率 ≥ {MASTERY_RULES.minAccuracyForBasic * 100}% 才算「基本掌握」；
          之后再有间隔复习答对或累计 {MASTERY_RULES.minAttemptsForMasteredByVolume} 次且正确率 ≥ {MASTERY_RULES.minAccuracyForMasteredByVolume * 100}% 才进入「熟练掌握」。
        </p>
        <div className="grid grid-cols-2 gap-2.5 mt-3">
          <Button
            variant="gold"
            disabled={qs.length === 0}
            onClick={() => navigate(`/quiz/unit?unit=${item.id}`)}
          >
            <Zap size={15} /> 练这个点（{qs.length}）
          </Button>
          {course ? (
            <Button variant="ghost" onClick={() => navigate(`/courses/${course.id}`)}>
              <GraduationCap size={15} /> 完整课程
            </Button>
          ) : moduleOfUnit ? (
            <Button variant="ghost" onClick={() => navigate(`/modules/${moduleOfUnit.id}`)}>
              <BarChart3 size={15} /> 模块进度
            </Button>
          ) : null}
        </div>
      </Card>

      {/* 三层深度教学 */}
      {teaching ? (
        <TeachingView unitId={item.id} />
      ) : (
        <Card>
          <h2 className="font-bold mb-2">详细讲解</h2>
          <p className="text-sm leading-relaxed">{item.detail}</p>
        </Card>
      )}

      {/* 相位几何图 */}
      {isAspect && <Card><AspectDiagram angle={(item as AspectItem).angle} /></Card>}

      {/* 百科简版快速回顾 */}
      <Disclosure title="快速回顾（百科简版）" subtitle="一句话摘要、生活实例、常见误解" icon={<Lightbulb size={17} />}>
        <div>
          <p className="text-sm leading-relaxed">{item.summary}</p>
        </div>
        {item.examples.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">实例</div>
            <ul className="space-y-1.5 text-sm">
              {item.examples.map((e, i) => (
                <li key={i} className="flex gap-2"><span className="text-gold">·</span><span className="text-dim">{e}</span></li>
              ))}
            </ul>
          </div>
        )}
        {item.misconceptions.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <AlertTriangle size={13} /> 常见误解
            </div>
            <ul className="space-y-1.5 text-sm">
              {item.misconceptions.map((m, i) => (
                <li key={i} className="flex gap-2"><span className="text-red-400">!</span><span className="text-dim">{m}</span></li>
              ))}
            </ul>
          </div>
        )}
      </Disclosure>

      {/* 复习自评 */}
      <Card>
        <h2 className="font-bold mb-1 flex items-center gap-1">
          <RefreshCw size={16} className="text-primary" /> 复习自评
        </h2>
        <p className="text-xs text-dim mb-3">根据你现在的理解选择，系统会安排下次复习时间。</p>
        <div className="grid grid-cols-2 gap-2">
          {RATINGS.map((r) => (
            <Button key={r.key} variant="ghost" onClick={() => store.reviewKnowledge(item.id, r.key)}>
              {r.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* 相关知识点 */}
      {related.length > 0 && (
        <div>
          <h2 className="font-bold mb-2 flex items-center gap-1">
            <Link2 size={16} className="text-primary" /> 相关知识点
          </h2>
          <div className="flex flex-wrap gap-2">
            {related.map((r) => (
              <button
                key={r.id}
                onClick={() => navigate(`/wiki/${r.id}`)}
                className="tap surface-2 rounded-full px-3 py-1.5 text-sm flex items-center gap-1.5 border border-token"
              >
                <span className="text-primary">{r.symbol}</span>{r.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 笔记 */}
      <div>
        <h2 className="font-bold mb-2 flex items-center gap-1">
          <StickyNote size={16} className="text-gold" /> 学习笔记
        </h2>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="记下你的理解或疑问…"
          rows={3}
          className="w-full rounded-xl p-3 surface-2 outline-none border border-token text-sm resize-none"
        />
        <Button
          className="mt-2"
          variant="gold"
          disabled={!note.trim()}
          onClick={() => { store.addNote(item.id, note.trim()); setNote('') }}
        >
          <Sparkles size={15} /> 保存笔记
        </Button>
        <div className="space-y-2 mt-3">
          {notes.map((n) => (
            <Card key={n.id} className="flex items-start gap-3" padded>
              <p className="flex-1 text-sm text-dim">{n.text}</p>
              <button
                onClick={() => store.deleteNote(n.id)}
                className="tap text-dim hover:text-red-400 shrink-0"
                aria-label="删除笔记"
              >
                <Trash2 size={16} />
              </button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
