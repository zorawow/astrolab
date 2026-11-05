import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Flame, CheckCircle2, AlertCircle, StickyNote, Download, Upload,
  Trash2, Moon, Sun, Star, BarChart3, ChevronRight, ShieldCheck,
} from 'lucide-react'
import { useStore, BACKUP_VERSION } from '../lib/store'
import { COURSES, STAGES } from '../data/courses'
import { getKnowledge } from '../data'
import { getQuestion, QUESTIONS } from '../data/questions'
import { MODULES } from '../data/curriculum'
import { moduleStats, STATUS_LABEL } from '../lib/coverage'
import { Card, Button, Stat, Badge, ProgressRing } from '../components/ui'

export default function Profile() {
  const navigate = useNavigate()
  const store = useStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)

  const totalCourses = COURSES.length
  const progress = Math.round((store.completedCourses.length / totalCourses) * 100)

  const stageProgress = STAGES.map((st) => {
    const cs = COURSES.filter((c) => c.stage === st.id)
    const done = cs.filter((c) => store.completedCourses.includes(c.id)).length
    return { ...st, done, total: cs.length }
  })
  const currentStage = stageProgress.find((s) => s.done < s.total)?.id ?? '已完成'

  // 真实模块覆盖：全部来自 practiceByUnit，不使用旧的 mastery 猜测
  const stats = useMemo(
    () => MODULES.map((m) => moduleStats(m, store)),
    [store.knowledge, store.practiceByUnit],
  )
  const totalUnits = stats.reduce((n, s) => n + s.total, 0)
  const practicedUnits = stats.reduce((n, s) => n + s.practiced, 0)
  const masteredUnits = stats.reduce((n, s) => n + s.mastered, 0)
  const weakUnits = stats.reduce((n, s) => n + s.weak, 0)

  const wrongList = Object.keys(store.wrongQuestions)
    .map((id) => getQuestion(id))
    .filter((q): q is NonNullable<typeof q> => Boolean(q))
  const recentHistory = store.quizHistory.slice(0, 8)

  const exportData = () => {
    const json = store.exportData()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const d = new Date()
    a.href = url
    a.download = `astrolab-backup-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMsg({ ok: true, text: '已导出学习数据备份（含逐知识点练习记录与挑战进度）' })
  }

  const importData = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const res = store.importData(String(reader.result))
      setMsg(res.ok ? { ok: true, text: '已恢复备份数据，旧版备份也会自动补齐新字段' } : { ok: false, text: res.error || '导入失败' })
    }
    reader.readAsText(file)
  }

  return (
    <div className="fade-up space-y-5 pt-2 pb-24">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">我的学习档案</h1>
        <button
          onClick={() => store.setTheme(store.theme === 'dark' ? 'light' : 'dark')}
          className="tap surface-2 rounded-full p-2.5 border border-token"
          aria-label="切换主题"
        >
          {store.theme === 'dark' ? <Sun size={18} className="text-gold" /> : <Moon size={18} className="text-primary" />}
        </button>
      </header>

      {msg && (
        <div className={`text-sm p-3 rounded-xl ${msg.ok ? 'bg-lilac/15 border border-lilac/40 text-primary' : 'bg-red-500/10 border border-red-400/40 text-red-400'}`}>
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-4 gap-2.5">
        <Stat label="连续天数" value={store.streak.count} icon={<Flame size={16} />} />
        <Stat label="已完成课" value={store.completedCourses.length} icon={<CheckCircle2 size={16} />} />
        <Stat label="错题" value={wrongList.length} icon={<AlertCircle size={16} />} />
        <Stat label="笔记" value={store.notes.length} icon={<StickyNote size={16} />} />
      </div>

      <Card className="flex items-center gap-4">
        <ProgressRing value={progress} size={72} stroke={7} />
        <div className="flex-1">
          <div className="text-xs text-dim">课程完成进度</div>
          <div className="font-bold text-lg">{progress}%</div>
          <div className="text-sm text-dim">
            当前阶段：{currentStage === '已完成' ? '全部完成 🎉' : `第 ${currentStage} 阶段`}
          </div>
        </div>
      </Card>

      {/* 知识点真实覆盖 */}
      <Card onClick={() => navigate('/modules')} className="flex items-center gap-4 border-lilac/30">
        <ProgressRing
          value={totalUnits ? Math.round((practicedUnits / totalUnits) * 100) : 0}
          size={72}
          stroke={7}
        />
        <div className="flex-1">
          <div className="text-xs text-dim flex items-center gap-1"><BarChart3 size={13} /> 知识点练习覆盖</div>
          <div className="font-bold text-lg">{practicedUnits} / {totalUnits}</div>
          <div className="text-xs text-dim mt-1">
            熟练掌握 {masteredUnits} · 需要加强 {weakUnits} · 未练习 {totalUnits - practicedUnits}
          </div>
        </div>
        <ChevronRight size={18} className="text-dim" />
      </Card>

      {/* 各阶段课程 */}
      <div>
        <h2 className="text-lg font-bold mb-2">课程阶段</h2>
        <div className="space-y-2">
          {stageProgress.map((s) => (
            <Card key={s.id} className="flex items-center justify-between py-3" padded>
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold">{s.id}</span>
                <span className="font-medium">{s.title}</span>
              </div>
              <span className="text-sm text-dim">{s.done}/{s.total}</span>
            </Card>
          ))}
        </div>
      </div>

      {/* 模块掌握（真实 5 态） */}
      <div>
        <h2 className="text-lg font-bold mb-2">各模块掌握状态</h2>
        <div className="space-y-2">
          {stats.map((s) => (
            <button
              key={s.moduleId}
              onClick={() => navigate(`/modules/${s.moduleId}`)}
              className="tap w-full surface rounded-2xl p-4 border border-token text-left flex items-center gap-3"
            >
              <ProgressRing value={s.coveragePct} size={46} stroke={5} label={`${s.coveragePct}%`} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{s.title}</div>
                <div className="text-[11px] text-dim mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                  <span>已练 {s.practiced}/{s.total}</span>
                  <span>{STATUS_LABEL.weak} {s.weak}</span>
                  <span>{STATUS_LABEL.basic} {s.basic}</span>
                  <span>{STATUS_LABEL.mastered} {s.mastered}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-dim shrink-0" />
            </button>
          ))}
        </div>
        <p className="text-[11px] text-dim mt-2 leading-relaxed">
          统计口径：每个知识点单独的练习次数、正确率、练过的题型与间隔复习记录。
          只上过课、没做过题的显示「已学习未练习」。
        </p>
      </div>

      {/* 近期测验 */}
      {recentHistory.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-2">近期测验记录</h2>
          <Card padded>
            <div className="space-y-2">
              {recentHistory.map((r, i) => {
                const q = getQuestion(r.questionId)
                return (
                  <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-token last:border-0">
                    <span className="truncate flex-1">{q ? q.prompt.slice(0, 24) + '…' : r.questionId}</span>
                    {r.practiced ? <Badge color="gold">已练习</Badge> : r.correct ? <Badge color="primary">答对</Badge> : <Badge color="danger">答错</Badge>}
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      )}

      {/* 错题本 */}
      <div>
        <h2 className="text-lg font-bold mb-2 flex items-center gap-1">
          <AlertCircle size={16} className="text-red-400" /> 错题本（{wrongList.length}）
        </h2>
        {wrongList.length === 0 ? (
          <Card className="text-center text-dim py-6">还没有错题，继续保持！</Card>
        ) : (
          <div className="space-y-2">
            {wrongList.slice(0, 3).map((q) => (
              <Card key={q.id} onClick={() => navigate('/wrongbook')} className="py-3" padded>
                <div className="font-medium text-sm truncate">{q.prompt}</div>
                <div className="text-xs text-dim mt-0.5">
                  考点：{q.unitId ? getKnowledge(q.unitId)?.name ?? q.unitId : q.topic}
                </div>
              </Card>
            ))}
            <Button variant="ghost" full onClick={() => navigate('/wrongbook')}>
              打开升级版错题本 <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </div>

      {/* 收藏 */}
      <div>
        <h2 className="text-lg font-bold mb-2 flex items-center gap-1">
          <Star size={16} className="text-gold" /> 我的收藏（{store.favorites.length}）
        </h2>
        {store.favorites.length === 0 ? (
          <Card className="text-center text-dim py-6">还没有收藏，去百科里点亮星标吧</Card>
        ) : (
          <div className="flex flex-wrap gap-2">
            {store.favorites.map((fid) => {
              const k = getKnowledge(fid)
              if (!k) return null
              return (
                <button
                  key={fid}
                  onClick={() => navigate(`/wiki/${fid}`)}
                  className="tap surface-2 rounded-full px-3 py-1.5 text-sm flex items-center gap-1.5 border border-token"
                >
                  <span className="text-primary">{k.symbol}</span>{k.name}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* 数据管理 */}
      <div>
        <h2 className="text-lg font-bold mb-2">数据管理</h2>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <Button variant="ghost" onClick={exportData}><Download size={16} /> 导出备份</Button>
            <Button variant="ghost" onClick={() => fileRef.current?.click()}><Upload size={16} /> 导入恢复</Button>
          </div>
          <Button variant="ghost" full onClick={() => navigate('/selftest')}>
            <ShieldCheck size={16} /> 运行内容与数据完整性自检
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) importData(f)
              e.target.value = ''
            }}
          />
          {!confirmClear ? (
            <Button variant="danger" full onClick={() => setConfirmClear(true)}>
              <Trash2 size={16} /> 清空学习数据
            </Button>
          ) : (
            <Card className="border-red-400/40 space-y-3" padded>
              <p className="text-sm text-red-400 font-medium">确定要清空所有学习数据吗？此操作不可恢复。</p>
              <div className="grid grid-cols-2 gap-2.5">
                <Button variant="ghost" onClick={() => setConfirmClear(false)}>取消</Button>
                <Button variant="danger" onClick={() => { store.clearAll(); setConfirmClear(false); setMsg({ ok: true, text: '已清空学习数据' }) }}>
                  确认清空
                </Button>
              </div>
            </Card>
          )}
          <div className="text-xs text-dim text-center leading-relaxed space-y-1">
            <p className="flex items-center justify-center gap-1">
              <ShieldCheck size={13} /> 数据保存在本机 IndexedDB，更新应用不会丢失
            </p>
            <p>
              备份格式 v{BACKUP_VERSION}（含逐知识点练习记录与可恢复挑战进度） · 题库共 {QUESTIONS.length} 题
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
