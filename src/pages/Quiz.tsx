import { useNavigate } from 'react-router-dom'
import {
  CalendarCheck, AlertCircle, Shuffle, RefreshCw, Layers, ChevronRight,
  Zap, Trophy, GitCompare, Compass, Footprints, BookOpenCheck, BarChart3,
} from 'lucide-react'
import { useStore, dueReviewCount } from '../lib/store'
import { QUESTIONS } from '../data/questions'
import { getByCategory, CATEGORY_LABEL } from '../data'
import { MODULES } from '../data/curriculum'
import { moduleStats } from '../lib/coverage'
import type { KnowledgeCategory } from '../types'
import { Card, Badge } from '../components/ui'

const TOPIC_CATS: KnowledgeCategory[] = [
  'zodiac', 'planet', 'house', 'aspect', 'element', 'modality', 'term',
]

export default function Quiz() {
  const navigate = useNavigate()
  const store = useStore()
  const wrongCount = Object.keys(store.wrongQuestions).length
  const due = dueReviewCount(store)
  const stats = MODULES.map((m) => moduleStats(m, store))
  const totalUnits = stats.reduce((n, s) => n + s.total, 0)
  const coveredUnits = stats.reduce((n, s) => n + s.practiced, 0)
  const guidedCount = QUESTIONS.filter((q) => q.type === 'guided').length
  const contrastCount = QUESTIONS.filter((q) => q.direction === 'contrast').length
  const applicationCount = QUESTIONS.filter((q) => q.direction === 'application').length

  return (
    <div className="fade-up space-y-5 pt-2 pb-24">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">知识测验</h1>
        <p className="text-dim text-sm mt-1">五种题型 · 逐知识点覆盖追踪 · 间隔复习</p>
      </header>

      {/* 覆盖概览 */}
      <Card onClick={() => navigate('/modules')} className="flex items-center gap-4 border-lilac/30">
        <div className="p-3 rounded-xl bg-lilac/20 text-primary"><BarChart3 size={22} /></div>
        <div className="flex-1">
          <div className="font-semibold">知识点覆盖 {coveredUnits} / {totalUnits}</div>
          <div className="text-sm text-dim">查看每个模块已学 / 已练 / 需加强 / 掌握状态</div>
        </div>
        <ChevronRight size={18} className="text-dim" />
      </Card>

      {/* 完整掌握挑战（主推） */}
      <Card className="border-gold/35 bg-gold/5 space-y-3">
        <div className="flex items-center gap-2 text-accent font-bold">
          <Trophy size={19} /> 完整掌握挑战
        </div>
        <p className="text-sm text-dim leading-relaxed">
          按「未练知识点优先 → 按方向覆盖全部知识点 → 对比辨析 → 综合应用」编排。
          只有全部知识点都被真正练到，才会判定完成；中途退出可随时恢复。
        </p>
        <div className="space-y-2">
          {MODULES.map((m) => {
            const s = stats.find((x) => x.moduleId === m.id)!
            const c = store.challenge?.[m.id]
            const inProgress = c && !c.completed && Object.keys(c.results).length > 0
            const done = c?.completed
            return (
              <button
                key={m.id}
                onClick={() => navigate(`/quiz/challenge/${m.id}`)}
                className="tap w-full flex items-center gap-3 surface-2 rounded-xl p-3 border border-token text-left"
              >
                <span className="flex-1 min-w-0">
                  <span className="font-medium text-sm">{m.title}</span>
                  <span className="block text-xs text-dim mt-0.5">
                    {m.units.length} 个知识点 · 已练 {s.practiced} · 覆盖 {s.coveragePct}%
                  </span>
                </span>
                {done ? (
                  <Badge color="success">已完成</Badge>
                ) : inProgress ? (
                  <Badge color="gold">继续 {Object.keys(c!.results).length}/{c!.queue.length}</Badge>
                ) : (
                  <Badge color="muted">未开始</Badge>
                )}
                <ChevronRight size={16} className="text-dim shrink-0" />
              </button>
            )
          })}
        </div>
      </Card>

      {/* 主要模式 */}
      <div className="space-y-3">
        <Card onClick={() => navigate('/quiz/daily')} className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-lilac/20 text-primary"><CalendarCheck size={22} /></div>
          <div className="flex-1">
            <div className="font-semibold">每日练习</div>
            <div className="text-sm text-dim">每天一组精选题目，保持手感</div>
          </div>
          <ChevronRight size={18} className="text-dim" />
        </Card>

        <Card onClick={() => navigate('/quiz/quick')} className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gold/20 text-accent"><Zap size={22} /></div>
          <div className="flex-1">
            <div className="font-semibold">快速练习</div>
            <div className="text-sm text-dim">优先抽「没练过」和「需要加强」的知识点，8 题一组</div>
          </div>
          <ChevronRight size={18} className="text-dim" />
        </Card>

        <Card onClick={() => navigate('/quiz/review')} className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gold/20 text-accent"><RefreshCw size={22} /></div>
          <div className="flex-1">
            <div className="font-semibold">智能复习 · 间隔重复</div>
            <div className="text-sm text-dim">
              {due > 0 ? `今天有 ${due} 个知识点到期` : '暂无到期知识点，仍会优先安排薄弱点'}
            </div>
          </div>
          <ChevronRight size={18} className="text-dim" />
        </Card>

        <Card onClick={() => navigate('/quiz/random')} className="flex items-center gap-4">
          <div className="p-3 rounded-xl surface-2 text-primary"><Shuffle size={22} /></div>
          <div className="flex-1">
            <div className="font-semibold">随机复习</div>
            <div className="text-sm text-dim">从全题库随机抽取，含引导推理题</div>
          </div>
          <ChevronRight size={18} className="text-dim" />
        </Card>

        <Card
          onClick={() => navigate('/wrongbook')}
          className="flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-red-500/15 text-red-400"><AlertCircle size={22} /></div>
          <div className="flex-1">
            <div className="font-semibold">错题本 · 升级版</div>
            <div className="text-sm text-dim">
              {wrongCount > 0 ? `${wrongCount} 道待巩固 · 按知识点分类，可重做并回看讲解` : '还没有错题，很棒！'}
            </div>
          </div>
          <ChevronRight size={18} className="text-dim" />
        </Card>
      </div>

      {/* 专项练习 */}
      <div>
        <h2 className="text-lg font-bold mb-2 flex items-center gap-1">
          <Layers size={16} className="text-primary" /> 专项练习
        </h2>
        <div className="grid grid-cols-1 gap-2.5">
          <Card onClick={() => navigate('/quiz/guided')} className="flex items-center gap-3 py-3">
            <Footprints size={19} className="text-gold" />
            <div className="flex-1">
              <div className="font-medium text-sm">引导式推理</div>
              <div className="text-xs text-dim">逐步提示 → 示范思路 → 完整推理链（{guidedCount} 题）</div>
            </div>
            <ChevronRight size={16} className="text-dim" />
          </Card>
          <Card onClick={() => navigate('/quiz/contrast')} className="flex items-center gap-3 py-3">
            <GitCompare size={19} className="text-primary" />
            <div className="flex-1">
              <div className="font-medium text-sm">概念对比辨析</div>
              <div className="text-xs text-dim">专练容易混淆的宫位、行星、星座与相位（{contrastCount} 题）</div>
            </div>
            <ChevronRight size={16} className="text-dim" />
          </Card>
          <Card onClick={() => navigate('/quiz/application')} className="flex items-center gap-3 py-3">
            <Compass size={19} className="text-accent" />
            <div className="flex-1">
              <div className="font-medium text-sm">综合星盘应用</div>
              <div className="text-xs text-dim">把行星 × 星座 × 宫位 × 相位串起来（{applicationCount} 题）</div>
            </div>
            <ChevronRight size={16} className="text-dim" />
          </Card>
        </div>
      </div>

      {/* 专题练习 */}
      <div>
        <h2 className="text-lg font-bold mb-2 flex items-center gap-1">
          <BookOpenCheck size={16} className="text-primary" /> 专题练习
        </h2>
        <div className="grid grid-cols-2 gap-2.5">
          {TOPIC_CATS.map((c) => {
            const n = QUESTIONS.filter((q) => q.category === c).length
            return (
              <button
                key={c}
                onClick={() => navigate(`/quiz/topic?cat=${c}`)}
                className="tap surface rounded-xl p-4 text-left border border-token hover:brightness-110"
              >
                <div className="font-semibold">{CATEGORY_LABEL[c]}</div>
                <div className="text-xs text-dim mt-0.5">{n} 道题目 · {getByCategory(c).length} 张知识卡</div>
              </button>
            )
          })}
        </div>
      </div>

      <p className="text-xs text-dim text-center leading-relaxed">
        题库共 {QUESTIONS.length} 道题 · 单选 / 判断 / 匹配 / 推理 / 引导推理<br />
        每题都含完整解析、逐选项区别、推理过程与应复习知识点
      </p>
    </div>
  )
}
