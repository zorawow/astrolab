# AstroLab 占星实验室 · 个人占星学习 PWA

一款**纯本地、无需注册、可离线**的渐进式网页应用（PWA），用于从零系统学习西方现代热带占星，目标是逐步具备独立阅读、分析本命星盘的能力。

> 说明：占星对人格与未来的解释**未被科学证实**，本应用定位为**自我反思与系统学习的工具**，并非预测或算命。

---

## 一、技术栈

- **React 18 + TypeScript + Vite 5**
- **Tailwind CSS**（深色为主，支持浅色主题切换）
- **React Router**（HashRouter，便于静态托管与离线）
- **Zustand + IndexedDB（idb）**：学习进度、错题、笔记的本地持久化
- **vite-plugin-pwa**：Web App Manifest + Service Worker 离线缓存
- 课程 / 题库 / 百科均为结构化数据，便于后续扩展

---

## 二、本地运行（电脑）

```bash
# 1. 安装依赖（首次）
npm install

# 2. 启动开发服务器（已开启 --host，可被同局域网手机访问）
npm run dev

# 3. 构建生产版本到 dist/
npm run build

# 4. 本地预览生产版本
npm run preview
```

开发服务器启动后，终端会显示本地地址（通常是 `http://localhost:5173`）。

---

## 三、手机访问

**方式 A：同局域网直接访问（最简单，适合随时调试）**

1. 电脑与手机连同一个 Wi-Fi。
2. 电脑上 `npm run dev`，终端会打印 `Network: http://192.168.x.x:5173`。
3. 手机浏览器打开该地址即可。

**方式 B：部署为在线 PWA 后访问（推荐长期使用）**

见下文「部署」。部署后手机通过公网/内网地址打开，并可「添加到主屏幕」像 App 一样使用。

---

## 四、部署为可访问的 PWA

### GitHub Pages（自动部署，推荐）

仓库内置 `.github/workflows/deploy.yml`：每次 `git push` 到 `main` 会自动执行
`npm ci` → `npm run build` → 发布 `dist/` 到 GitHub Pages。

- 在线地址：`https://zorawow.github.io/astrolab/`
- 首次推送后，在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
- 项目使用 `base: './'` 相对路径 + HashRouter，所以在 Pages 的 `/astrolab/` 子路径下也能正常加载，刷新不会 404。

### 其他静态托管

PWA 本质是静态文件（`dist/` 目录），可部署到任意静态托管。要点：

1. `npm run build` 生成 `dist/`。
2. 将 `dist/` 全部上传到静态托管（GitHub Pages / Netlify / Vercel / Cloudflare Pages / 任意支持静态文件的服务器）。
3. **必须 HTTPS**（除 `localhost` 外，浏览器只在安全上下文允许 PWA 安装与 Service Worker）。
4. **SPA 回退**：本项目使用 HashRouter，所有路由都在 `#` 之后，刷新不会 404，通常无需额外 rewrite 规则；若托管平台强制重写，请将未知路径回退到 `index.html`。
5. 部署完成后用手机浏览器打开站点，即可「添加到主屏幕」。

> 不同平台安装体验并不完全一致：iOS 用 Safari 的「分享 → 添加到主屏幕」；Android 用 Chrome 地址栏右侧的「安装」图标或「菜单 → 安装应用」。这是浏览器差异，并非所有平台体验完全相同。

---

## 五、添加到手机桌面

- **iOS（Safari）**：打开站点 → 点底部「分享」按钮 → 「添加到主屏幕」→ 命名「AstroLab」→ 完成。之后从桌面打开即为独立窗口。
- **Android（Chrome）**：打开站点 → 地址栏右侧「安装」图标（或菜单「安装应用」）→ 确认。部分浏览器需先出现安装提示横幅。
- 添加后建议**允许通知与否均可**；离线时仍可阅读已缓存的课程与百科。

---

## 六、已实现功能

