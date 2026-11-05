import { NavLink, useLocation } from 'react-router-dom'
import { Home, BookOpen, Compass, PenLine, User, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { StarField } from './ui'

const NAV = [
  { to: '/', label: '今日', icon: Home, end: true },
  { to: '/courses', label: '课程', icon: BookOpen, end: false },
  { to: '/wiki', label: '百科', icon: Compass, end: false },
  { to: '/quiz', label: '练习', icon: PenLine, end: false },
  { to: '/profile', label: '我的', icon: User, end: false },
]

function NavItem({
  to,
  label,
  icon: Icon,
  end,
  vertical,
}: {
  to: string
  label: string
  icon: typeof Home
  end: boolean
  vertical?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `tap flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
          isActive ? 'bg-lilac/20 text-primary' : 'text-dim hover:text-[var(--text)]'
        } ${vertical ? 'w-full' : 'flex-col flex-1 gap-1 justify-center py-2'}`
      }
    >
      <Icon size={vertical ? 20 : 22} strokeWidth={2} />
      <span className={vertical ? '' : 'text-[11px]'}>{label}</span>
    </NavLink>
  )
}

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className="min-h-screen relative">
      {/* 桌面端侧边导航 */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-56 surface border-r border-token pt-safe pb-6 px-3 z-20">
        <div className="flex items-center gap-2 px-2 py-4 mb-2">
          <Sparkles size={22} className="text-primary" />
          <span className="font-bold text-lg tracking-tight">AstroLab</span>
        </div>
        <nav className="flex flex-col gap-1 mt-2">
          {NAV.map((n) => (
            <NavItem key={n.to} {...n} vertical />
          ))}
        </nav>
        <div className="mt-auto px-2 text-xs text-dim">
          占星实验室 · 个人学习系统
        </div>
      </aside>

      {/* 主内容 */}
      <main className="md:pl-56 min-h-screen">
        <div className="relative mx-auto max-w-2xl px-4 pb-28 md:pb-12 pt-4">
          {isHome && (
            <div className="absolute inset-0 -z-10 opacity-60">
              <StarField />
            </div>
          )}
          {children}
        </div>
      </main>

      {/* 移动端底部导航 */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 surface border-t border-token pb-safe">
        <div className="flex items-stretch">
          {NAV.map((n) => (
            <NavItem key={n.to} {...n} />
          ))}
        </div>
      </nav>
    </div>
  )
}
