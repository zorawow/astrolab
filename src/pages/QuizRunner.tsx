import { useMemo, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, RotateCcw, Trophy } from 'lucide-react'
import { useStore, type Store } from '../lib/store'
import { QUESTIONS, getQuestion } from '../data/questions'
import { getByCategory } from '../data'
import { MODULES, questionsForUnit, primaryUnit } from '../data/curriculum'
import { moduleStats } from '../lib/coverage'
import type { Question } from '../types'
import { QuestionCard } from '../components/QuestionCard'
import { Button, ProgressRing } from '../components/ui'
import { startOfToday } from '../lib/util'

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr]
  let s = seed
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280
    const j = Math.floor((s / 233280) * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function objective(q: Question) {
  return q.type !== 'guided' && q.type !== 'reasoning'
}

function buildList(mode: string, cat: string | null, unit: string | null, store: Store): Question[] {
  const daySeed = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  switch (mode) {
    case 'daily':
      // 每日练习保持短平快，不插入长篇引导推理题
      return seededShuffle(QUESTIONS.filter(objective), daySeed).slice(0, 6)
    case 'quick': {
      // 快速练习：优先「从未练过 / 需要加强」的知识点，跨模块各抽一题
      const picked = new Set<string>()
      const list: Question[] = []
      for (const m of MODULES) {
        const s = moduleStats(m, store)
        for (const u of s.recommended.slice(0, 3)) {
          const q = questionsForUnit(u).find((x) => objective(x) && !picked.has(x.id))
          if (q) {
            picked.add(q.id)
            list.push(q)
          }
        }
      }
      if (list.length < 8) {
        for (const q of seededShuffle(QUESTIONS.filter(objective), daySeed + 11)) {
          if (list.length >= 8) break
          if (!picked.has(q.id)) {
            picked.add(q.id)
            list.push(q)
          }
        }
      }
      return list.slice(0, 8)
    }
    case 'unit': {
      if (!unit) return []
      const qs = questionsForUnit(unit)
      return qs.length ? qs.slice(0, 8) : QUESTIONS.filter((q) => q.relatedIds.includes(unit)).slice(0, 8)
    }
    case 'guided':
      return QUESTIONS.filter((q) => q.type === 'guided')
    case 'contrast':
      return QUESTIONS.filter((q) => q.direction === 'contrast' && objective(q))
    case 'application':
      return QUESTIONS.filter((q) => q.direction === 'application' && objective(q))
    case 'topic':
      return getByCategory((cat as any) || 'zodiac').length
        ? QUESTIONS.filter((q) => q.category === (cat || 'zodiac'))
        : []
    case 'wrong':
      return Object.keys(store.wrongQuestions)
        .sort((a, b) => (store.wrongQuestions[b] ?? 0) - (store.wrongQuestions[a] ?? 0))
        .map((id) => getQuestion(id))
        .filter((q): q is Question => Boolean(q))
    case 'random':
      return seededShuffle(QUESTIONS, daySeed + 7).slice(0, 8)
    case 'review': {
      // 智能复习：先找到期知识点，再找需要加强的单元，最后按对应题目组卷
      const dueIds = Object.values(store.knowledge)
        .filter((k) => k.nextReview != null && k.nextReview <= startOfToday())
        .map((k) => k.id)
      const weakIds = MODULES.flatMap((m) => moduleStats(m, store).units)
        .filter((u) => u.status === 'weak' || u.due)
        .map((u) => u.id)
      const ids = [...new Set([...dueIds, ...weakIds])]
      if (ids.length === 0) return seededShuffle(QUESTIONS.filter(objective), daySeed + 3).slice(0, 6)
      const related = QUESTIONS.filter((q) => {
        if (!objective(q)) return false
        const u = primaryUnit(q)
        return (u && ids.includes(u)) || q.relatedIds.some((r) => ids.includes(r))
      })
      return related.length > 0
        ? seededShuffle(related, daySeed + 5).slice(0, 8)
        : seededShuffle(QUESTIONS.filter(objective), daySeed + 3).slice(0, 6)
    }
    default:
      return []
  }
}

const MODE_TITLE: Record<string, string> = {
  daily: '每日练习',
  quick: '快速练习',
  unit: '知识点练习',
  guided: '引导式推理',
  contrast: '对比辨析',
  application: '综合应用',
  topic: '专题练习',
  wrong: '错题练习',
  random: '随机复习',
  review: '智能复习',
}

export default function QuizRunner() {
  const { mode } = useParams()
  const [params] = useSearchParams()
  const cat = params.get('cat')
  const unit = params.get('unit')
  const navigate = useNavigate()
  const store = useStore()

  const list = useMemo(
    () => buildList(mode || '', cat, unit, store),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, cat, unit, store.wrongQuestions, store.knowledge, store.practiceByUnit],
  )
  const [current, setCurrent] = useState(0)
  const [answered, setAnswered] = useState<boolean[]>([])
  const [correctArr, setCorrectArr] = useState<boolean[]>([])
  const [practicedArr, setPracticedArr] = useState<boolean[]>([])
  const [finished, setFinished] = useState(false)

  if (list.length === 0) {
    return (
      <div className="fade-up pt-10 text-center space-y-4">
        <p className="text-dim">暂时没有可练习的题目。</p>
        <Button variant="ghost" onClick={() => navigate('/quiz')}>返回测验</Button>
      </div>
    )
  }

  const q = list[current]
  const done = answered[current] ?? false

  const handleResult = (correct: boolean, practiced: boolean) => {
    store.recordQuiz(q.id, q.type, correct, practiced, q.relatedIds)
    setAnswered((a) => [...a.slice(0, current), true, ...a.slice(current + 1)])
    setCorrectArr((a) => [...a.slice(0, current), correct, ...a.slice(current + 1)])
    setPracticedArr((a) => [...a.slice(0, current), practiced, ...a.slice(current + 1)])
  }

  const next = () => {
    if (current + 1 < list.length) setCurrent(current + 1)
    else setFinished(true)
  }

  const objectiveTotal = practicedArr.filter((p) => !p).length
  const correctTotal = correctArr.filter((c) => c).length
  const accuracy = objectiveTotal > 0 ? Math.round((correctTotal / objectiveTotal) * 100) : 100

  if (finished) {
    return (
      <div className="fade-up pt-8 text-center space-y-6">
        <ProgressRing value={accuracy} size={120} stroke={10} label={`${accuracy}%`} />
        <div>
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
            <Trophy size={22} className="text-gold" /> 练习完成
          </h1>
          <p className="text-dim mt-2">
            客观题 {objectiveTotal} 道，答对 {correctTotal} 道
            {practicedArr.some((p) => p) && '，并完成推理练习'}
          </p>
          <p className="text-xs text-dim mt-1">练习记录已写入对应知识点的掌握状态。</p>
        </div>
        <div className="space-y-3 max-w-xs mx-auto">
          <Button
            full
            onClick={() => {
              setCurrent(0)
              setAnswered([])
              setCorrectArr([])
              setPracticedArr([])
              setFinished(false)
            }}
          >
            <RotateCcw size={16} /> 再练一次
          </Button>
          <Button full variant="ghost" onClick={() => navigate('/modules')}>
            查看模块掌握概览
          </Button>
          <Button full variant="ghost" onClick={() => navigate('/quiz')}>
            返回测验
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-up space-y-4 pt-2 pb-24">
      <button onClick={() => navigate('/quiz')} className="tap flex items-center gap-1 text-dim text-sm">
        <ArrowLeft size={16} /> {MODE_TITLE[mode || ''] || '测验'}（进度不丢）
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full surface-2 overflow-hidden">
          <div
            className="h-full bg-lilac transition-all"
            style={{ width: `${((current + (done ? 1 : 0)) / list.length) * 100}%` }}
          />
        </div>
        <span className="text-sm text-dim">{current + 1}/{list.length}</span>
      </div>

      <QuestionCard key={q.id} q={q} index={current + 1} onResult={handleResult} />

      {done && (
        <Button full onClick={next}>
          {current + 1 < list.length ? '下一题' : '查看结果'} <CheckCircle2 size={18} />
        </Button>
      )}
    </div>
  )
}
