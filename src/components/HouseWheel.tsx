import type { MasteryStatus } from '../types'

const ROMAN = ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ', 'Ⅷ', 'Ⅸ', 'Ⅹ', 'Ⅺ', 'Ⅻ']
const SHORT = ['自我', '资源', '沟通', '家庭', '创造', '日常', '关系', '共享', '信念', '事业', '社群', '幕后']

const STATUS_STYLE: Record<MasteryStatus, { fill: string; opacity: number }> = {
  none: { fill: 'var(--surface-2)', opacity: 1 },
  studied: { fill: '#D8B77C', opacity: 0.18 },
  weak: { fill: '#F87171', opacity: 0.24 },
  basic: { fill: '#9B8DE5', opacity: 0.32 },
  mastered: { fill: '#D8B77C', opacity: 0.48 },
}

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
}

/** 第 1 宫在左（ASC），逆时针往下，第 4 宫在底部（IC），第 10 宫在顶部（MC） */
function wedgePath(i: number): string {
  const a0 = 180 - i * 30
  const a1 = a0 - 30
  const pts: [number, number][] = []
  for (let t = 0; t <= 12; t++) pts.push(polar(180, 180, 158, a0 + ((a1 - a0) * t) / 12))
  for (let t = 12; t >= 0; t--) pts.push(polar(180, 180, 82, a0 + ((a1 - a0) * t) / 12))
  return 'M ' + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L ') + ' Z'
}

function labelPos(i: number): [number, number] {
  return polar(180, 180, 120, 180 - i * 30 - 15)
}

export function HouseWheel({
  statuses = {},
  selected,
  onSelect,
}: {
  statuses?: Record<string, MasteryStatus>
  selected?: string
  onSelect?: (unitId: string) => void
}) {
  return (
    <div className="w-full max-w-[380px] mx-auto">
      <svg viewBox="0 0 360 360" className="w-full h-auto" role="img" aria-label="十二宫位轮盘">
        <circle cx="180" cy="180" r="170" fill="none" stroke="var(--surface-2)" strokeWidth="2" />
        {Array.from({ length: 12 }, (_, i) => {
          const id = `h-${i + 1}`
          const st = statuses[id] ?? 'none'
          const style = STATUS_STYLE[st]
          const [lx, ly] = labelPos(i)
          const isSel = selected === id
          return (
            <g
              key={id}
              onClick={() => onSelect?.(id)}
              className={onSelect ? 'cursor-pointer' : ''}
              style={{ transition: 'opacity .2s' }}
            >
              <path
                d={wedgePath(i)}
                fill={style.fill}
                fillOpacity={style.opacity}
                stroke={isSel ? 'var(--gold)' : 'var(--surface)'}
                strokeWidth={isSel ? 3 : 2}
              />
              <text
                x={lx}
                y={ly - 5}
                textAnchor="middle"
                fontSize="17"
                fontWeight="700"
                fill="var(--text)"
              >
                {ROMAN[i]}
              </text>
              <text x={lx} y={ly + 12} textAnchor="middle" fontSize="10" fill="var(--text-dim)">
                {SHORT[i]}
              </text>
            </g>
          )
        })}
        <circle cx="180" cy="180" r="76" fill="var(--surface)" stroke="var(--surface-2)" strokeWidth="2" />
        <text x="180" y="174" textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--text)">
          十二宫位
        </text>
        <text x="180" y="196" textAnchor="middle" fontSize="10" fill="var(--text-dim)">
          点击任一宫查看完整讲解
        </text>
        <text x="180" y="16" textAnchor="middle" fontSize="10" fill="var(--text-dim)">MC · 十宫</text>
        <text x="180" y="352" textAnchor="middle" fontSize="10" fill="var(--text-dim)">IC · 四宫</text>
      </svg>
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1 text-[11px] text-dim">
        {([
          ['none', '未学习'], ['studied', '已学习'], ['weak', '需加强'],
          ['basic', '基本掌握'], ['mastered', '熟练'],
        ] as [MasteryStatus, string][]).map(([k, label]) => (
          <span key={k} className="flex items-center gap-1">
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm"
              style={{ background: STATUS_STYLE[k].fill, opacity: Math.max(0.35, STATUS_STYLE[k].opacity) }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
