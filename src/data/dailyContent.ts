import type { DailyContent } from '../types'

export const DAILY_SIGNS: { id: string; name: string; en: string; symbol: string }[] = [
  { id: 'z-aries', name: '白羊座', en: 'Aries', symbol: '♈' },
  { id: 'z-taurus', name: '金牛座', en: 'Taurus', symbol: '♉' },
  { id: 'z-gemini', name: '双子座', en: 'Gemini', symbol: '♊' },
  { id: 'z-cancer', name: '巨蟹座', en: 'Cancer', symbol: '♋' },
  { id: 'z-leo', name: '狮子座', en: 'Leo', symbol: '♌' },
  { id: 'z-virgo', name: '处女座', en: 'Virgo', symbol: '♍' },
  { id: 'z-libra', name: '天秤座', en: 'Libra', symbol: '♎' },
  { id: 'z-scorpio', name: '天蝎座', en: 'Scorpio', symbol: '♏' },
  { id: 'z-sagittarius', name: '射手座', en: 'Sagittarius', symbol: '♐' },
  { id: 'z-capricorn', name: '摩羯座', en: 'Capricorn', symbol: '♑' },
  { id: 'z-aquarius', name: '水瓶座', en: 'Aquarius', symbol: '♒' },
  { id: 'z-pisces', name: '双鱼座', en: 'Pisces', symbol: '♓' },
]

interface DailyEntry {
  theme: string
  relationship: string
  work: string
  reflection: string
}

