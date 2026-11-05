import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Target, HelpCircle, AlertTriangle, Sparkles, CheckCircle2,
  ChevronRight, BookOpen, Zap, Trophy, BarChart3, Lightbulb,
} from 'lucide-react'
import { useStore } from '../lib/store'
import { COURSES, COURSES_BY_ID } from '../data/courses'
import { getQuestion, QUESTIONS } from '../data/questions'
import { getKnowledge } from '../data'
import { courseForUnit, MODULES } from '../data/curriculum'
import { unitStatus, STATUS_LABEL, STATUS_COLOR } from '../lib/coverage'
import type { Question } from '../types'
import { QuestionCard } from '../components/QuestionCard'
import { TeachingView } from '../components/TeachingView'
import { Card, Button, Badge, Disclosure } from '../components/ui'

/** 随堂小题：逐单元课程用预设 microExerciseIds；旧专题课自动挑 2 道不同题型的关联题 */
function microQuestions(courseId: string): Question[] {
  const course = COURSES_BY_ID[courseId]
  if (!course) return []
  if (course.microExerciseIds?.length) {
    return course.microExerciseIds
      .map((id) => getQuestion(id))
      .filter((q): q is Question => Boolean(q))
  }
  const ids = new Set(course.relatedKnowledgeIds)
  const pool = QUESTIONS.filter(
    (q) =>
      !course.exerciseIds.includes(q.id) &&
      (q.relatedIds.some((r) => ids.has(r)) || (q.unitId && ids.has(q.unitId))),
  )
  const picked: Question[] = []
  const used = new Set<string>()
  for (const q of pool) {
    if (used.has(q.type)) continue
    picked.push(q)
    used.add(q.type)
    if (picked.length >= 2) break
  }
  for (const q of pool) {
    if (picked.length >= 2) break
    if (!picked.some((p) => p.id === q.id)) picked.push(q)
  }
  return picked
}

