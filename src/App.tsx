import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import { useStore } from './lib/store'
import Home from './pages/Home'
import Courses from './pages/Courses'
import Lesson from './pages/Lesson'
import Encyclopedia from './pages/Encyclopedia'
import KnowledgeDetail from './pages/KnowledgeDetail'
import Quiz from './pages/Quiz'
import QuizRunner from './pages/QuizRunner'
import Daily from './pages/Daily'
import Profile from './pages/Profile'

function ThemeEffect() {
  const theme = useStore((s) => s.theme)
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') root.classList.add('light')
    else root.classList.remove('light')
  }, [theme])
  return null
}

function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  if (online) return null
  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-gold text-ink-900 text-center text-sm py-1.5 font-medium">
      当前处于离线状态 · 已缓存内容仍可正常学习
    </div>
  )
}

export default function App() {
  const hydrated = useStore((s) => s.hydrated)
  // 兜底：即使 IndexedDB 被浏览器禁用、水合 Promise 迟迟不返回，也不会把用户锁在加载页
  const [forceReady, setForceReady] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setForceReady(true), 2500)
    return () => window.clearTimeout(t)
  }, [])

  if (!hydrated && !forceReady) {
    return (
      <div className="min-h-screen flex items-center justify-center text-dim">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <span className="text-3xl">✷</span>
          <span>正在唤醒星图…</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <ThemeEffect />
      <OfflineBanner />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId" element={<Lesson />} />
          <Route path="/wiki" element={<Encyclopedia />} />
          <Route path="/wiki/:id" element={<KnowledgeDetail />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/quiz/:mode" element={<QuizRunner />} />
          <Route path="/daily" element={<Daily />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Layout>
    </>
  )
}
