import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, ChevronRight, BookOpen, Target, Trophy, Layers,
  AlertTriangle, CheckCircle2, Circle, Sparkles, GraduationCap, PlayCircle,
} from 'lucide-react'
import { useStore } from '../lib/store'
import { moduleStats, STATUS_LABEL, STATUS_COLOR, MASTERY_RULES, type ModuleStats } from '../lib/coverage'
import { MODULES, MODULES_BY_ID, courseForUnit, questionsForUnit } from '../data/curriculum'
import { getKnowledge } from '../data'
import { Card, Button, Badge, ProgressRing, Disclosure, SectionTitle } from '../components/ui'
import { TeachingView } from '../components/TeachingView'
import { HouseWheel } from '../components/HouseWheel'
import type { MasteryStatus } from '../types'

const ORDER: MasteryStatus[] = ['none', 'studied', 'weak', 'basic', 'mastered']

function StatusPill({ status }: { status: MasteryStatus }) {
  return <Badge color={STATUS_COLOR[status]}>{STATUS_LABEL[status]}</Badge>
}

function ModuleCard({ stats, onOpen }: { stats: ModuleStats; onOpen: () => void }) {
  const m = MODULES_BY_ID[stats.moduleId]
  const counts: Record<MasteryStatus, number> = {
    none: 0,
    studied: 0,
    weak: stats.weak,
    basic: stats.basic,
    mastered: stats.mastered,
  }
  // 未学习 / 已学习未练习从单元明细精确统计
  counts.none = stats.units.filter((u) => u.status === 'none').length
  counts.studied = stats.units.filter((u) => u.status === 'studied').length
  return (
    <Card onClick={onOpen} className="space-y-3">
      <div className="flex items-center gap-4">
        <ProgressRing value={stats.coveragePct} size={58} stroke={6} label={`${stats.coveragePct}%`} />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-lg flex items-center gap-2">
            {stats.title}
            {stats.coveragePct === 100 && stats.mastered === stats.total && (
              <Trophy size={16} className="text-gold" />
            )}
          </div>
          <div className="text-xs text-dim mt-0.5 leading-relaxed">{m?.desc}</div>
        </div>
        <ChevronRight size={18} className="text-dim shrink-0" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {ORDER.map((s) => (
          <span key={s} className="text-[11px] surface-2 rounded-full px-2 py-0.5 text-dim">
            {STATUS_LABEL[s]} <span className="font-semibold text-[var(--text)]">{counts[s]}</span>
          </span>
        ))}
      </div>
      <div className="text-xs text-dim">
        已练习 <span className="text-primary font-semibold">{stats.practiced}</span> / {stats.total} 个知识点
        {stats.notPracticed.length > 0 && ` · 还有 ${stats.notPracticed.length} 个从未练过`}
      </div>
    </Card>
  )
}