**基础（第一阶段）**
- 完整 PWA 结构（Manifest / Service Worker / 离线缓存 / 可安装）
- 首页「今日学习」+ 底部五 Tab（今日 / 课程 / 百科 / 练习 / 我的），桌面端侧边导航
- 知识百科：搜索 / 分类 / 收藏 / 相关跳转 / 笔记 / 复习自评
- 间隔重复复习、每日占星内容（明确标注为娱乐与反思用途）
- 数据导出 / 导入 / 清空（二次确认），全部保存在本机 IndexedDB

**教学与练习系统升级（第二阶段）**

*统一深度教学结构*：全部 53 个知识点都有
①核心概念 ②多段深入解释与象征来源 ③≥2 个生活化例子 ④≥2 组相似概念对比（讲清区别）
⑤组合应用分步推理 ⑥≥2 条「误解 / 来源 / 纠正」 ⑦总结与记忆技巧；
并统一按「一句话理解 → 深入学习 → 实际应用」三层折叠展示。
涉及传统／现代差异（如三王星守护、土星与冥王星的吉凶框架、容许度）处均明确标注。

*课程*：55 节 = 原 16 节专题课（ID 不变，旧进度保留）+ 39 节逐知识单元课
（12 宫 + 12 星座 + 10 行星 + 5 相位，每个知识点 1 节独立课）。
讲解中插入随堂小题，课后练习与随堂小题分开记录；课程完成只记为「已学习」。

*题库*：203 道题，5 种题型（单选 / 判断 / 匹配 / 开放推理 / 引导式推理）。
- 十二宫位：每宫都有「宫位→含义 / 含义→宫位 / 情境→应用」三类共 36 道基础题，
  另有 8 道宫位对比辨析题与 4 道综合应用题。
- 十二星座 / 十大行星 / 五大相位：每个知识点都有定义辨析题与情境／几何应用题。
- 综合星盘解读、基础术语、跨模块对比题补齐覆盖。
- 每题都有：正确答案、为什么成立、逐干扰项区别、推理过程、应复习知识点、
  答对后的强化与进阶理解、答错后当前选择为何不合适、边界说明。

*覆盖追踪与掌握状态*：`practiceByUnit` 记录每个知识点的练习次数、正确 / 错误次数、
练过的题型、最近练习时间、间隔答对次数。5 态规则统一且可解释：
`尚未学习 / 已学习未练习 / 需要加强 / 基本掌握 / 熟练掌握`。
答对一道题**不会**直接进入基本掌握或熟练掌握；无练习记录绝不会显示已掌握。
模块完成度按真实覆盖率计算，禁止只测几个知识点就显示模块完成。

*练习模式*：每日练习、快速练习（优先未练 / 需加强）、智能复习（间隔重复）、
随机复习、错题练习、专题练习、引导式推理、对比辨析、综合应用、按知识点练习，
以及 6 个模块各自的「完整掌握挑战」——未练优先 → 按方向轮转覆盖全部知识点 →
对比题 → 综合题；显示题目进度与知识点覆盖进度；中途退出自动保存、下次从当前题恢复。

*可视化与错题本*：十二宫 SVG 轮盘按掌握状态着色，点击任一宫查看完整讲解与对应练习；
模块掌握概览展示 5 态分布、覆盖率、推荐下一步；升级版错题本按知识点分类，
提供错因、正确思路、推理链、应复习知识点、就地重做与返回讲解。

**内容规模（以 `npm run check` 实时输出为准）**
- 53 个知识点 / 53 份完整深度教学
- 55 节课程（含 39 节逐知识单元课）
- 203 道题目（含 6 道引导式推理题）
- 6 个教学模块，所有知识点均有对应题目

**P2（本轮未做，已预留结构）**
- 完整交互式星盘实验室（自由组合行星 / 星座 / 宫位并可视化）
- 真实出生星盘计算（需出生时间地点与星历算法，涉及天文计算与精度）
- AI 占星学习教练与开放式答案语义评价

