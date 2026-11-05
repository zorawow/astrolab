/**
 * AstroLab 教学内容 / 题库 / 学习记录自动化验收。
 *
 * 用 esbuild 把纯 TS 检查模块打包成临时 ESM（不启动浏览器、不连数据库），
 * 任何一项失败都会以非零退出码结束，可直接接进 CI。
 *
 *   npm run check
 */
import { build } from 'esbuild'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const tmp = await mkdtemp(path.join(tmpdir(), 'astrolab-check-'))
const out = path.join(tmp, 'integrity.mjs')

try {
  await build({
    entryPoints: [path.join(root, 'src/lib/integrity.ts')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'es2020',
    outfile: out,
    logLevel: 'silent',
  })

  const { runIntegrityChecks } = await import(pathToFileURL(out).href)
  const report = runIntegrityChecks()

  console.log('\n═══ AstroLab 教学内容与练习系统 · 自动验收 ═══\n')
  console.log(
    `知识点 ${report.totals.knowledge}（深度教学 ${report.totals.teaching}） | ` +
    `课程 ${report.totals.courses}（逐单元 ${report.totals.unitCourses}） | ` +
    `题目 ${report.totals.questions}（引导推理 ${report.totals.guided}）\n`,
  )

  for (const c of report.checks) {
    console.log(`${c.ok ? '✅' : '❌'} ${c.name}`)
    for (const d of c.details) console.log(`     · ${d}`)
    for (const e of c.errors) console.log(`     ⚠ ${e}`)
  }

  console.log('\n─── 各模块知识点 / 题目覆盖 ───')
  for (const m of report.modules) {
    console.log(
      `  ${m.title.padEnd(12, '　')} 知识点 ${String(m.units).padStart(2)} | ` +
      `题目 ${String(m.questions).padStart(3)}（客观 ${String(m.objectiveQuestions).padStart(3)}） | ` +
      `单元课 ${String(m.courses).padStart(2)} | 无题知识点 ${m.uncovered.length}`,
    )
  }

  const houses = report.modules.find((m) => m.moduleId === 'houses')
  if (houses) {
    console.log('\n─── 十二宫位实际练习覆盖 ───')
    for (const u of houses.perUnit) {
      const has = (d) => (u.directions.includes(d) ? '✓' : '✗')
      console.log(
        `  ${u.name.padEnd(5, '　')} 共 ${String(u.count).padStart(2)} 题 | ` +
        `宫位→含义 ${has('forward')} | 含义→宫位 ${has('reverse')} | 情境→应用 ${has('scenario')} | ` +
        `其他方向 ${u.directions.filter((d) => !['forward', 'reverse', 'scenario'].includes(d)).join('/') || '—'}`,
      )
    }
  }

  const failed = report.checks.filter((c) => !c.ok)
  console.log(`\n═══ 结果：${failed.length === 0 ? '全部通过' : `${failed.length} 项未通过`} ═══\n`)
  process.exitCode = failed.length === 0 ? 0 : 1
} finally {
  await rm(tmp, { recursive: true, force: true })
}
