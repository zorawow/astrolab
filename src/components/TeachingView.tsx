import { useNavigate } from 'react-router-dom'
import {
  BookOpen, Lightbulb, Sparkles, GitCompare, AlertTriangle,
  Footprints, KeyRound, Link2, Info, Compass,
} from 'lucide-react'
import { getKnowledge, getTeaching } from '../data'
import { Card, Badge, Disclosure } from './ui'

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">{title}</div>
      <div className="text-[var(--text)] text-sm leading-relaxed space-y-2">{children}</div>
    </div>
  )
}

/**
 * 三层教学展示：
 *  ① 简单理解 —— 默认直接可见
 *  ② 深入学习 —— 折叠（含义、推理逻辑、区别、误区、生活例子、对比）
 *  ③ 实际应用 —— 折叠（组合应用分步推理、读盘用法、记忆技巧）
 */
export function TeachingView({ unitId }: { unitId: string }) {
  const navigate = useNavigate()
  const t = getTeaching(unitId)
  const k = getKnowledge(unitId)
  if (!t) return null

  const contrasts = t.contrasts.filter((c) => Boolean(getKnowledge(c.withId)))
  const links = t.recap.links.filter((id) => Boolean(getKnowledge(id)))

  return (
    <div className="space-y-3">
      {/* ===== 第一层：简单理解（默认显示） ===== */}
      <Card className="border-gold/30 bg-gold/5">
        <div className="flex items-center gap-2 text-accent font-semibold mb-2">
          <Lightbulb size={17} /> 一句话理解
        </div>
        <p className="text-base font-medium leading-relaxed">{t.core}</p>
        <p className="text-sm text-dim leading-relaxed mt-2">{t.layers.simple}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {t.recap.keywords.slice(0, 5).map((kw) => (
            <Badge key={kw} color="gold">{kw}</Badge>
          ))}
        </div>
      </Card>

      {/* ===== 第二层：深入学习 ===== */}
      <Disclosure
        title="深入学习"
        subtitle="讲清含义、为什么这样理解、与谁不同、最容易错在哪"
        icon={<BookOpen size={18} />}
        tone="primary"
      >
        <Block title="① 深入解释">
          {t.deep.map((para, i) => <p key={i}>{para}</p>)}
        </Block>
        <Block title="② 为什么具有这种象征意义">
          <p>{t.why}</p>
        </Block>
        <Block title="③ 与类似概念的区别">
          <p>{t.distinction}</p>
        </Block>
        <Block title="④ 初学者最容易误解的地方">
          <div className="p-3 rounded-xl bg-gold/10 border border-gold/25 text-sm">
            {t.beginnerTrap}
          </div>
        </Block>
        <Block title="⑤ 生活化例子">
          <div className="space-y-2">
            {t.examples.map((e, i) => (
              <div key={i} className="p-3 rounded-xl surface-2">
                <div className="text-xs font-semibold text-accent mb-1">场景 {i + 1} · {e.scene}</div>
                <p className="text-sm text-dim">{e.text}</p>
              </div>
            ))}
          </div>
        </Block>
        {contrasts.length > 0 && (
          <Block title="⑥ 相似概念对比（重点看区别）">
            <div className="space-y-2">
              {contrasts.map((c) => {
                const other = getKnowledge(c.withId)!
                return (
                  <button
                    key={c.withId}
                    onClick={() => navigate(`/wiki/${c.withId}`)}
                    className="tap w-full text-left p-3 rounded-xl surface-2 border border-token flex gap-2"
                  >
                    <GitCompare size={15} className="text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">
                      <span className="font-semibold text-primary">{k?.name ?? '本知识点'} vs {other.name}：</span>
                      <span className="text-dim">{c.point}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </Block>
        )}
        <Block title="⑦ 常见误区：错在哪、从哪来、怎么纠正">
          <div className="space-y-2">
            {t.misconceptions.map((m, i) => (
              <div key={i} className="p-3 rounded-xl bg-red-500/8 border border-red-400/25">
                <div className="flex gap-2 text-sm font-medium text-red-400">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" /> {m.text}
                </div>
                <p className="text-xs text-dim mt-1.5">误解来源：{m.origin}</p>
                <p className="text-xs mt-1">如何纠正：{m.fix}</p>
              </div>
            ))}
          </div>
        </Block>
        {t.traditionalNote && (
          <div className="p-3 rounded-xl surface-2 border border-token text-xs text-dim flex gap-2">
            <Info size={14} className="shrink-0 mt-0.5 text-primary" />
            <span><span className="font-semibold text-primary">体系说明：</span>{t.traditionalNote}</span>
          </div>
        )}
      </Disclosure>

      {/* ===== 第三层：实际应用 ===== */}
      <Disclosure
        title="实际应用"
        subtitle="按步骤做一次星盘组合推理，学会方法而不是背结论"
        icon={<Compass size={18} />}
        tone="gold"
      >
        <Block title={`组合应用 · ${t.application.title}`}>
          <div className="space-y-2">
            {t.application.steps.map((s, i) => (
              <div key={i} className="flex gap-2.5 p-3 rounded-xl surface-2">
                <span className="shrink-0 w-6 h-6 rounded-full bg-lilac/20 text-primary text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-sm flex-1">{s}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 p-3 rounded-xl bg-lilac/10 border border-lilac/25 text-sm">
            <span className="font-semibold text-primary flex items-center gap-1"><Footprints size={14} /> 结论与边界：</span>
            <p className="mt-1 text-dim">{t.application.conclusion}</p>
          </div>
        </Block>
        <Block title="读盘时怎么用">
          <p>{t.layers.practice}</p>
        </Block>
        <Block title="总结与记忆技巧">
          <div className="p-3 rounded-xl bg-gold/10 border border-gold/25">
            <div className="font-semibold text-accent flex items-center gap-1"><KeyRound size={14} /> 记住这一句</div>
            <p className="mt-1">{t.recap.oneLiner}</p>
            <p className="mt-2 text-dim text-sm">理解性记忆法：{t.recap.memoryTip}</p>
          </div>
          {links.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs text-dim flex items-center gap-1"><Link2 size={13} /> 关联：</span>
              {links.map((id) => {
                const r = getKnowledge(id)!
                return (
                  <button
                    key={id}
                    onClick={() => navigate(`/wiki/${id}`)}
                    className="tap surface-2 rounded-full px-2.5 py-1 text-xs border border-token"
                  >
                    {r.symbol} {r.name}
                  </button>
                )
              })}
            </div>
          )}
        </Block>
      </Disclosure>

      <p className="text-[11px] text-dim leading-relaxed flex items-start gap-1 px-1">
        <Sparkles size={12} className="shrink-0 mt-0.5" />
        以上为现代西方热带黄道占星的传统象征解释，用于体系内学习与自我反思；
        占星对人格或未来的解释未被科学证实，不作为诊断、因果规律或预测依据。
      </p>
    </div>
  )
}