export default function Lesson() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const store = useStore()
  const course = courseId ? COURSES_BY_ID[courseId] : undefined

  const [microDone, setMicroDone] = useState<Record<string, boolean>>({})
  const [postDone, setPostDone] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (course && !store.completedCourses.includes(course.id)) {
      store.setCourseProgress(course.id, Math.max(0.1, store.courseProgress[course.id] ?? 0))
    }
  }, [course])

  const postQuestions = useMemo(
    () => (course?.exerciseIds ?? [])
      .map((id) => getQuestion(id))
      .filter((q): q is Question => Boolean(q)),
    [course?.id],
  )
  const micro = useMemo(() => (courseId ? microQuestions(courseId) : []), [courseId])

  if (!course) {
    navigate('/courses')
    return null
  }

  const total = postQuestions.length
  const postAnswered = postQuestions.filter((q) => postDone[q.id]).length
  const microAnswered = micro.filter((q) => microDone[q.id]).length
  const done = total === 0 || postAnswered === total

  const handleResult = (q: Question, correct: boolean, practiced: boolean, kind: 'micro' | 'post') => {
    store.recordQuiz(q.id, q.type, correct, practiced, q.relatedIds)
    const setter = kind === 'micro' ? setMicroDone : setPostDone
    setter((s) => ({ ...s, [q.id]: true }))
  }

  const finish = () => {
    store.completeCourse(course.id, course.relatedKnowledgeIds)
    setSaved(true)
  }

  const nextCourse = COURSES.find(
    (c) => c.order !== course.order && !store.completedCourses.includes(c.id) && COURSES.indexOf(c) > COURSES.indexOf(course),
  )

  const unitId = course.unitId
  const unitK = unitId ? getKnowledge(unitId) : undefined
  const unitStat = unitId ? unitStatus(store.practiceByUnit?.[unitId], store.knowledge?.[unitId]) : undefined
  const moduleOfUnit = unitId ? MODULES.find((m) => m.units.includes(unitId)) : undefined

  if (saved) {
    return (
      <div className="fade-up pt-10 text-center space-y-5">
        <div className="text-5xl">🎉</div>
        <h1 className="text-2xl font-bold">本课完成！</h1>
        <p className="text-dim text-sm">
          已保存学习进度。完成课程记为「已学习」，仍需通过练习才能进入「基本掌握 / 熟练掌握」。
        </p>
        <div className="space-y-3 max-w-xs mx-auto">
          {unitId && (
            <Button full variant="gold" onClick={() => navigate(`/quiz/unit?unit=${unitId}`)}>
              <Zap size={16} /> 立刻练这个知识点
            </Button>
          )}
          {moduleOfUnit && (
            <Button full variant="ghost" onClick={() => navigate(`/quiz/challenge/${moduleOfUnit.id}`)}>
              <Trophy size={16} /> 挑战整个模块
            </Button>
          )}
          {nextCourse && (
            <Button full onClick={() => navigate(`/courses/${nextCourse.id}`)}>
              继续下一课 <ChevronRight size={18} />
            </Button>
          )}
          <Button full variant="ghost" onClick={() => navigate('/courses')}>
            返回课程列表
          </Button>
        </div>
      </div>
    )
  }

  const microAt = (i: number) =>
    micro[i] ? (
      <div key={`micro-${micro[i].id}`} className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-accent">
          <Lightbulb size={15} /> 随堂小题 {i + 1} · 学完立刻用一次
        </div>
        <QuestionCard
          q={micro[i]}
          onResult={(c, p) => handleResult(micro[i], c, p, 'micro')}
        />
      </div>
    ) : null

  return (
    <div className="fade-up space-y-5 pt-2 pb-24">
      <button onClick={() => navigate('/courses')} className="tap flex items-center gap-1 text-dim text-sm">
        <ArrowLeft size={16} /> 课程
      </button>

      <header>
        <div className="text-xs text-primary font-semibold uppercase tracking-widest">
          第 {course.stage} 阶段 · 第 {course.order} 课
        </div>
        <h1 className="text-2xl font-bold mt-1">{course.title}</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-dim mt-2">
          <span className="flex items-center gap-1"><Sparkles size={14} /> 约 {course.estMinutes} 分钟</span>
          {unitK && <Badge color="muted">{unitK.symbol} {unitK.name}</Badge>}
          {unitStat && <Badge color={STATUS_COLOR[unitStat]}>{STATUS_LABEL[unitStat]}</Badge>}
        </div>
      </header>

      {/* 本课目标 */}
      <Card>
        <div className="flex items-center gap-2 text-primary font-medium mb-2">
          <Target size={16} /> 本课目标
        </div>
        <ul className="space-y-1.5 text-sm">
          {course.objectives.map((o, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-gold">·</span><span>{o}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* 引发思考 */}
      <div className="p-4 rounded-2xl bg-gold/10 border border-gold/30">
        <div className="flex items-center gap-2 text-accent font-medium mb-1">
          <HelpCircle size={16} /> 先想一想
        </div>
        <p className="text-sm">{course.hook}</p>
      </div>

      {/* ===== 统一深度教学：三层可展开讲解 ===== */}
      {unitId && <TeachingView unitId={unitId} />}

      {/* 旧专题课：把涉及的知识点分层精讲折叠进来，保证所有课程都能深入 */}
      {!unitId && (
        <Disclosure
          title="本课知识点 · 分层精讲"
          subtitle="简单理解 / 深入学习 / 实际应用，逐层展开"
          icon={<BookOpen size={18} />}
          tone="primary"
        >
          <div className="space-y-3">
            {course.relatedKnowledgeIds.filter((id) => Boolean(getKnowledge(id))).slice(0, 4).map((id) => {
              const k = getKnowledge(id)!
              const c = courseForUnit(id)
              return (
                <Disclosure key={id} title={`${k.symbol} ${k.name}`} subtitle={k.summary.slice(0, 42) + '…'}>
                  <TeachingView unitId={id} />
                  {c && (
                    <Button variant="ghost" onClick={() => navigate(`/courses/${c.id}`)}>
                      打开「{c.title}」完整课 <ChevronRight size={15} />
                    </Button>
                  )}
                </Disclosure>
              )
            })}
          </div>
        </Disclosure>
      )}

      {/* 知识讲解（旧课简版；逐单元课保留作为「课程笔记」，与三层精讲互补） */}
      <Disclosure
        title={unitId ? '课程笔记（按学习顺序梳理）' : '课程讲解'}
        subtitle="目标 → 为什么 → 例子 → 易混淆 → 自己判断 → 记忆"
        icon={<BookOpen size={18} />}
        defaultOpen={!unitId}
      >
        <div className="space-y-4">
          {course.sections.map((s, i) => (
            <div key={i}>
              <h2 className="font-bold mb-2 text-base">{s.heading}</h2>
              <p className="text-sm leading-relaxed whitespace-pre-line">{s.body}</p>
              {s.connection && (
                <div className="mt-2 p-3 rounded-xl surface-2 text-sm">
                  <span className="text-primary font-medium">🔗 联系 </span>
                  <span className="text-dim">{s.connection}</span>
                </div>
              )}
              {s.misconception && (
                <div className="mt-2 p-3 rounded-xl bg-red-500/10 border border-red-400/30 text-sm">
                  <span className="text-red-400 font-medium flex items-center gap-1">
                    <AlertTriangle size={14} /> 常见误区
                  </span>
                  <p className="mt-1 text-dim whitespace-pre-line">{s.misconception}</p>
                </div>
              )}
              {i === 1 && microAt(0)}
              {i === course.sections.length - 2 && microAt(1)}
            </div>
          ))}
          {/* sections 不足 2 节时把随堂小题补在末尾 */}
          {course.sections.length < 2 && microAt(0)}
          {course.sections.length < 3 && microAt(1)}
        </div>
      </Disclosure>

      {/* 总结 */}
      <Card className="border-gold/30">
        <div className="flex items-center gap-2 text-accent font-medium mb-2">
          <CheckCircle2 size={16} /> 本课总结
        </div>
        <p className="text-sm leading-relaxed">{course.summary}</p>
      </Card>

      {/* 课后练习 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">课后练习</h2>
          <span className="text-sm text-dim">{postAnswered}/{total}</span>
        </div>
        {postQuestions.length === 0 ? (
          <Card className="text-sm text-dim">
            本课的练习已融入随堂小题。想继续巩固，可到
            <button onClick={() => navigate('/quiz/quick')} className="text-primary underline underline-offset-2 mx-1">快速练习</button>
            或完整掌握挑战。
          </Card>
        ) : (
          <div className="space-y-4">
            {postQuestions.map((q, i) => (
              <QuestionCard
                key={q.id}
                q={q}
                index={i + 1}
                onResult={(c, p) => handleResult(q, c, p, 'post')}
              />
            ))}
          </div>
        )}
        <div className="mt-3 flex items-center gap-2 text-xs text-dim">
          <BarChart3 size={13} />
          随堂小题 {microAnswered}/{micro.length} · 课后练习 {postAnswered}/{total} · 每次作答都会写回知识点掌握状态
        </div>
      </div>

      {/* 完成 */}
      {done && (
        <Card className="text-center space-y-3 border-lilac/30">
          <CheckCircle2 size={32} className="text-primary mx-auto" />
          <p className="font-semibold">练习完成，保存本课进度？</p>
          <p className="text-xs text-dim">
            注意：完成课程只记为「已学习」，掌握状态由上面的真实练习记录决定。
          </p>
          <Button full onClick={finish}>完成本课并保存进度</Button>
        </Card>
      )}
    </div>
  )
}
