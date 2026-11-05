// 日期与通用工具

export function dayKey(d: Date | number = new Date()): string {
  const date = typeof d === 'number' ? new Date(d) : d
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseDayKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(ts: number, n: number): number {
  const d = new Date(ts)
  d.setDate(d.getDate() + n)
  // 归零到当天开始，便于「是否到期」比较
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function startOfToday(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function daysBetween(a: number, b: number): number {
  const ms = startOfToday() // unused but keep
  void ms
  const da = new Date(a)
  da.setHours(0, 0, 0, 0)
  const db = new Date(b)
  db.setHours(0, 0, 0, 0)
  return Math.round((db.getTime() - da.getTime()) / 86400000)
}

export function formatDate(d: Date = new Date()): string {
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${d.getMonth() + 1}月${d.getDate()}日 ${week[d.getDay()]}`
}

export function greeting(): string {
  const h = new Date().getHours()
  if (h < 6) return '夜深了，星图仍在陪你'
  if (h < 11) return '早上好，今天也想读懂一点星空吗'
  if (h < 14) return '中午好，先给大脑充个电'
  if (h < 18) return '下午好，学习片刻刚刚好'
  if (h < 22) return '晚上好，今天的星空在等你'
  return '夜深了，复习一下今天学的吧'
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}
