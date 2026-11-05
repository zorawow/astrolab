import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react'
import type { IntegrityReport } from '../lib/integrity'
import { Card, Button, Badge } from '../components/ui'

/**
 * 浏览器端自检页：动态 import 检查模块（不进主 bundle），
 * 在真实运行环境里跑一遍内容 / 题库 / 覆盖 / 掌握状态 / 迁移规则。
 */
export default function SelfTest() {
  const navigate = useNavigate()
  const [report, setReport] = useState<IntegrityReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [run, setRun] = useState(0)

  useEffect(() => {
    let alive = true
    setReport(null)
    setError(null)
    import('../lib/integrity')
      .then((m) => {
        if (alive) setReport(m.runIntegrityChecks())
      })
      .catch((e) => {
        if (alive) setError(String(e))
      })
    return () => { alive = false }
  }, [run])

  return (
    <div className="fade-up space-y-5 pt-2 pb-24">
      <button onClick={() => navigate(-1)} className="tap flex items-center gap-1 text-dim text-sm">
        <ArrowLeft size={16} /> 返回
      </button>

      <header>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ShieldCheck size={21} className="text-primary" /> 内容与数据完整性自检
        </h1>
        <p className="text-dim text-sm mt-1">
          在浏览器里实时检查课程、题库、解析、引用、知识点覆盖、掌握状态规则与旧备份迁移。
        </p>
      </header>

      {error && (
        <Card className="border-red-400/40 text-sm text-red-400">检查模块加载失败：{error}</Card>
      )}
      {!report && !error && (
        <Card className="text-center text-dim py-8">正在运行检查…</Card>
      )}

      {report && (
        <>
          <Card className={report.ok ? 'border-emerald-500/40' : 'border-red-400/40'}>
            <div className="flex items-center gap-3">
              {report.ok ? <CheckCircle2 size={26} className="text-emerald-500" /> : <AlertTriangle size={26} className="text-red-400" />}
              <div className="flex-1">
                <div className="font-bold">{report.ok ? '全部检查通过' : '存在未通过项'}</div>
                <div className="text-xs text-dim mt-0.5">
                  {report.checks.filter((c) => c.ok).length}/{report.checks.length} 项通过 ·
                  知识点 {report.totals.knowledge} · 课程 {report.totals.courses} · 题目 {report.totals.questions}
                </div>
              </div>
              <Badge color={report.ok ? 'success' : 'danger'}>{report.ok ? 'PASS' : 'FAIL'}</Badge>
            </div>
          </Card>

          <div className="space-y-2.5">
            {report.checks.map((c) => (
              <Card key={c.name} padded={false} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start gap-2">
                    {c.ok ? <CheckCircle2 size={17} className="text-emerald-500 shrink-0 mt-0.5" /> : <AlertTriangle size={17} className="text-red-400 shrink-0 mt-0.5" />}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{c.name}</div>
                      {c.details.slice(0, 3).map((d, i) => (
                        <div key={i} className="text-[11px] text-dim mt-1">· {d}</div>
                      ))}
                      {c.details.length > 3 && (
                        <div className="text-[11px] text-dim mt-1">· 其余 {c.details.length - 3} 条…</div>
                      )}
                      {c.errors.map((e, i) => (
                        <div key={i} className="text-[11px] text-red-400 mt-1">⚠ {e}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div>
            <h2 className="text-lg font-bold mb-2">模块覆盖</h2>
            <div className="space-y-2">
              {report.modules.map((m) => (
                <Card key={m.moduleId} className="flex items-center justify-between py-3" padded>
                  <div>
                    <div className="font-medium text-sm">{m.title}</div>
                    <div className="text-[11px] text-dim mt-0.5">
                      {m.units} 个知识点 · {m.questions} 道题 · {m.courses} 节单元课
                    </div>
                  </div>
                  <Badge color={m.uncovered.length ? 'danger' : 'success'}>
                    {m.uncovered.length ? `${m.uncovered.length} 个无题` : '全覆盖'}
                  </Badge>
                </Card>
              ))}
            </div>
          </div>

          <Button full variant="ghost" onClick={() => setRun((n) => n + 1)}>
            <RefreshCw size={16} /> 重新运行检查
          </Button>
          <p className="text-[11px] text-dim text-center leading-relaxed">
            相同检查也可在命令行运行 <code>npm run check</code>，会随构建一起校验。
          </p>
        </>
      )}
    </div>
  )
}
