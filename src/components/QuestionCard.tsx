import { useMemo, useRef, useState } from 'react'
import { Check, X, Lightbulb, Eye, CornerDownRight } from 'lucide-react'
import type { Question } from '../types'
import { Card, Button, Badge } from './ui'

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr]
  let s = seed
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280
    const j = Math.floor((s / 233280) * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function seedFrom(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 233280
  return h + 1
}

export function QuestionCard({
  q,
  index,
  onResult,
}: {
  q: Question
  index?: number
  onResult: (correct: boolean, practiced: boolean) => void
}) {
  const [answered, setAnswered] = useState(false)
  const reported = useRef(false)
  const report = (correct: boolean, practiced: boolean) => {
    if (!reported.current) {
      reported.current = true
      onResult(correct, practiced)
    }
    setAnswered(true)
  }

  const header = (
    <div className="flex items-center gap-2 mb-2">
      {index != null && <Badge color="muted">第 {index} 题</Badge>}
      <Badge color={q.type === 'reasoning' ? 'gold' : 'primary'}>
        {q.type === 'single' ? '单选' : q.type === 'truefalse' ? '判断' : q.type === 'match' ? '匹配' : '推理'}
      </Badge>
      <span className="text-xs text-dim">{q.topic}</span>
    </div>
  )

  // ===== 推理题 =====
  if (q.type === 'reasoning') {
    const [showHint, setShowHint] = useState(false)
    const [showAnswer, setShowAnswer] = useState(false)
    return (
      <Card>
        {header}
        <p className="font-medium leading-relaxed">{q.prompt}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {!showHint && (
            <Button variant="ghost" onClick={() => setShowHint(true)}>
              <Lightbulb size={16} /> 给点提示
            </Button>
          )}
          {showHint && !showAnswer && (
            <Button variant="ghost" onClick={() => setShowAnswer(true)}>
              <Eye size={16} /> 查看示范解析
            </Button>
          )}
          {showAnswer && (
            <Button variant="gold" onClick={() => report(false, true)}>
              我思考好了，记录练习 <CornerDownRight size={16} />
            </Button>
          )}
        </div>
        {showHint && (
          <div className="mt-3 p-3 rounded-xl bg-gold/10 border border-gold/30 text-sm">
            <span className="text-accent font-medium flex items-center gap-1">
              <Lightbulb size={14} /> 提示
            </span>
            <p className="mt-1 text-dim">{q.hint}</p>
          </div>
        )}
        {showAnswer && (
          <div className="mt-3 p-3 rounded-xl surface-2 text-sm">
            <span className="text-primary font-medium">示范解析</span>
            <p className="mt-1 text-dim leading-relaxed">{q.sampleAnswer}</p>
          </div>
        )}
      </Card>
    )
  }

  // ===== 匹配题 =====
  if (q.type === 'match') {
    const rightsOrder = useMemo(
      () => shuffle(q.rights.map((_, i) => i), seedFrom(q.id)),
      [q.id, q.rights],
    )
    const [sel, setSel] = useState<number[]>(() => q.lefts.map(() => -1))
    const [feedback, setFeedback] = useState<null | boolean>(null)

    const check = () => {
      if (sel.includes(-1)) return
      const ok = sel.every((v, i) => v === q.correct[i])
      setFeedback(ok)
      report(ok, false)
    }

    return (
      <Card>
        {header}
        <p className="font-medium">{q.prompt}</p>
        <p className="text-xs text-dim mt-1">{q.instruction}</p>
        <div className="space-y-2.5 mt-3">
          {q.lefts.map((left, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="flex-1 surface-2 rounded-lg px-3 py-2.5 text-sm font-medium">
                {left}
              </span>
              <span className="text-dim">→</span>
              <select
                className="flex-1 rounded-lg px-3 py-2.5 text-sm surface-2 outline-none border border-token"
                value={sel[i] === -1 ? '' : String(sel[i])}
                disabled={answered}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  setSel((s) => s.map((x, j) => (j === i ? v : x)))
                  setFeedback(null)
                }}
              >
                <option value="" disabled>
                  选择…
                </option>
                {rightsOrder.map((ri) => (
                  <option key={ri} value={ri}>
                    {q.rights[ri]}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        {!answered ? (
          <Button full className="mt-4" onClick={check} disabled={sel.includes(-1)}>
            检查答案
          </Button>
        ) : (
          <FeedbackBlock correct={feedback ?? false} explanation={q.explanation} commonError={q.commonError} />
        )}
      </Card>
    )
  }

  // ===== 单选 / 判断 =====
  const [picked, setPicked] = useState<string | null>(null)

  const options =
    q.type === 'single'
      ? q.options
      : [
          { id: 'true', text: '正确' },
          { id: 'false', text: '错误' },
        ]
  const answerId = q.type === 'single' ? q.answer : q.answer ? 'true' : 'false'

  const choose = (id: string) => {
    if (answered) return
    setPicked(id)
    report(id === answerId, false)
  }

  return (
    <Card>
      {header}
      <p className="font-medium leading-relaxed">{q.prompt}</p>
      <div className="space-y-2.5 mt-4">
        {options.map((o) => {
          const isPicked = picked === o.id
          const isCorrect = o.id === answerId
          let cls = 'surface-2 border-token'
          if (answered) {
            if (isCorrect) cls = 'bg-lilac/25 border-lilac text-primary'
            else if (isPicked) cls = 'bg-red-500/20 border-red-400/50'
            else cls = 'surface-2 border-token opacity-70'
          }
          return (
            <button
              key={o.id}
              onClick={() => choose(o.id)}
              disabled={answered}
              className={`tap w-full text-left flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm border ${cls} ${
                answered ? 'cursor-default' : 'hover:brightness-110'
              }`}
            >
              <span>{o.text}</span>
              {answered && isCorrect && <Check size={18} className="text-primary" />}
              {answered && isPicked && !isCorrect && <X size={18} className="text-red-400" />}
            </button>
          )
        })}
      </div>
      {answered && (
        <FeedbackBlock
          correct={picked === answerId}
          explanation={q.explanation}
          commonError={q.commonError}
        />
      )}
    </Card>
  )
}

function FeedbackBlock({
  correct,
  explanation,
  commonError,
}: {
  correct: boolean
  explanation?: string
  commonError?: string
}) {
  return (
    <div
      className={`mt-4 p-3 rounded-xl border text-sm animate-[fadeUp_0.3s_ease-out] ${
        correct ? 'bg-lilac/15 border-lilac/40' : 'bg-red-500/10 border-red-400/40'
      }`}
    >
      <div className={`font-semibold flex items-center gap-1 ${correct ? 'text-primary' : 'text-red-400'}`}>
        {correct ? <Check size={16} /> : <X size={16} />}
        {correct ? '答对了！' : '再想一想'}
      </div>
      <p className="mt-1.5 text-dim leading-relaxed">
        {explanation ?? '对照相关知识点卡片，可巩固这一对应关系。'}
      </p>
      {!correct && commonError && (
        <p className="mt-2 text-xs text-gold">常见误区：{commonError}</p>
      )}
    </div>
  )
}
