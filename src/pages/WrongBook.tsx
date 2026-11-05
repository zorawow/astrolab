import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, AlertCircle, BookOpen, RotateCcw, ChevronDown, ChevronRight,
  Clock, Target, Lightbulb, ListOrdered, CheckCircle2,
} from 'lucide-react'
import { useStore } from '../lib/store'
import { getQuestion, QUESTIONS } from '../data/questions'
import { CATEGORY_LABEL, getKnowledge } from '../data'
import { moduleStats, STATUS_LABEL } from '../lib/coverage'
import { MODULES } from '../data/curriculum'
import { QuestionCard } from '../components/QuestionCard'
import { Card, Button, Badge, EmptyState, Disclosure } from '../components/ui'
import { formatDate } from '../lib/util'
import type { Question } from '../types'

interface WrongItem {
  q: Question
  at: number
  times: number
}

export default function WrongBook() {
  const navigate = useNavigate()
  const store = useStore()
  const [openId, setOpenId] = useState<string | null>(null)
  const [redoId, setRedoId] = useState<string | null>(null)

  const items = useMemo<WrongItem[]>(() => {
    return Object.entries(store.wrongQuestions)
      .map(([id, at]) => {
        const q = getQuestion(id)
        if (!q) return null
        const times = store.quizHistory.filter(
          (r) => r.questionId === id && !r.correct && !r.practiced,
        ).length
        return { q, at, times: Math.max(1, times) }
      })
      .filter((x): x is WrongItem => Boolean(x))
      .sort((a, b) => b.at - a.at)
  }, [store.wrongQuestions, store.quizHistory])

  // 按知识领域分组，同时统计每个模块需要加强的知识点
  const groups = useMemo(() => {
    const map = new Map<string, WrongItem[]>()
    for (const it of items) {
      const key = CATEGORY_LABEL[it.q.category] ?? '其他'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(it)
    }
    return [...map.entries()]
  }, [items])

  const weakUnits = useMemo(
    () => MODULES.flatMap((m) => moduleStats(m, store).units.filter((u) => u.status === 'weak')),
    [store.knowledge, store.practiceByUnit],
  )

  const handleRedo = (q: Question, correct: boolean, practiced: boolean) => {
    store.recordQuiz(q.id, q.type, correct, practiced, q.relatedIds)
    setRedoId(null)
    setOpenId(null)
  }

  return (
    <div className="fade-up space-y-5 pt-2 pb-24">
      <button onClick={() => navigate('/quiz')} className="tap flex items-center gap-1 text-dim text-sm">
        <ArrowLeft size={16} /> 返回测验
      </button>

      <header>
        <h1 className="text-2xl font-bold tracking-tight">错题本</h1>
        <p className="text-dim text-sm mt-1">
          按知识点归档 · 看清错在哪 · 直接重做并回看讲解
        </p>
      </header>

      <div className="grid grid-cols-3 gap-2.5">
        <Card className="text-center py-3" padded={false}>
          <div className="text-2xl font-bold text-red-400">{items.length}</div>
          <div className="text-xs text-dim">待巩固题目</div>
        </Card>
        <Card className="text-center py-3" padded={false}>
          <div className="text-2xl font-bold text-primary">{groups.length}</div>
          <div className="text-xs text-dim">涉及领域</div>
        </Card>
        <Card className="text-center py-3" padded={false}>
          <div className="text-2xl font-bold text-accent">{weakUnits.length}</div>
          <div className="text-xs text-dim">需加强知识点</div>
        </Card>
      </div>

      {/* 需要加强的知识点 */}
      {weakUnits.length > 0 && (
        <Disclosure
          title={`需要加强的知识点（${weakUnits.length}）`}
          subtitle="来自真实的练习次数、正确率与题型覆盖，不是猜测"
          icon={<Target size={18} />}
          tone="primary"
        >
          <div className="flex flex-wrap gap-1.5">
            {weakUnits.slice(0, 24).map((u) => (
              <button
                key={u.id}
                onClick={() => navigate(`/wiki/${u.id}`)}
                className="tap surface-2 rounded-full px-2.5 py-1 text-xs border border-token flex items-center gap-1"
              >
                {getKnowledge(u.id)?.symbol} {u.name}
                <span className="text-dim">· {STATUS_LABEL[u.status]}</span>
              </button>
            ))}
          </div>
        </Disclosure>
      )}

      {items.length === 0 ? (
        <EmptyState
          title="错题本已经清空"
          desc="答对一道错题后，它会自动从这里移出；间隔复习还会再安排它出现一次。"
        />
      ) : (
        <>
          <div className="flex gap-2.5">
            <Button full variant="primary" onClick={() => navigate('/quiz/wrong')}>
              <RotateCcw size={16} /> 连续重做全部错题
            </Button>
            <Button variant="ghost" onClick={() => navigate('/quiz/review')}>
              <Clock size={16} /> 间隔复习
            </Button>
          </div>

          {groups.map(([group, list]) => (
            <div key={group} className="space-y-2.5">
              <h2 className="text-base font-bold flex items-center gap-2">
                <AlertCircle size={15} className="text-red-400" />
                {group}
                <Badge color="muted">{list.length}</Badge>
              </h2>
              {list.map(({ q, at, times }) => {
                const open = openId === q.id
                const unit = q.unitId ? getKnowledge(q.unitId) : undefined
                const a = q.analysis
                return (
                  <Card key={q.id} padded={false} className="overflow-hidden">
                    <button
                      onClick={() => {
                        setOpenId(open ? null : q.id)
                        setRedoId(null)
                      }}
                      className="tap w-full text-left p-4 flex items-start gap-3"
                    >
                      <span className="flex-1 min-w-0">
                        <span className="font-medium text-sm leading-relaxed block">{q.prompt}</span>
                        <span className="text-xs text-dim mt-1.5 flex flex-wrap items-center gap-2">
                          <span>{formatDate(new Date(at))}</span>
                          <span>· 错 {times} 次</span>
                          {unit && <span>· 考点：{unit.name}</span>}
                          {q.direction && <span>· {q.direction}</span>}
                        </span>
                      </span>
                      <ChevronDown size={17} className={`text-dim shrink-0 mt-0.5 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>

                    {open && (
                      <div className="px-4 pb-4 space-y-3 border-t border-token pt-3 animate-[fadeUp_0.25s_ease-out]">
                        {/* 错因与正确思路 */}
                        <div className="p-3 rounded-xl bg-red-500/8 border border-red-400/30 text-sm">
                          <div className="font-semibold text-red-400 flex items-center gap-1 mb-1">
                            <AlertCircle size={14} /> 容易错在哪
                          </div>
                          <p className="text-dim leading-relaxed">
                            {q.commonError ?? a?.whyCorrect ?? '回到知识点讲解，重新走一遍推理过程。'}
                          </p>
                        </div>

                        {a?.whyCorrect && (
                          <div className="p-3 rounded-xl surface-2 text-sm">
                            <div className="font-semibold text-primary flex items-center gap-1 mb-1">
                              <Lightbulb size={14} /> 正确思路
                            </div>
                            <p className="leading-relaxed">{a.whyCorrect}</p>
                          </div>
                        )}

                        {a?.reasoningChain && a.reasoningChain.length > 0 && (
                          <Disclosure title="推理过程" icon={<ListOrdered size={16} />}>
                            <ol className="space-y-1.5">
                              {a.reasoningChain.map((s, i) => (
                                <li key={i} className="flex gap-2 text-sm">
                                  <span className="text-primary font-semibold">{i + 1}.</span>
                                  <span className="flex-1">{s}</span>
                                </li>
                              ))}
                            </ol>
                          </Disclosure>
                        )}

                        {a?.reviewIds && a.reviewIds.length > 0 && (
                          <div>
                            <div className="text-xs text-dim mb-1.5">应复习的知识点</div>
                            <div className="flex flex-wrap gap-1.5">
                              {a.reviewIds.filter((id) => Boolean(getKnowledge(id))).map((id) => (
                                <button
                                  key={id}
                                  onClick={() => navigate(`/wiki/${id}`)}
                                  className="tap surface-2 rounded-full px-2.5 py-1 text-xs border border-token flex items-center gap-1"
                                >
                                  {getKnowledge(id)!.symbol} {getKnowledge(id)!.name}
                                  <ChevronRight size={12} />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2.5">
                          <Button
                            variant="ghost"
                            onClick={() => navigate(`/wiki/${unit?.id ?? q.relatedIds[0] ?? ''}`)}
                          >
                            <BookOpen size={15} /> 返回讲解
                          </Button>
                          <Button variant="gold" onClick={() => setRedoId(redoId === q.id ? null : q.id)}>
                            <RotateCcw size={15} /> 重新作答
                          </Button>
                        </div>

                        {redoId === q.id && (
                          <div className="pt-1">
                            <QuestionCard q={q} onResult={(c, p) => handleRedo(q, c, p)} />
                            <p className="text-[11px] text-dim mt-2 flex items-center gap-1">
                              <CheckCircle2 size={12} /> 答对后会自动从错题本移出，并写入该知识点的掌握状态。
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          ))}
        </>
      )}

      <p className="text-[11px] text-dim text-center leading-relaxed">
        错题按最近一次错误时间排序。系统只记录「是否答对」，不存储你当时选的具体选项，
        因此这里展示的是该通用错因与完整正确思路。
        题库共 {QUESTIONS.length} 道题。
      </p>
    </div>
  )
}
