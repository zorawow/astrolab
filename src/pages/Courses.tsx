import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2, Circle, PlayCircle, Clock, BarChart3, ChevronRight,
  Layers, Filter, BookOpen,
} from 'lucide-react'
import { useStore } from '../lib/store'
import { COURSES, STAGES } from '../data/courses'
import { MODULES } from '../data/curriculum'
import { moduleStats, unitStatus, STATUS_LABEL, STATUS_COLOR } from '../lib/coverage'
import { getKnowledge } from '../data'
import { Card, Badge, Button, ProgressRing } from '../components/ui'

export default function Courses() {
  const navigate = useNavigate()
  const store = useStore()
  const [onlyUndone, setOnlyUndone] = useState(false)

  const stats = useMemo(
    () => MODULES.map((m) => moduleStats(m, store)),
    [store.knowledge, store.practiceByUnit],
  )
  const totalUnits = stats.reduce((n, s) => n + s.total, 0)
  const practicedUnits = stats.reduce((n, s) => n + s.practiced, 0)
  const weakUnits = stats.reduce((n, s) => n + s.weak, 0)

  return (
    <div className="fade-up space-y-6 pt-2 pb-24">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">系统课程</h1>
        <p className="text-dim text-sm mt-1">
          五阶段循序渐进 · 已完成 {store.completedCourses.length}/{COURSES.length} 节
          （其中 {COURSES.filter((c) => c.unitId).length} 节逐知识点深度课）
        </p>
      </header>

      {/* 模块覆盖概览 */}
      <Card onClick={() => navigate('/modules')} className="flex items-center gap-4 border-lilac/30">
        <ProgressRing
          value={totalUnits ? Math.round((practicedUnits / totalUnits) * 100) : 0}
          size={64}
          stroke={7}
        />
        <div className="flex-1 min-w-0">
          <div className="font-semibold flex items-center gap-1.5">
            <BarChart3 size={16} className="text-primary" /> 知识点练习覆盖
          </div>
          <div className="text-sm text-dim mt-0.5">
            {practicedUnits}/{totalUnits} 个知识点已练习 · {weakUnits} 个需加强
          </div>
          <div className="text-[11px] text-dim mt-1">完成课程不等于掌握，点开查看真实覆盖率</div>
        </div>
        <ChevronRight size={18} className="text-dim shrink-0" />
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-dim">
          <Filter size={14} /> 只看未完成
        </div>
        <button
          onClick={() => setOnlyUndone((v) => !v)}
          className={`tap relative w-11 h-6 rounded-full transition ${onlyUndone ? 'bg-lilac' : 'surface-2 border border-token'}`}
          aria-label="只看未完成"
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
              onlyUndone ? 'left-[22px]' : 'left-0.5'
            }`}
          />
        </button>
      </div>

      {STAGES.map((stage) => {
        const all = COURSES.filter((c) => c.stage === stage.id)
        const courses = onlyUndone ? all.filter((c) => !store.completedCourses.includes(c.id)) : all
        if (courses.length === 0) return null
        const done = all.filter((c) => store.completedCourses.includes(c.id)).length
        return (
          <section key={stage.id}>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-primary font-bold text-lg">{stage.id}</span>
              <h2 className="text-xl font-bold">{stage.title}</h2>
              <span className="text-xs text-dim ml-auto">{done}/{all.length} 已完成</span>
            </div>
            <p className="text-sm text-dim mb-3">{stage.desc}</p>
            <div className="space-y-2.5">
              {courses.map((c) => {
                const isDone = store.completedCourses.includes(c.id)
                const started = !isDone && (store.courseProgress[c.id] ?? 0) > 0
                const unit = c.unitId ? getKnowledge(c.unitId) : undefined
                const st = c.unitId
                  ? unitStatus(store.practiceByUnit?.[c.unitId], store.knowledge?.[c.unitId])
                  : undefined
                return (
                  <Card key={c.id} onClick={() => navigate(`/courses/${c.id}`)} className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center rounded-xl shrink-0 ${
                        isDone ? 'bg-lilac/20 text-primary' : 'surface-2 text-dim'
                      }`}
                      style={{ width: 42, height: 42 }}
                    >
                      {isDone ? <CheckCircle2 size={22} /> : started ? <PlayCircle size={22} /> : <Circle size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold truncate">{c.title}</span>
                        {c.unitId && <Badge color="gold">精讲</Badge>}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-dim mt-1">
                        <span className="flex items-center gap-1"><Clock size={12} /> {c.estMinutes} 分钟</span>
                        <span>· {c.exerciseIds.length + (c.microExerciseIds?.length ?? 0)} 道练习</span>
                        {unit && st && (
                          <Badge color={STATUS_COLOR[st]}>{unit.name} · {STATUS_LABEL[st]}</Badge>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-dim shrink-0" />
                  </Card>
                )
              })}
            </div>
          </section>
        )
      })}

      {onlyUndone && store.completedCourses.length === COURSES.length && (
        <Card className="text-center text-dim text-sm">
          <BookOpen size={20} className="mx-auto mb-2 text-primary" />
          所有课程都已完成，去
          <button onClick={() => navigate('/quiz')} className="text-primary underline underline-offset-2 mx-1">练习</button>
          巩固吧。
        </Card>
      )}

      <Card className="flex items-center gap-3 border-gold/25 bg-gold/5">
        <Layers size={18} className="text-accent shrink-0" />
        <div className="flex-1 text-xs text-dim leading-relaxed">
          每节「精讲」课对应一个知识单元，包含一句话理解 / 深入学习 / 实际应用三层、
          2 个以上生活例子、相似概念对比、常见误区与分步组合推理。
        </div>
        <Button variant="ghost" onClick={() => navigate('/modules')}>查看模块</Button>
      </Card>
    </div>
  )
}