---

## 六·二、自动验收

```bash
npm run typecheck     # TypeScript 类型检查
npm run check         # 内容 / 题库 / 解析 / 引用 / 覆盖 / 掌握规则 / 挑战 / 迁移 共 9 组检查
npm run build         # 类型检查 + 生产构建（含 PWA Service Worker）

# 无头浏览器渲染验证（先在 dist/ 起静态服务）
python -m http.server 4188 --directory dist --bind 127.0.0.1
python scripts/verify_ui.py       # 12 个页面真实渲染
python scripts/verify_flows.py    # 5 条真实交互链路（需 Chrome / Edge）
```

应用内也可在「我的 → 运行内容与数据完整性自检」打开 `/#/selftest`，
在浏览器里实时跑同一套检查。检查失败时 `npm run check` 会以非零码退出，可接入 CI。

**旧数据兼容**：备份格式 v2 新增 `practiceByUnit` 与 `challenge`；
v1 旧备份通过 `normalizeState()` 补齐空对象，已完成课程、知识掌握、测验历史、
连续天数、收藏、错题、主题设置全部保留。IndexDB 水合与 JSON 导入走同一套归一化逻辑。

---

## 七、数据安全与隐私

- 所有学习数据仅保存在**本机 IndexedDB**，不上传任何服务器。
- 应用更新（重新部署/覆盖 dist）**不会清空**学习记录，因为数据与代码分离、持久化在浏览器数据库中。
- 可在「我的 → 数据管理」中导出 JSON 备份、导入恢复，或清空（二次确认）。
- 无注册登录、无第三方追踪、无付费 API。

---

## 八、已知限制

- 每日占星使用本地预设内容库 + 日期确定性选择，并非依据真实行星运行计算，已在界面明确标注为娱乐/反思用途。
- 真实本命盘计算留待第二轮（需要可靠的星历计算与出生数据输入）。
- 浅色主题为可用版本，主要视觉打磨集中在深色「神秘靛蓝」主题。

---

## 九、目录结构（简要）

```
src/
  data/
    index.ts                 # 知识卡聚合 + attachTeaching()
    teaching/                # 53 个知识点的深度教学（housesA/B, zodiac, bodies, misc, shared）
    curriculum.ts            # 课程 → 知识点 → 题目 → 练习记录 关联中枢、逐单元课程、挑战排队
    courses.ts               # 旧 16 课 + 39 节逐单元课
    questions*.ts            # 旧题库增强 + 宫位 36 方向题 + 覆盖题 + 综合/引导推理题
    zodiac / planets / houses / aspects / elements / modalities / terminology / dailyContent
  lib/
    state.ts                 # 初始状态 + normalizeState()（v1/v2 兼容迁移）
    coverage.ts              # 5 态掌握规则、practiceByUnit 统计、moduleStats()
    integrity.ts             # 9 组自动检查（浏览器 / Node 共用）
    store.ts                 # Zustand + IndexedDB persist、挑战状态、备份导入导出
    review.ts / db.ts / util.ts
  components/
    TeachingView.tsx         # 三层可展开讲解
    HouseWheel.tsx           # 十二宫 SVG 轮盘
    QuestionCard.tsx         # 5 种题型 + 深度反馈 + 引导推理
    Layout.tsx / ui.tsx
  pages/
    Home / Courses / Lesson / Encyclopedia / KnowledgeDetail / Quiz / QuizRunner
    ChallengeRunner / ModuleOverview / WrongBook / SelfTest / Daily / Profile
  types/index.ts             # 全部内容模型类型
  App.tsx                    # 路由 + 主题 + 离线提示 + 水合兜底
  main.tsx
scripts/
  check-content.mjs          # npm run check
  verify_ui.py               # 12 页无头渲染验收
  verify_flows.py            # 5 条真实交互链路验收
  gen_icons.py               # PWA 图标生成
```
