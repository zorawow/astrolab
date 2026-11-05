import { Heart, Briefcase, Lightbulb, Star } from 'lucide-react'
import { useStore } from '../lib/store'
import { getDailyContent, DAILY_SIGNS } from '../data/dailyContent'
import { formatDate } from '../lib/util'
import { Card, Glyph } from '../components/ui'

export default function Daily() {
  const store = useStore()
  const daily = getDailyContent(store.sunSign, new Date())
  const selected = DAILY_SIGNS.find((s) => s.id === store.sunSign) ?? DAILY_SIGNS[0]

  return (
    <div className="fade-up space-y-5 pt-2">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">每日占星</h1>
        <p className="text-dim text-sm mt-1">{formatDate()} · 自我反思与灵感</p>
      </header>

      {/* 选择太阳星座 */}
      <div>
        <h2 className="text-sm font-medium text-dim mb-2">选择你的太阳星座</h2>
        <div className="grid grid-cols-4 gap-2">
          {DAILY_SIGNS.map((s) => {
            const active = s.id === store.sunSign
            return (
              <button
                key={s.id}
                onClick={() => store.setSunSign(s.id)}
                className={`tap rounded-xl py-2.5 flex flex-col items-center gap-0.5 border ${
                  active ? 'bg-lilac/20 text-primary border-lilac' : 'surface-2 text-dim border-token'
                }`}
              >
                <span className="text-xl leading-none">{s.symbol}</span>
                <span className="text-xs">{s.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 今日内容 */}
      <Card className="relative overflow-hidden" padded={false}>
        <div className="p-6">
          <div className="flex items-center gap-4">
            <Glyph symbol={selected.symbol} size={56} />
            <div>
              <div className="text-xs text-dim">{selected.en} · 今日主题</div>
              <h2 className="text-xl font-bold">{daily.theme}</h2>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div className="flex gap-3">
              <Heart size={18} className="text-gold shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gold">关系与沟通</div>
                <p className="text-sm text-dim mt-0.5">{daily.relationship}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Briefcase size={18} className="text-primary shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-primary">学习与工作</div>
                <p className="text-sm text-dim mt-0.5">{daily.work}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Lightbulb size={18} className="text-lilac-light shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium">自我反思</div>
                <p className="text-sm text-dim mt-0.5">{daily.reflection}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <p className="text-[11px] text-dim flex items-start gap-1.5 leading-relaxed">
        <Star size={12} className="mt-0.5 shrink-0" />
        {daily.disclaimer}
      </p>
    </div>
  )
}
