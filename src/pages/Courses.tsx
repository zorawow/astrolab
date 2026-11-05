import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Circle, PlayCircle, Clock } from 'lucide-react'
import { useStore } from '../lib/store'
import { COURSES, STAGES } from '../data/courses'
import { Card, Badge } from '../components/ui'

export default function Courses() {
  const navigate = useNavigate()
  const store = useStore()

  return (
    <div className="fade-up space-y-6 pt-2">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">系统课程</h1>
        <p className="text-dim text-sm mt-1">
          五阶段循序渐进，从十二星座到星盘基础。已完成 {store.completedCourses.length}/{COURSES.length} 节。
        </p>
      </header>

      {STAGES.map((stage) => {
        const courses = COURSES.filter((c) => c.stage === stage.id)
        return (
          <section key={stage.id}>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-primary font-bold text-lg">{stage.id}</span>
              <h2 className="text-xl font-bold">{stage.title}</h2>
            </div>
            <p className="text-sm text-dim mb-3 -mt-1">{stage.desc}</p>
            <div className="space-y-3">
              {courses.map((c, i) => {
                const done = store.completedCourses.includes(c.id)
                const started = !done && (store.courseProgress[c.id] ?? 0) > 0
                return (
                  <Card
                    key={c.id}
                    onClick={() => navigate(`/courses/${c.id}`)}
                    className="flex items-center gap-4"
                  >
                    <div
                      className={`flex items-center justify-center rounded-xl shrink-0 ${
                        done ? 'bg-lilac/20 text-primary' : 'surface-2 text-dim'
                      }`}
                      style={{ width: 44, height: 44 }}
                    >
                      {done ? (
                        <CheckCircle2 size={24} />
                      ) : started ? (
                        <PlayCircle size={24} />
                      ) : (
                        <Circle size={20} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold truncate">{c.title}</span>
                        {done && <Badge color="primary">已完成</Badge>}
                        {started && <Badge color="gold">进行中</Badge>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-dim mt-1">
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> 约 {c.estMinutes} 分钟
                        </span>
                        <span>第 {i + 1} 课</span>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
