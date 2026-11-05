import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Trophy, RotateCcw, CheckCircle2, ListChecks,
  ShieldCheck, AlertTriangle, ChevronRight, BookOpen,
} from 'lucide-react'
import { useStore } from '../lib/store'
import { MODULES_BY_ID, coveredUnits } from '../data/curriculum'
import { getQuestion, QUESTIONS_BY_ID } from '../data/questions'
import { QuestionCard } from '../components/QuestionCard'
import { Card, Button, Badge, ProgressRing } from '../components/ui'
import { getKnowledge } from '../data'
import { moduleStats, STATUS_LABEL } from '../lib/coverage'

export default function ChallengeRunner() {
  const { moduleId = 'houses' } = useParams()
  const navigate = useNavigate()
  const store = useStore()
  const module = MODULES_BY_ID[moduleId]
  const state = store.challenge?.[moduleId]
  // 答完一题后先锁定当前题，让深度解析完整可见；点「下一题」才切到新题
  const [awaitingNext, setAwaitingNext] = useState<string | null>(null)

  // 首次进入创建挑战；已有未完成进度则直接恢复，不重置
  useEffect(() => {
    if (!module) return
    const cur = store.challenge?.[moduleId]
    if (!cur || cur.queue.length === 0) store.startChallenge(moduleId)
  }, [moduleId])

  if (!module) {
    return (
      <div className="fade-up pt-10 text-center space-y-4">
        <p className="text-dim">找不到这个模块。</p>
        <Button variant="ghost" onClick={() => navigate('/quiz')}>返回测验</Button>
      </div>
    )
  }

  if (!state) {
    return (
      <div className="fade-up pt-10 text-center space-y-4">
        <p className="text-dim">正在为你编排覆盖全部知识点的题目…</p>
        <Button variant="ghost" onClick={() => navigate('/quiz')}>返回测验</Button>
      </div>
    )
  }

  const covered = coveredUnits(
    moduleId,
    state.queue.filter((id) => Boolean(state.results[id])),
  )
  const answeredCount = Object.keys(state.results).length
  const correctCount = Object.values(state.results).filter((r) => r.correct).length
  const accuracy = answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0
  const stats = moduleStats(module, store)

  const restart = () => {
    store.resetChallenge(moduleId)
    store.startChallenge(moduleId)
    setAwaitingNext(null)
  }

  // ===== 完成页（最后一题答完时先让解析看完，再进入结果）=====
  if (state.completed && !awaitingNext) {
    const weak = stats.units.filter((u) => u.status === 'weak')
    return (
      <div className="fade-up space-y-5 pt-4 pb-24">
        <div className="text-center space-y-3">
          <Trophy size={44} className="text-gold mx-auto" />
          <h1 className="text-2xl font-bold">完整掌握挑战完成</h1>
          <p className="text-dim text-sm">{module.title} · 全部知识点均已覆盖作答</p>
          <ProgressRing value={100} size={110} stroke={9} label="100%" />
        </div>

        <Card>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xl font-bold">{answeredCount}</div>
              <div className="text-xs text-dim">完成题目</div>
            </div>
            <div>
              <div className="text-xl font-bold text-primary">{covered.size}/{module.units.length}</div>
              <div className="text-xs text-dim">知识点覆盖</div>
            </div>
            <div>
              <div className="text-xl font-bold text-accent">{accuracy}%</div>
              <div className="text-xs text-dim">本次正确率</div>
            </div>
          </div>
        </Card>

        <Card className="border-lilac/30 bg-lilac/5">
          <div className="flex gap-2 text-sm">
            <ShieldCheck size={17} className="text-primary shrink-0 mt-0.5" />
            <span>
              挑战只有在「队列全部作答」且「每个知识点至少有一道以它为主单元的题被作答」时才会判定完成。
              中途退出不会丢失进度。
            </span>
          </div>
        </Card>

        {weak.length > 0 && (
          <div>
            <div className="font-bold mb-2 flex items-center gap-1.5">
              <AlertTriangle size={16} className="text-red-400" /> 仍需加强（{weak.length}）
            </div>
            <div className="flex flex-wrap gap-1.5">
              {weak.map((u) => (
                <button
                  key={u.id}
                  onClick={() => navigate(`/wiki/${u.id}`)}
                  className="tap surface-2 rounded-full px-3 py-1.5 text-xs border border-token"
                >
                  {getKnowledge(u.id)?.symbol} {u.name} · {STATUS_LABEL[u.status]}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2.5 max-w-sm mx-auto">
          <Button full variant="ghost" onClick={restart}>
            <RotateCcw size={16} /> 重新挑战（按最新掌握情况重排）
          </Button>
          <Button full onClick={() => navigate(`/modules/${moduleId}`)}>
            查看模块掌握概览 <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    )
  }

  // ===== 队列异常兜底 =====
  const displayQid = awaitingNext ?? state.queue[state.index]
  const q = displayQid ? getQuestion(displayQid) : undefined
  if (!q) {
    return (
      <div className="fade-up pt-10 text-center space-y-4">
        <p className="text-dim">题目队列暂不可用，重新开始一次即可。</p>
        <Button onClick={restart}><RotateCcw size={16} /> 重新编排</Button>
        <Button variant="ghost" onClick={() => navigate('/quiz')}>返回测验</Button>
      </div>
    )
  }

  const isAnswered = awaitingNext === displayQid
  const handleResult = (correct: boolean, practiced: boolean) => {
    if (state.results[q.id]) return
    const qq = QUESTIONS_BY_ID[q.id]
    store.recordQuiz(q.id, q.type, correct, practiced, qq?.relatedIds ?? q.relatedIds)
    store.recordChallengeAnswer(moduleId, q.id, correct || practiced)
    setAwaitingNext(q.id)
  }

  return (
    <div className="fade-up space-y-4 pt-2 pb-24">
      <button onClick={() => navigate('/quiz')} className="tap flex items-center gap-1 text-dim text-sm">
        <ArrowLeft size={16} /> 退出（进度已自动保存）
      </button>

      <header>
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-gold" />
          <h1 className="text-xl font-bold">{module.title} · 完整掌握挑战</h1>
        </div>
        <p className="text-xs text-dim mt-1.5 leading-relaxed">
          未练知识点优先 → 按方向轮转覆盖全部知识点 → 对比辨析题 → 综合应用题。
          关掉页面也会从当前题继续。
        </p>
      </header>

      {/* 双进度：题目进度 + 知识点覆盖 */}
      <Card className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-dim flex items-center gap-1"><ListChecks size={13} /> 题目进度</span>
            <span className="font-semibold">{answeredCount} / {state.queue.length}</span>
          </div>
          <div className="h-2 rounded-full surface-2 overflow-hidden">
            <div
              className="h-full bg-lilac transition-all"
              style={{ width: `${state.queue.length ? (answeredCount / state.queue.length) * 100 : 0}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-dim flex items-center gap-1"><BookOpen size={13} /> 知识点覆盖</span>
            <span className="font-semibold text-primary">{covered.size} / {module.units.length}</span>
          </div>
          <div className="h-2 rounded-full surface-2 overflow-hidden">
            <div
              className="h-full bg-gold transition-all"
              style={{ width: `${(covered.size / module.units.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          <Badge color="gold">第 {state.index + 1} 题</Badge>
          {q.direction && <Badge color="muted">方向：{q.direction}</Badge>}
          {isAnswered && <Badge color="primary">已记录，点下方继续</Badge>}
        </div>
      </Card>

      <QuestionCard
        key={q.id}
        q={q}
        index={Math.max(1, state.queue.indexOf(displayQid) + 1)}
        onResult={handleResult}
      />

      {isAnswered && (
        <Button
          full
          onClick={() => {
            // recordChallengeAnswer 已推进 index；清掉锁定即可切到下一题
            setAwaitingNext(null)
          }}
        >
          {state.index < state.queue.length ? '下一题' : '查看挑战结果'} <CheckCircle2 size={18} />
        </Button>
      )}

      <div className="text-center">
        <button onClick={restart} className="tap text-xs text-dim underline underline-offset-2">
          重新编排题目
        </button>
      </div>
    </div>
  )
}
