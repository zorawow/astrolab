import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Target, HelpCircle, AlertTriangle, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react'
import { useStore } from '../lib/store'
import { COURSES, COURSES_BY_ID } from '../data/courses'
import { getQuestion } from '../data/questions'
import type { Question } from '../types'
import { QuestionCard } from '../components/QuestionCard'
import { Card, Button } from '../components/ui'

export default function Lesson() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const store = useStore()
  const course = courseId ? COURSES_BY_ID[courseId] : undefined

  const [answered, setAnswered] = useState(0)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (course && !store.completedCourses.includes(course.id)) {
      store.setCourseProgress(course.id, Math.max(0.1, store.courseProgress[course.id] ?? 0))
    }
  }, [course])

  if (!course) {
    navigate('/courses')
    return null
  }

  const questions = course.exerciseIds
    .map((id) => getQuestion(id))
    .filter((q): q is NonNullable<typeof q> => Boolean(q))

  const total = questions.length
  const done = answered >= total && total > 0

  const handleResult = (q: Question, correct: boolean, practiced: boolean) => {
    store.recordQuiz(q.id, q.type, correct, practiced, q.relatedIds)
    setAnswered((n) => n + 1)
  }

  const finish = () => {
    store.completeCourse(course.id, course.relatedKnowledgeIds)
    setSaved(true)
  }

  const nextCourse = COURSES.find(
    (c) => c.order !== course.order && !store.completedCourses.includes(c.id) && COURSES.indexOf(c) > COURSES.indexOf(course),
  )

  if (saved) {
    return (
      <div className="fade-up pt-10 text-center space-y-5">
        <div className="text-5xl">🎉</div>
        <h1 className="text-2xl font-bold">本课完成！</h1>
        <p className="text-dim">已保存学习进度，并为你安排了相关知识点的复习。</p>
        <div className="space-y-3 max-w-xs mx-auto">
          {nextCourse && (
            <Button full onClick={() => navigate(`/courses/${nextCourse.id}`)}>
              继续下一课：{nextCourse.title} <ChevronRight size={18} />
            </Button>
          )}
          <Button full variant="ghost" onClick={() => navigate('/courses')}>
            返回课程列表
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-up space-y-5 pt-2 pb-24">
      <button
        onClick={() => navigate('/courses')}
        className="tap flex items-center gap-1 text-dim text-sm"
      >
        <ArrowLeft size={16} /> 课程
      </button>

      <header>
        <div className="text-xs text-primary font-semibold uppercase tracking-widest">
          第 {course.stage} 阶段 · 第 {course.order} 课
        </div>
        <h1 className="text-2xl font-bold mt-1">{course.title}</h1>
        <div className="flex items-center gap-2 text-sm text-dim mt-2">
          <Sparkles size={14} /> 约 {course.estMinutes} 分钟
        </div>
      </header>

      {/* 学习目标 */}
      <Card>
        <div className="flex items-center gap-2 text-primary font-medium mb-2">
          <Target size={16} /> 本课目标
        </div>
        <ul className="space-y-1.5 text-sm">
          {course.objectives.map((o, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-gold">·</span>
              <span>{o}</span>
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

      {/* 知识讲解 */}
      {course.sections.map((s, i) => (
        <Card key={i}>
          <h2 className="text-lg font-bold mb-2">{s.heading}</h2>
          <p className="text-sm leading-relaxed text-[var(--text)]">{s.body}</p>
          {s.connection && (
            <div className="mt-3 p-3 rounded-xl surface-2 text-sm">
              <span className="text-primary font-medium">🔗 联系 </span>
              <span className="text-dim">{s.connection}</span>
            </div>
          )}
          {s.misconception && (
            <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-400/30 text-sm">
              <span className="text-red-400 font-medium flex items-center gap-1">
                <AlertTriangle size={14} /> 常见误区
              </span>
              <p className="mt-1 text-dim">{s.misconception}</p>
            </div>
          )}
        </Card>
      ))}

      {/* 总结 */}
      <Card className="border-gold/30">
        <div className="flex items-center gap-2 text-accent font-medium mb-2">
          <CheckCircle2 size={16} /> 本课总结
        </div>
        <p className="text-sm leading-relaxed">{course.summary}</p>
      </Card>

      {/* 互动练习 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">互动练习</h2>
          <span className="text-sm text-dim">
            {answered}/{total}
          </span>
        </div>
        <div className="space-y-4">
          {questions.map((q, i) => (
            <QuestionCard key={q.id} q={q} index={i + 1} onResult={(c, p) => handleResult(q, c, p)} />
          ))}
        </div>
      </div>

      {/* 完成 */}
      {done && (
        <Card className="text-center space-y-3">
          <CheckCircle2 size={32} className="text-primary mx-auto" />
          <p className="font-semibold">练习完成，保存本课进度？</p>
          <Button full onClick={finish}>
            完成本课并保存进度
          </Button>
        </Card>
      )}
    </div>
  )
}
