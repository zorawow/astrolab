import { useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Check, X, Lightbulb, Eye, CornerDownRight, BookOpen, ListOrdered,
  GitCompare, Sparkles, ShieldAlert, ArrowRight, Layers, GraduationCap,
} from 'lucide-react'
import type {
  Question, QuestionDirection, QuestionType, SingleQuestion, TrueFalseQuestion,
  MatchQuestion, ReasoningQuestion, GuidedQuestion,
} from '../types'
import { getKnowledge } from '../data'
import { Card, Button, Badge, Disclosure } from './ui'

// ===== 展示标签 =====

const TYPE_LABEL: Record<QuestionType, string> = {
  single: '单选',
  truefalse: '判断',
  match: '匹配',
  reasoning: '推理',
  guided: '引导推理',
}

const DIRECTION_LABEL: Record<QuestionDirection, string> = {
  forward: '宫位 → 含义',
  reverse: '含义 → 宫位',
  scenario: '情境 → 应用',
  definition: '定义辨析',
  geometry: '角度几何',
  contrast: '对比辨析',
  application: '综合应用',
}

const TF_OPTIONS = [
  { id: 'true', text: '正确' },
  { id: 'false', text: '错误' },
]

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

/** 正确答案的可读文本，答错时必须在反馈里明确给出 */
function correctText(q: Question): string {
  switch (q.type) {
    case 'single': {
      const o = q.options.find((x) => x.id === q.answer)
      return `${q.answer.toUpperCase()}. ${o?.text ?? q.answer}`
    }
    case 'truefalse':
      return q.answer ? '正确' : '错误'
    case 'match':
      return q.lefts.map((l, i) => `${l} → ${q.rights[q.correct[i]]}`).join('；')
    case 'reasoning':
      return '开放式推理 · 请对照下方示范解析'
    case 'guided':
      return '分步推理 · 请对照每一步的示范思路'
  }
}

function pickedText(q: Question, pickedId?: string): string {
  if (!pickedId) return '未作答'
  if (q.type === 'single') return q.options.find((o) => o.id === pickedId)?.text ?? pickedId
  if (q.type === 'truefalse') return pickedId === 'true' ? '正确' : '错误'
  return pickedId
}

function QuestionHeader({ q, index }: { q: Question; index?: number }) {
  const unit = q.unitId ? getKnowledge(q.unitId) : undefined
  return (
    <div className="flex flex-wrap items-center gap-2 mb-2.5">
      {index != null && <Badge color="muted">第 {index} 题</Badge>}
      <Badge color={q.type === 'guided' || q.type === 'reasoning' ? 'gold' : 'primary'}>
        {TYPE_LABEL[q.type]}
      </Badge>
      {q.direction && <Badge color="muted">{DIRECTION_LABEL[q.direction]}</Badge>}
      <span className="text-xs text-dim">{unit?.name ?? q.topic}</span>
    </div>
  )
}

/** 保证一道题只上报一次结果（组件重渲染不会重复写学习记录） */
function useReporter(onResult: (correct: boolean, practiced: boolean) => void) {
  const reported = useRef(false)
  const [answered, setAnswered] = useState(false)
  const report = (correct: boolean, practiced: boolean) => {
    if (!reported.current) {
      reported.current = true
      onResult(correct, practiced)
    }
    setAnswered(true)
  }
  return { answered, report }
}

// ===== 深度反馈：答对 / 答错都要讲清「为什么」 =====

function Section({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <div className="mt-3">
      <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1 flex items-center gap-1">
        {icon}{title}
      </div>
      <div className="text-sm leading-relaxed text-[var(--text)] space-y-1.5">{children}</div>
    </div>
  )
}

