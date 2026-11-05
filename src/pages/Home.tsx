import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Flame, CheckCircle2, TrendingUp, RefreshCw, ChevronDown, ArrowRight, Star } from 'lucide-react'
import { useStore, dueReviewCount, totalProgress } from '../lib/store'
import { COURSES, STAGES } from '../data/courses'
import { getDailyContent, DAILY_SIGNS } from '../data/dailyContent'
import { greeting, formatDate } from '../lib/util'
import { Card, Button, Stat, StarField } from '../components/ui'

const DAILY_FACTS = [
  { q: '为什么星座按 30° 划分？', a: '黄道被均分为 12 段，每段 30°，对应十二星座。这是一种便于记忆与学习的季节坐标模型，而非当晚实际恒星群。' },
  { q: '「守护星」是什么意思？', a: '每颗行星主管一个或多个星座，把行星能量与星座连接起来。核心公式：行星给主题，星座给表达。' },
  { q: '上升点和太阳星座有什么不同？', a: '上升点（ASC）开启第一宫，代表外在气质与本能反应；太阳星座代表核心自我。两者都重要，且常常不同。' },
  { q: '紧张相位一定是坏事吗？', a: '不是。四分相（90°）与对冲相（180°）制造张力，但张力往往催生行动与成长，是「需要被处理」的动力。' },
  { q: '占星能预测未来吗？', a: '占星对人格与未来的解释尚未被科学证实，更适合作为自我反思与系统学习的工具，而非预测依据。' },
  { q: '为什么同元素星座仍有差异？', a: '差异来自「模式」（基本/固定/变动）与守护星。用「元素·模式·守护星」三角度即可拆开大多数混淆。' },
]

export default function Home() {
  const navigate = useNavigate()
  const store = useStore()
  const [factOpen, setFactOpen] = useState(false)

  const todayCourse = COURSES.find((c) => !store.completedCourses.includes(c.id))
  const stageOfToday = todayCourse ? STAGES.find((s) => s.id === todayCourse.stage) : null
  const due = dueReviewCount(store)
  const progress = totalProgress(store, COURSES.length)

  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
  )
  const fact = DAILY_FACTS[dayOfYear % DAILY_FACTS.length]

  const sign = DAILY_SIGNS.find((s) => s.id === store.sunSign) ?? DAILY_SIGNS[0]
  const daily = getDailyContent(store.sunSign, new Date())

  return (
    <div className="fade-up space-y-5">
      {/* 顶部 */}
      <header className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-primary" />
          <span className="font-bold text-lg tracking-tight">AstroLab</span>
        </div>
        <span className="text-sm text-dim">{formatDate()}</span>
      </header>
      <p className="text-dim -mt-3">{greeting()}</p>

      {/* 今日学习主卡 */}
      <Card className="relative overflow-hidden" padded={false}>
        <div className="absolute inset-0 opacity-40">
          <StarField count={20} />
        </div>
        <div className="relative p-6">
          <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-1">
            今日学习
          </div>
          {todayCourse ? (
            <>
              <h1 className="text-2xl font-bold leading-snug">{todayCourse.title}</h1>
              <div className="flex flex-wrap gap-2 mt-3 text-sm text-dim">
                <span className="surface-2 rounded-full px-2.5 py-0.5">
                  {stageOfToday?.title}
                </span>
                <span className="surface-2 rounded-full px-2.5 py-0.5">
                  约 {todayCourse.estMinutes} 分钟
                </span>
                <span className="surface-2 rounded-full px-2.5 py-0.5">
                  第 {COURSES.indexOf(todayCourse) + 1}/{COURSES.length} 课
                </span>
              </div>
              <Button
                full
                className="mt-5"
                onClick={() => navigate(`/courses/${todayCourse.id}`)}
              >
                开始今日学习 <ArrowRight size={18} />
              </Button>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold leading-snug">第一阶段课程已全部完成 🎉</h1>
              <p className="text-dim text-sm mt-2">
                你已学完全部 {COURSES.length} 节基础课。接下来可以用「错题练习」巩固，或进入「复习」保持记忆。
              </p>
              <Button full className="mt-5" onClick={() => navigate('/quiz/review')}>
                去复习薄弱点 <RefreshCw size={18} />
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* 学习进度 */}
      <div className="grid grid-cols-4 gap-2.5">
        <Stat label="连续学习" value={store.streak.count} icon={<Flame size={16} />} />
        <Stat label="已完成课" value={store.completedCourses.length} icon={<CheckCircle2 size={16} />} />
        <Stat label="总进度" value={`${progress}%`} icon={<TrendingUp size={16} />} />
        <Stat label="待复习" value={due} icon={<RefreshCw size={16} />} />
      </div>

      {/* 待复习入口 */}
      {due > 0 && (
        <Card onClick={() => navigate('/quiz/review')} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RefreshCw size={20} className="text-gold" />
            <div>
              <div className="font-semibold">今天有 {due} 个知识点待复习</div>
              <div className="text-xs text-dim">点开用间隔重复巩固记忆</div>
            </div>
          </div>
          <ArrowRight size={18} className="text-dim" />
        </Card>
      )}

      {/* 每日知识 */}
      <div>
        <h2 className="text-lg font-bold mb-2">每日知识</h2>
        <Card padded={false}>
          <button
            className="w-full text-left p-4 flex items-center justify-between tap"
            onClick={() => setFactOpen((v) => !v)}
          >
            <span className="font-medium">{fact.q}</span>
            <ChevronDown
              size={18}
              className={`text-dim transition-transform ${factOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {factOpen && (
            <div className="px-4 pb-4 text-dim text-sm leading-relaxed border-t border-token pt-3 animate-[fadeUp_0.3s_ease-out]">
              {fact.a}
            </div>
          )}
        </Card>
      </div>

      {/* 每日占星灵感 */}
      <div>
        <h2 className="text-lg font-bold mb-2">每日占星灵感</h2>
        <Card onClick={() => navigate('/daily')} className="flex items-center gap-4" padded={false}>
          <div className="p-4 flex items-center gap-4 w-full">
            <div
              className="flex items-center justify-center rounded-full surface-2 text-gold"
              style={{ width: 52, height: 52, fontSize: 26 }}
            >
              {sign.symbol}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-dim">{sign.name} · 今日主题</div>
              <div className="font-semibold truncate">{daily.theme}</div>
            </div>
            <ArrowRight size={18} className="text-dim shrink-0" />
          </div>
        </Card>
        <p className="text-[11px] text-dim mt-2 flex items-center gap-1">
          <Star size={11} /> 娱乐与自我反思用途，非实时天象预测。
        </p>
      </div>
    </div>
  )
}
