import { useState, type ReactNode, type CSSProperties } from 'react'
import { ChevronDown } from 'lucide-react'

// ===== Card =====
export function Card({
  children,
  className = '',
  onClick,
  padded = true,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
  padded?: boolean
}) {
  return (
    <div
      onClick={onClick}
      className={`surface rounded-2xl ${padded ? 'p-5' : ''} shadow-soft tap ${
        onClick ? 'cursor-pointer hover:brightness-110' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

// ===== Button =====
type Variant = 'primary' | 'ghost' | 'gold' | 'danger'
export function Button({
  children,
  onClick,
  variant = 'primary',
  full = false,
  disabled = false,
  type = 'button',
  className = '',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: Variant
  full?: boolean
  disabled?: boolean
  type?: 'button' | 'submit'
  className?: string
}) {
  const variants: Record<Variant, string> = {
    primary: 'bg-lilac text-ink-900 font-semibold hover:brightness-105',
    gold: 'bg-gold text-ink-900 font-semibold hover:brightness-105',
    ghost: 'surface-2 text-[var(--text)] hover:brightness-110',
    danger: 'bg-red-500/90 text-white font-semibold hover:brightness-105',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`tap rounded-xl px-5 py-3 text-base min-h-[48px] flex items-center justify-center gap-2 ${
        full ? 'w-full' : ''
      } ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  )
}

// ===== Badge =====
export function Badge({
  children,
  color = 'primary',
}: {
  children: ReactNode
  color?: 'primary' | 'gold' | 'muted' | 'danger' | 'success'
}) {
  const colors = {
    primary: 'bg-lilac/20 text-primary',
    gold: 'bg-gold/20 text-accent',
    muted: 'surface-2 text-dim',
    danger: 'bg-red-500/15 text-red-400',
    success: 'bg-emerald-500/15 text-emerald-500',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  )
}

// ===== SectionTitle =====
export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3 mt-1">
      <h2 className="text-lg font-bold tracking-tight">{children}</h2>
      {action}
    </div>
  )
}

// ===== ProgressRing =====
export function ProgressRing({
  value,
  size = 64,
  stroke = 6,
  color = 'var(--primary)',
  track = 'var(--surface-2)',
  label,
}: {
  value: number
  size?: number
  stroke?: number
  color?: string
  track?: string
  label?: ReactNode
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const off = c * (1 - Math.max(0, Math.min(100, value)) / 100)
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
        {label ?? `${Math.round(value)}%`}
      </div>
    </div>
  )
}

// ===== Glyph (知识符号) =====
export function Glyph({ symbol, size = 40, className = '' }: { symbol: string; size?: number; className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-full surface-2 text-primary ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      <span style={{ lineHeight: 1 }}>{symbol}</span>
    </div>
  )
}

// ===== Stat (小统计块) =====
export function Stat({ label, value, icon }: { label: string; value: ReactNode; icon?: ReactNode }) {
  return (
    <div className="surface rounded-xl px-3 py-3 flex flex-col items-center justify-center gap-1">
      {icon && <span className="text-primary">{icon}</span>}
      <span className="text-xl font-bold leading-none">{value}</span>
      <span className="text-xs text-dim text-center">{label}</span>
    </div>
  )
}

// ===== Disclosure（分层讲解用的折叠卡片）=====
export function Disclosure({
  title,
  subtitle,
  icon,
  children,
  defaultOpen = false,
  tone = 'normal',
}: {
  title: string
  subtitle?: string
  icon?: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  tone?: 'normal' | 'gold' | 'primary'
}) {
  const [open, setOpen] = useState(defaultOpen)
  const toneCls =
    tone === 'gold'
      ? 'border-gold/30 bg-gold/5'
      : tone === 'primary'
        ? 'border-lilac/30 bg-lilac/5'
        : 'border-token'
  return (
    <div className={`rounded-2xl surface border overflow-hidden ${toneCls}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="tap w-full text-left p-4 flex items-center gap-3"
        aria-expanded={open}
      >
        {icon && <span className="text-primary shrink-0">{icon}</span>}
        <span className="flex-1 min-w-0">
          <span className="font-semibold block">{title}</span>
          {subtitle && <span className="text-xs text-dim mt-0.5 block">{subtitle}</span>}
        </span>
        <ChevronDown
          size={18}
          className={`text-dim shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-3 border-t border-token text-sm leading-relaxed animate-[fadeUp_0.25s_ease-out] space-y-3">
          {children}
        </div>
      )}
    </div>
  )
}

// ===== EmptyState =====
export function EmptyState({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="text-center py-10 text-dim">
      <div className="text-3xl mb-2">✷</div>
      <div className="font-medium">{title}</div>
      {desc && <div className="text-sm mt-1">{desc}</div>}
    </div>
  )
}

// ===== StarField（装饰星点）=====
export function StarField({ count = 28 }: { count?: number }) {
  const stars = Array.from({ length: count }, (_, i) => {
    const top = (Math.sin(i * 12.9898) * 43758.5453) % 1
    const left = (Math.sin(i * 78.233) * 12543.123) % 1
    const t = Math.abs(top)
    const l = Math.abs(left)
    const size = (i % 3) + 1
    return { top: t * 100, left: l * 100, size, o: 0.3 + (i % 5) * 0.12 }
  })
  const style: CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
  }
  return (
    <div style={style} aria-hidden>
      {stars.map((s, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            borderRadius: '9999px',
            background: 'var(--text)',
            opacity: s.o,
          }}
        />
      ))}
    </div>
  )
}