function Feedback({
  q, correct, pickedId, practiceOnly = false,
}: {
  q: Question
  correct: boolean
  pickedId?: string
  /** 开放式推理 / 引导题：不判对错，只做示范对照 */
  practiceOnly?: boolean
}) {
  const navigate = useNavigate()
  const a = q.analysis
  const why = a?.whyCorrect ?? q.explanation ?? '回到相关知识点卡片，再对照本题的推理过程复习一遍。'
  const unit = q.unitId ? getKnowledge(q.unitId) : undefined
  const core = unit?.teaching?.core
  const reviewIds = (a?.reviewIds ?? q.relatedIds).filter((id) => Boolean(getKnowledge(id)))
  const optionNotes = a?.optionNotes ?? {}
  const noteKeys = Object.keys(optionNotes)
  const pickedNote = pickedId ? optionNotes[pickedId] : undefined

  return (
    <div
      className={`mt-4 p-4 rounded-2xl border text-sm animate-[fadeUp_0.3s_ease-out] ${
        practiceOnly
          ? 'bg-gold/8 border-gold/30'
          : correct
            ? 'bg-lilac/12 border-lilac/40'
            : 'bg-red-500/8 border-red-400/40'
      }`}
    >
      <div
        className={`font-semibold flex items-center gap-1.5 ${
          practiceOnly ? 'text-accent' : correct ? 'text-primary' : 'text-red-400'
        }`}
      >
        {practiceOnly ? <BookOpen size={16} /> : correct ? <Check size={16} /> : <X size={16} />}
        {practiceOnly ? '对照示范解析' : correct ? '答对了！' : '再想一想'}
      </div>

      {/* 正确答案：答错时必须明确给出 */}
      <div className="mt-2.5 p-2.5 rounded-xl surface-2 border border-token">
        <span className="text-xs text-dim">正确答案　</span>
        <span className="font-medium">{correctText(q)}</span>
      </div>

      {!practiceOnly && !correct && (
        <Section title="你选择的为什么不合适" icon={<X size={12} />}>
          <p>你选择了「{pickedText(q, pickedId)}」。</p>
          <p className="text-dim">
            {pickedNote ??
              `它与正确答案「${correctText(q)}」的关键区别没有抓住。${q.commonError ? `常见误区：${q.commonError}。` : ''}回到下面的推理过程，按步骤重新走一遍。`}
          </p>
        </Section>
      )}

      <Section title="为什么成立" icon={<Check size={12} />}>
        <p>{why}</p>
      </Section>

      {/* 答对后强化关键知识 + 进阶理解 */}
      {correct && !practiceOnly && core && (
        <Section title="强化关键知识" icon={<Sparkles size={12} />}>
          <p className="text-dim">{core}</p>
        </Section>
      )}
      {correct && !practiceOnly && a?.extra && (
        <Section title="进阶理解" icon={<GraduationCap size={12} />}>
          <p className="text-dim">{a.extra}</p>
        </Section>
      )}

      {/* 推理过程 */}
      {a?.reasoningChain && a.reasoningChain.length > 0 && (
        <div className="mt-3">
          <Disclosure
            title="完整推理过程"
            subtitle="按步骤复现一次，比记住答案更重要"
            icon={<ListOrdered size={17} />}
            defaultOpen={!correct && !practiceOnly}
            tone="normal"
          >
            <ol className="space-y-2">
              {a.reasoningChain.map((s, i) => (
                <li key={i} className="flex gap-2.5 text-sm">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-lilac/20 text-primary text-[11px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="flex-1">{s}</span>
                </li>
              ))}
            </ol>
          </Disclosure>
        </div>
      )}

      {/* 错误选项之间的区别 */}
      {noteKeys.length > 0 && (q.type === 'single' || q.type === 'truefalse') && (
        <div className="mt-3">
          <Disclosure
            title="错误选项区别"
            subtitle="逐项看它们为什么不是答案"
            icon={<GitCompare size={17} />}
            defaultOpen={!correct}
            tone="normal"
          >
            <div className="space-y-2">
              {noteKeys.map((id) => {
                const label =
                  q.type === 'single'
                    ? `${id.toUpperCase()}. ${q.options.find((o) => o.id === id)?.text ?? id}`
                    : id === 'true' ? '正确' : '错误'
                return (
                  <div key={id} className="p-2.5 rounded-xl surface-2 text-sm">
                    <div className="font-medium text-dim">{label}</div>
                    <div className="mt-1">{optionNotes[id]}</div>
                  </div>
                )
              })}
            </div>
          </Disclosure>
        </div>
      )}

      {q.commonError && !practiceOnly && (
        <p className="mt-3 text-xs text-gold">⚠ 常见误区：{q.commonError}</p>
      )}

      {/* 应复习知识点：点击直达知识卡 */}
      {reviewIds.length > 0 && (
        <div className="mt-3">
          <div className="text-xs text-dim mb-1.5 flex items-center gap-1">
            <ArrowRight size={12} /> 建议复习这些知识点
          </div>
          <div className="flex flex-wrap gap-1.5">
            {reviewIds.slice(0, 6).map((id) => {
              const k = getKnowledge(id)!
              return (
                <button
                  key={id}
                  onClick={() => navigate(`/wiki/${id}`)}
                  className="tap surface-2 rounded-full px-2.5 py-1 text-xs border border-token flex items-center gap-1"
                >
                  <span className="text-primary">{k.symbol}</span>{k.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {(a?.notToInfer || q.type === 'guided') && (
        <p className="mt-3 pt-2.5 border-t border-token text-[11px] text-dim leading-relaxed flex items-start gap-1.5">
          <ShieldAlert size={13} className="shrink-0 mt-0.5" />
          <span>
            边界提醒：
            {q.type === 'guided'
              ? q.notToInfer
              : a?.notToInfer ??
                '占星解释属于传统象征体系，未被科学证实；本题只训练体系内的解释方法，不作为诊断或预测依据。'}
          </span>
        </p>
      )}
    </div>
  )
}

// ===== 单选 / 判断 =====

function ChoiceCard({
  q, header, onResult,
}: {
  q: SingleQuestion | TrueFalseQuestion
  header: ReactNode
  onResult: (correct: boolean, practiced: boolean) => void
}) {
  const { answered, report } = useReporter(onResult)
  const [picked, setPicked] = useState<string | null>(null)

  const options = q.type === 'single' ? q.options : TF_OPTIONS
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
              data-q-option={o.id}
              onClick={() => choose(o.id)}
              disabled={answered}
              className={`tap w-full text-left flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm border ${cls} ${
                answered ? 'cursor-default' : 'hover:brightness-110'
              }`}
            >
              <span>{o.text}</span>
              {answered && isCorrect && <Check size={18} className="text-primary shrink-0" />}
              {answered && isPicked && !isCorrect && <X size={18} className="text-red-400 shrink-0" />}
            </button>
          )
        })}
      </div>
      {answered && (
        <Feedback q={q} correct={picked === answerId} pickedId={picked ?? undefined} />
      )}
    </Card>
  )
}

// ===== 匹配题 =====

function MatchCard({
  q, header, onResult,
}: {
  q: MatchQuestion
  header: ReactNode
  onResult: (correct: boolean, practiced: boolean) => void
}) {
  const { answered, report } = useReporter(onResult)
  const rightsOrder = useMemo(
    () => shuffle(q.rights.map((_, i) => i), seedFrom(q.id)),
    [q.id, q.rights],
  )
  const [sel, setSel] = useState<number[]>(() => q.lefts.map(() => -1))
  const [feedback, setFeedback] = useState<boolean>(false)

  const check = () => {
    if (sel.includes(-1)) return
    const ok = sel.every((v, i) => v === q.correct[i])
    setFeedback(ok)
    report(ok, false)
  }

  return (
    <Card>
      {header}
      <p className="font-medium leading-relaxed">{q.prompt}</p>
      <p className="text-xs text-dim mt-1">{q.instruction}</p>
      <div className="space-y-2.5 mt-3">
        {q.lefts.map((left, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="flex-1 surface-2 rounded-lg px-3 py-2.5 text-sm font-medium">{left}</span>
            <span className="text-dim">→</span>
            <select
              className="flex-1 rounded-lg px-3 py-2.5 text-sm surface-2 outline-none border border-token"
              value={sel[i] === -1 ? '' : String(sel[i])}
              disabled={answered}
              onChange={(e) => {
                const v = Number(e.target.value)
                setSel((s) => s.map((x, j) => (j === i ? v : x)))
              }}
            >
              <option value="" disabled>选择…</option>
              {rightsOrder.map((ri) => (
                <option key={ri} value={ri}>{q.rights[ri]}</option>
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
        <Feedback q={q} correct={feedback} pickedId={sel.map((v, i) => `${q.lefts[i]}→${q.rights[v] ?? '未选'}`).join('；')} />
      )}
    </Card>
  )
}

// ===== 开放式推理题 =====

function ReasoningCard({
  q, header, onResult,
}: {
  q: ReasoningQuestion
  header: ReactNode
  onResult: (correct: boolean, practiced: boolean) => void
}) {
  const { answered, report } = useReporter(onResult)
  const [showHint, setShowHint] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  return (
    <Card>
      {header}
      <p className="font-medium leading-relaxed">{q.prompt}</p>
      <p className="text-xs text-dim mt-2">先自己组织一遍答案，再逐步展开提示与示范，不用急着「答对」。</p>
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
        {showAnswer && !answered && (
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
      {answered && <Feedback q={q} correct={false} practiceOnly />}
    </Card>
  )
}

// ===== 引导式推理题：逐步思考 → 提示 → 示范 → 下一步 =====

function GuidedCard({
  q, header, onResult,
}: {
  q: GuidedQuestion
  header: ReactNode
  onResult: (correct: boolean, practiced: boolean) => void
}) {
  const { answered, report } = useReporter(onResult)
  const [step, setStep] = useState(0)
  const [revealed, setRevealed] = useState<Record<number, 'hint' | 'answer'>>({})
  const cur = q.steps[Math.min(step, q.steps.length - 1)]
  const stage = revealed[step]
  const allDone = step >= q.steps.length

  const advance = () => {
    setStep((s) => s + 1)
  }

  return (
    <Card>
      {header}
      <p className="font-medium leading-relaxed">{q.prompt}</p>
      <div className="mt-3 flex items-center gap-2 text-xs text-dim">
        <Layers size={13} /> 共 {q.steps.length} 步 · 每一步先自己想，再展开对照
      </div>

      {/* 步骤进度 */}
      <div className="flex gap-1.5 mt-3">
        {q.steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              i < step ? 'bg-gold' : i === step ? 'bg-lilac' : 'surface-2'
            }`}
          />
        ))}
      </div>

      {!allDone ? (
        <div className="mt-4 p-4 rounded-2xl surface-2 border border-token">
          <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
            第 {step + 1} 步 / {q.steps.length}
          </div>
          <p className="text-sm leading-relaxed font-medium">{cur.prompt}</p>

          {stage === 'hint' && (
            <div className="mt-3 p-3 rounded-xl bg-gold/10 border border-gold/25 text-sm animate-[fadeUp_0.25s_ease-out]">
              <span className="text-accent font-medium flex items-center gap-1"><Lightbulb size={14} /> 提示</span>
              <p className="mt-1 text-dim">{cur.hint}</p>
            </div>
          )}
          {stage === 'answer' && (
            <div className="mt-3 p-3 rounded-xl bg-lilac/10 border border-lilac/30 text-sm animate-[fadeUp_0.25s_ease-out]">
              <span className="text-primary font-medium flex items-center gap-1"><Check size={14} /> 这一步的示范思路</span>
              <p className="mt-1">{cur.answer}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-4">
            {!stage && (
              <Button variant="ghost" onClick={() => setRevealed((r) => ({ ...r, [step]: 'hint' }))}>
                <Lightbulb size={15} /> 给点提示
              </Button>
            )}
            {stage === 'hint' && (
              <Button variant="ghost" onClick={() => setRevealed((r) => ({ ...r, [step]: 'answer' }))}>
                <Eye size={15} /> 查看示范思路
              </Button>
            )}
            {stage === 'answer' && (
              <Button variant="gold" onClick={advance}>
                {step + 1 < q.steps.length ? '进入下一步' : '查看完整推理'} <ArrowRight size={16} />
              </Button>
            )}
            {!stage && (
              <Button variant="ghost" onClick={() => setRevealed((r) => ({ ...r, [step]: 'answer' }))}>
                我已经想好了，直接对照
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="p-4 rounded-2xl surface-2 border border-token">
            <div className="font-semibold text-primary flex items-center gap-1.5 mb-3">
              <ListOrdered size={16} /> 完整推理链
            </div>
            <ol className="space-y-2.5">
              {q.steps.map((s, i) => (
                <li key={i} className="flex gap-2.5 text-sm">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-lilac/20 text-primary text-[11px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="flex-1">
                    <span className="text-dim">{s.prompt}</span>
                    <span className="block mt-0.5">{s.answer}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          {!answered && (
            <Button full onClick={() => report(false, true)}>
              完成推理，记录练习 <CornerDownRight size={16} />
            </Button>
          )}
        </div>
      )}

      {answered && <Feedback q={q} correct={false} practiceOnly />}
    </Card>
  )
}

// ===== 入口：按题型分发，避免条件式 Hook =====

export function QuestionCard({
  q, index, onResult,
}: {
  q: Question
  index?: number
  onResult: (correct: boolean, practiced: boolean) => void
}) {
  const header = <QuestionHeader q={q} index={index} />
  switch (q.type) {
    case 'single':
    case 'truefalse':
      return <ChoiceCard q={q} header={header} onResult={onResult} />
    case 'match':
      return <MatchCard q={q} header={header} onResult={onResult} />
    case 'reasoning':
      return <ReasoningCard q={q} header={header} onResult={onResult} />
    case 'guided':
      return <GuidedCard q={q} header={header} onResult={onResult} />
  }
}