// 每个星座 4 条轮换内容（按日期确定性选择）
export const DAILY_CONTENT: Record<string, DailyEntry[]> = {
  'z-aries': [
    { theme: '先启动，再完善', relationship: '今天适合主动表达，别等对方先开口。', work: '把拖延的事立刻开个头， momentum 比完美重要。', reflection: '我最近是不是把「准备」当成了「逃避」？' },
    { theme: '把火用对地方', relationship: '直接一点反而更被信任，绕弯易生误会。', work: '选一件最想做的事全力推进，别分散火力。', reflection: '我的冲劲是服务于目标，还是服务于情绪？' },
    { theme: '允许自己慢半拍', relationship: '温柔的坚持比硬碰硬更有力量。', work: '给重要任务设一个明确的开始时间。', reflection: '我能否在行动前先问自己「为什么」？' },
    { theme: '做自己的先锋', relationship: '今天可以主动约人，别等被邀请。', work: '把大目标拆成「今天就能做」的一小步。', reflection: '我害怕的到底是失败，还是被看见？' },
  ],
  'z-taurus': [
    { theme: '稳住，就能赢', relationship: '用实际的陪伴代替漂亮话。', work: '今天适合把流程理顺，建立可重复的小习惯。', reflection: '我追求的安全感，有多少来自外在，多少来自内心？' },
    { theme: '享受具体的好', relationship: '一顿好饭、一次散步，比争论更修复关系。', work: '把混乱的待办整理成清晰清单。', reflection: '我是否把「拥有」误当成了「安心」？' },
    { theme: '小步积累', relationship: '稳定地回应，比偶尔的浪漫更打动人。', work: '为长期目标每天固定投入一点时间。', reflection: '我在哪件事上该再多一点耐心？' },
    { theme: '尊重自己的节奏', relationship: '不必为了迎合别人而匆忙决定。', work: '先完成再优化，别卡在细节里。', reflection: '我的固执，是在保护价值，还是在抗拒成长？' },
  ],
  'z-gemini': [
    { theme: '连接带来灵感', relationship: '今天适合多聊、多问，信息会自然流动。', work: '用交流推进卡住的事，别一个人硬想。', reflection: '我是在真正理解，还是在收集观点？' },
    { theme: '聚焦一个兴趣', relationship: '简短真诚的消息，好过长篇客套。', work: '给自己设「只做一件事」的时段，防分心。', reflection: '我的好奇，有没有深入到能变成能力？' },
    { theme: '把想法说出来', relationship: '分享你的看法，会引来同频的人。', work: '把零散笔记连成一条主线。', reflection: '我是否用「知道很多」回避「选一个」？' },
    { theme: '换个角度看看', relationship: '今天试着理解对方的言外之意。', work: '用新方法处理老问题，会有新发现。', reflection: '我的灵活，是适应还是逃避承诺？' },
  ],
  'z-cancer': [
    { theme: '照顾好自己，才能照顾别人', relationship: '今天适合向信任的人表达需要。', work: '在熟悉的环境里效率更高，别硬撑。', reflection: '我把多少情绪憋成了「没事」？' },
    { theme: '家是充电站', relationship: '一句关心胜过千言万语。', work: '把工作与休息的边界划清楚。', reflection: '我的敏感，是感知力还是内耗？' },
    { theme: '记住温暖的事', relationship: '主动维系一段重要的关系。', work: '用节奏感代替突击式努力。', reflection: '我能否既柔软，又有边界？' },
    { theme: '允许情绪流动', relationship: '今天不必假装坚强。', work: '把情绪写下来，思路会清晰。', reflection: '我记着的，是恩情还是委屈？' },
  ],
  'z-leo': [
    { theme: '你值得被看见', relationship: '大方表达，你的热情会感染人。', work: '承担一个你能发光的角色。', reflection: '我要的被看见，是分享还是证明？' },
    { theme: '慷慨是一种力量', relationship: '今天给身边人一点鼓励，关系更近。', work: '把创意落成一个具体作品。', reflection: '我的自信，来自实力还是掌声？' },
    { theme: '做自己的观众', relationship: '别等别人认可，先认可自己。', work: '公开分享你的进展，会有支持者。', reflection: '我在意谁的眼光，又为何在意？' },
    { theme: '燃烧但有方向', relationship: '真诚比炫目更持久。', work: '把热度投向长期有价值的事。', reflection: '我的光，照亮点亮了谁？' },
  ],
  'z-virgo': [
    { theme: '把事做对一点点', relationship: '用实在的帮助表达关心。', work: '今天优化一个反复出错的流程。', reflection: '我的挑剔，是在改进还是在苛责？' },
    { theme: '细节里藏着系统', relationship: '具体指出问题，比抱怨更有用。', work: '把大任务拆成可检查的清单。', reflection: '我是否在用「忙」回避感受？' },
    { theme: '完成胜过完美', relationship: '接纳对方的不完美，关系更轻松。', work: '先交付 80 分版本，再迭代。', reflection: '我能否对自己也宽容一点？' },
    { theme: '服务他人也服务自己', relationship: '今天也别忘了照顾自己的需要。', work: '建立一个小而稳的日常习惯。', reflection: '我的价值，是否只等于「有用」？' },
  ],
  'z-libra': [
    { theme: '平衡不是平均', relationship: '今天主动调解一处失衡。', work: '在两种选项间，按价值而非情绪选。', reflection: '我的犹豫，是在权衡还是在逃避？' },
    { theme: '美让关系更好', relationship: '一点仪式感能修复日常。', work: '把工作环境整理得更舒服。', reflection: '我是否在讨好中丢了自己？' },
    { theme: '先连接再决定', relationship: '先听懂，再回应。', work: '找一位伙伴一起推进，效率更高。', reflection: '我的和谐，是真实还是妥协？' },
    { theme: '为自己选一次', relationship: '今天也问问自己想要什么。', work: '给重要关系留出专属时间。', reflection: '我怕冲突，还是怕失去连接？' },
  ],
  'z-scorpio': [
    { theme: '看穿表象', relationship: '今天值得一次诚实的深度对话。', work: '盯住一个核心问题，挖到根。', reflection: '我的控制，是在保护还是在恐惧？' },
    { theme: '忠诚最珍贵', relationship: '对信任的人多给一点确定性。', work: '把精力集中在能带来转变的事。', reflection: '我把多少力气耗在「猜」上？' },
    { theme: '允许自己转化', relationship: '放下一段旧账，关系会变轻。', work: '结束一个该结束的事，才能开始新的。', reflection: '我的深度，是洞察还是执念？' },
    { theme: '沉默也有力量', relationship: '不是每句感受都要立刻说出口。', work: '用结果代替辩解。', reflection: '我敢不敢承认自己的脆弱？' },
  ],
  'z-sagittarius': [
    { theme: '向外走一步', relationship: '今天适合约人聊点「大」的话题。', work: '给任务加上「意义」，动力会回来。', reflection: '我的自由，是探索还是逃离？' },
    { theme: '相信可能性', relationship: '一句鼓励能点亮别人一天。', work: '学一个新鲜东西，开阔思路。', reflection: '我是否用乐观跳过了该面对的？' },
    { theme: '把远见落地', relationship: '把你的想法分享给能帮你的人。', work: '定一个「本月小目标」。', reflection: '我的直率，有没有伤到人不自知？' },
    { theme: '在路上成长', relationship: '今天主动联系一位远方的朋友。', work: '用旅行/阅读/课程拓展视野。', reflection: '我追求的，是体验还是证明？' },
  ],
  'z-capricorn': [
    { theme: '时间是你的盟友', relationship: '稳定地在场，比浪漫更可靠。', work: '今天推进一个长期计划的具体一步。', reflection: '我的责任，是担当还是自我压迫？' },
    { theme: '结构带来自由', relationship: '用行动而非语言表态。', work: '把目标拆成季度、月度、周计划。', reflection: '我是否把「成就」当成了「被爱」的筹码？' },
    { theme: '扛得住，也放得下', relationship: '今天允许自己示弱一次。', work: '在危机里反而最清醒，用它。', reflection: '我的冷淡，是保护还是隔离？' },
    { theme: '建一座能久的塔', relationship: '对重要的人给出长期承诺。', work: '宁可慢，但要稳。', reflection: '我怕的，是失败还是无意义？' },
  ],
  'z-aquarius': [
    { theme: '不一样也没关系', relationship: '今天接纳彼此的差异，关系更松。', work: '用一个新工具/新思路提效。', reflection: '我的独立，是自由还是疏离？' },
    { theme: '为群体想一点', relationship: '帮朋友解决一个共同问题。', work: '把个人项目连接到更大的目标。', reflection: '我是否在理性中忽略了感受？' },
    { theme: '保持好奇', relationship: '和不同想法的人聊一次。', work: '试验一个非常规方案。', reflection: '我的叛逆，是觉醒还是习惯？' },
    { theme: '未来从现在开始', relationship: '今天给朋友一个真诚的肯定。', work: '为半年后的自己铺一步。', reflection: '我理想中的世界，今天能做哪一点？' },
  ],
  'z-pisces': [
    { theme: '感受是天赋', relationship: '今天用心听，不急着给建议。', work: '用想象开启一个创作，再补逻辑。', reflection: '我的共情，有没有吞没自己？' },
    { theme: '给梦想一点形状', relationship: '温柔地对待在意的人。', work: '把模糊的想法写下来，会变清晰。', reflection: '我是在灵感中，还是在逃避中？' },
    { theme: '柔软但有边界', relationship: '学会说「不」，关系更健康。', work: '给飘散的精力定一个落点。', reflection: '我把多少别人的情绪扛成了自己的？' },
    { theme: '相信直觉', relationship: '今天相信第一感觉一次。', work: '用艺术/音乐给大脑充电。', reflection: '我的消融，是慈悲还是迷失？' },
  ],
}

const DISCLAIMER =
  '以上内容由本地预设内容库按日期确定性生成，用于自我反思与娱乐，并非依据实时天象的真实预测，也不构成任何建议。占星对人格与未来的解释未被科学证实。'

export function getDailyContent(signId: string, date: Date): DailyContent {
  const sign = DAILY_SIGNS.find((s) => s.id === signId) ?? DAILY_SIGNS[0]
  const entries = DAILY_CONTENT[sign.id] ?? DAILY_CONTENT['z-aries']
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000,
  )
  const idx = ((dayOfYear % entries.length) + entries.length) % entries.length
  const e = entries[idx]
  return {
    sign: sign.name,
    signEn: sign.en,
    symbol: sign.symbol,
    theme: e.theme,
    relationship: e.relationship,
    work: e.work,
    reflection: e.reflection,
    disclaimer: DISCLAIMER,
  }
}