export default function ModuleOverview() {
  const { moduleId } = useParams()
  const navigate = useNavigate()
  const store = useStore()
  const all = useMemo(() => MODULES.map((m) => moduleStats(m, store)), [store.knowledge, store.practiceByUnit])
  const stats = moduleId ? all.find((s) => s.moduleId === moduleId) : undefined
  const module = moduleId ? MODULES_BY_ID[moduleId] : undefined
  const [selected, setSelected] = useState<string | null>(null)

  // ===== 列表页 =====
  if (!moduleId || !stats || !module) {
    const totalUnits = all.reduce((n, s) => n + s.total, 0)
    const totalPracticed = all.reduce((n, s) => n + s.practiced, 0)
    return (
      <div className="fade-up space-y-5 pt-2">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">模块掌握概览</h1>
          <p className="text-dim text-sm mt-1">
            每个知识点都单独追踪，未练习的知识点不会被算作完成。
          </p>
        </header>

        <Card className="flex items-center gap-4">
          <ProgressRing
            value={totalUnits ? Math.round((totalPracticed / totalUnits) * 100) : 0}
            size={72}
            stroke={7}
          />
          <div className="flex-1">
            <div className="text-xs text-dim">全站知识点练习覆盖</div>
            <div className="font-bold text-lg">{totalPracticed} / {totalUnits}</div>
            <div className="text-xs text-dim mt-1">
              完成课程 ≠ 掌握；只有练过对应题目才计入覆盖。
            </div>
          </div>
        </Card>

        <Disclosure title="掌握状态是怎么判定的？" subtitle="规则统一、可解释，不会答对一题就变熟练" icon={<Target size={18} />} tone="primary">
          <div className="space-y-2 text-sm">
            {[
              ['尚未学习', '没有课程学习记录，也没有任何练习。'],
              ['已学习未练习', '上过课或看过知识卡，但这个知识点一次题都没做过。'],
              ['需要加强', `错 ≥ ${MASTERY_RULES.wrongForWeak} 次，或正确率 < 60%，或练习不足 ${MASTERY_RULES.minAttemptsForBasic} 次 / ${MASTERY_RULES.minTypesForBasic} 种题型。`],
              ['基本掌握', `至少 ${MASTERY_RULES.minAttemptsForBasic} 次练习、${MASTERY_RULES.minTypesForBasic} 种题型、正确率 ≥ ${MASTERY_RULES.minAccuracyForBasic * 100}%。`],
              ['熟练掌握', '在「基本掌握」之上，间隔至少 1 天后再次答对，或累计 4 次以上且正确率 ≥ 80%。'],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="shrink-0 font-semibold text-primary w-24">{k}</span>
                <span className="text-dim flex-1">{v}</span>
              </div>
            ))}
          </div>
        </Disclosure>

        <div className="space-y-3">
          {all.map((s) => (
            <ModuleCard key={s.moduleId} stats={s} onOpen={() => navigate(`/modules/${s.moduleId}`)} />
          ))}
        </div>
      </div>
    )
  }

  // ===== 详情页 =====
  const statuses: Record<string, MasteryStatus> = Object.fromEntries(
    stats.units.map((u) => [u.id, u.status]),
  )
  const activeId = selected ?? stats.recommended[0] ?? stats.units[0]?.id
  const active = stats.units.find((u) => u.id === activeId)
  const activeK = activeId ? getKnowledge(activeId) : undefined
  const activeCourse = activeId ? courseForUnit(activeId) : undefined
  const activeQuestions = activeId ? questionsForUnit(activeId) : []
  const isHouses = module.id === 'houses'

  return (
    <div className="fade-up space-y-5 pt-2 pb-24">
      <button onClick={() => navigate('/modules')} className="tap flex items-center gap-1 text-dim text-sm">
        <ArrowLeft size={16} /> 模块掌握概览
      </button>

      <header>
        <h1 className="text-2xl font-bold tracking-tight">{stats.title}</h1>
        <p className="text-dim text-sm mt-1 leading-relaxed">{module.desc}</p>
      </header>

      {/* 真实统计 */}
      <Card>
        <div className="flex items-center gap-4">
          <ProgressRing value={stats.coveragePct} size={76} stroke={8} />
          <div className="flex-1">
            <div className="text-xs text-dim">知识点练习覆盖率</div>
            <div className="font-bold text-xl">{stats.practiced} / {stats.total}</div>
            <div className="text-xs text-dim mt-1">已学习 {stats.learned} · 未练习 {stats.notPracticed.length}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
          {(['weak', 'basic', 'mastered'] as MasteryStatus[]).map((s) => (
            <div key={s} className="surface-2 rounded-xl py-2">
              <div className="text-lg font-bold">
                {s === 'weak' ? stats.weak : s === 'basic' ? stats.basic : stats.mastered}
              </div>
              <div className="text-[11px] text-dim">{STATUS_LABEL[s]}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-2.5">
        <Button variant="gold" onClick={() => navigate(`/quiz/challenge/${module.id}`)}>
          <Trophy size={16} /> 完整掌握挑战
        </Button>
        <Button variant="ghost" onClick={() => navigate('/quiz/quick')}>
          <PlayCircle size={16} /> 快速练习
        </Button>
      </div>

      {/* 十二宫轮盘 */}
      {isHouses && (
        <Card>
          <div className="flex items-center gap-2 font-bold mb-1">
            <Layers size={17} className="text-primary" /> 十二宫轮盘
          </div>
          <p className="text-xs text-dim mb-3">颜色代表掌握状态；点击任一宫查看完整讲解与对应练习。</p>
          <HouseWheel
            statuses={statuses}
            selected={activeId}
            onSelect={(id) => setSelected(id)}
          />
        </Card>
      )}

      {/* 知识点网格（非宫位模块，宫位模块也保留方便按状态筛选） */}
      <div>
        <SectionTitle>{isHouses ? '按状态选择宫位' : '知识点掌握状态'}</SectionTitle>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {stats.units.map((u) => (
            <button
              key={u.id}
              onClick={() => setSelected(u.id)}
              className={`tap rounded-xl p-2.5 text-left border text-sm ${
                activeId === u.id
                  ? 'border-gold bg-gold/10'
                  : 'border-token surface-2 hover:brightness-110'
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="text-primary">{getKnowledge(u.id)?.symbol}</span>
                <span className="font-medium truncate">{u.name}</span>
              </div>
              <div className="text-[10px] text-dim mt-1">
                {u.attempts} 次 · {u.accuracy}% 正确
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 推荐下一步 */}
      {stats.recommended.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 font-bold mb-2">
            <Target size={17} className="text-primary" /> 推荐下一步
          </div>
          <p className="text-xs text-dim mb-3">优先「从未练过」的知识点，其次是「需要加强」。</p>
          <div className="space-y-2">
            {stats.recommended.slice(0, 5).map((id) => {
              const u = stats.units.find((x) => x.id === id)!
              const c = courseForUnit(id)
              return (
                <button
                  key={id}
                  onClick={() => c && navigate(`/courses/${c.id}`)}
                  className="tap w-full flex items-center gap-3 surface-2 rounded-xl p-3 border border-token text-left"
                >
                  {u.attempts === 0 ? <Circle size={16} className="text-dim" /> : <AlertTriangle size={16} className="text-red-400" />}
                  <span className="flex-1 text-sm font-medium">{u.name}</span>
                  <StatusPill status={u.status} />
                  <ChevronRight size={16} className="text-dim" />
                </button>
              )
            })}
          </div>
        </Card>
      )}

      {/* 选中知识点的完整讲解 */}
      {activeK && (
        <div className="space-y-3">
          <SectionTitle>
            <span className="flex items-center gap-2">
              <BookOpen size={17} className="text-primary" />
              {activeK.symbol} {activeK.name} · 完整讲解
            </span>
          </SectionTitle>
          <Card className="flex items-center justify-between gap-3 py-3">
            <div className="text-sm">
              <StatusPill status={active?.status ?? 'none'} />
              <span className="text-dim ml-2">
                练习 {active?.attempts ?? 0} 次 · 正确率 {active?.accuracy ?? 0}% · 题型 {active?.types.length ?? 0} 种
              </span>
            </div>
            <button
              onClick={() => navigate(`/wiki/${activeK.id}`)}
              className="tap text-xs text-primary flex items-center gap-1 shrink-0"
            >
              知识卡 <ChevronRight size={14} />
            </button>
          </Card>
          <TeachingView unitId={activeK.id} />
          <div className="grid grid-cols-2 gap-2.5">
            {activeCourse && (
              <Button variant="ghost" onClick={() => navigate(`/courses/${activeCourse.id}`)}>
                <GraduationCap size={16} /> 上这一课
              </Button>
            )}
            <Button
              variant="primary"
              disabled={activeQuestions.length === 0}
              onClick={() => navigate(`/quiz/unit?unit=${activeK.id}`)}
            >
              <Sparkles size={16} /> 练这一知识点
            </Button>
          </div>
          {activeQuestions.length > 0 && (
            <p className="text-[11px] text-dim text-center">
              该知识点共有 {activeQuestions.length} 道对应题目，练习记录会写回上面的掌握状态。
            </p>
          )}
        </div>
      )}

      <Card className="border-gold/25 bg-gold/5">
        <div className="flex gap-2 text-xs text-dim leading-relaxed">
          <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-accent" />
          <span>
            覆盖率只统计「真正做过该知识点题目」的单元。完成课程会记为「已学习未练习」，
            不会让模块提前显示完成。
          </span>
        </div>
      </Card>
    </div>
  )
}
