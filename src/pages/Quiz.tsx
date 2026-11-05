import { useNavigate } from 'react-router-dom'
import { CalendarCheck, AlertCircle, Shuffle, RefreshCw, Layers, ChevronRight } from 'lucide-react'
import { useStore, dueReviewCount } from '../lib/store'
import { QUESTIONS } from '../data/questions'
import { getByCategory } from '../data'
import { CATEGORY_LABEL } from '../data'
import type { KnowledgeCategory } from '../types'
import { Card } from '../components/ui'

const TOPIC_CATS: KnowledgeCategory[] = [
  'zodiac',
  'planet',
  'house',
  'aspect',
  'element',
  'modality',
  'term',
]

export default function Quiz() {
  const navigate = useNavigate()
  const store = useStore()
  const wrongCount = Object.keys(store.wrongQuestions).length
  const due = dueReviewCount(store)

  return (
    <div className="fade-up space-y-5 pt-2">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">知识测验</h1>
        <p className="text-dim text-sm mt-1">四种题型 · 间隔重复巩固记忆</p>
      </header>

      {/* 主要模式 */}
      <div className="space-y-3">
        <Card onClick={() => navigate('/quiz/daily')} className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-lilac/20 text-primary">
            <CalendarCheck size={22} />
          </div>
          <div className="flex-1">
            <div className="font-semibold">每日练习</div>
            <div className="text-sm text-dim">每天一组精选题目，保持手感</div>
          </div>
          <ChevronRight size={18} className="text-dim" />
        </Card>

        <Card onClick={() => navigate('/quiz/review')} className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gold/20 text-accent">
            <RefreshCw size={22} />
          </div>
          <div className="flex-1">
            <div className="font-semibold">智能复习</div>
            <div className="text-sm text-dim">
              {due > 0 ? `今天有 ${due} 个知识点到期` : '暂无到期知识点，状态良好'}
            </div>
          </div>
          <ChevronRight size={18} className="text-dim" />
        </Card>

        <Card onClick={() => navigate('/quiz/random')} className="flex items-center gap-4">
          <div className="p-3 rounded-xl surface-2 text-primary">
            <Shuffle size={22} />
          </div>
          <div className="flex-1">
            <div className="font-semibold">随机复习</div>
            <div className="text-sm text-dim">从题库随机抽取，查漏补缺</div>
          </div>
          <ChevronRight size={18} className="text-dim" />
        </Card>

        <Card
          onClick={() => wrongCount > 0 && navigate('/quiz/wrong')}
          className={`flex items-center gap-4 ${wrongCount === 0 ? 'opacity-60' : 'cursor-pointer'}`}
        >
          <div className="p-3 rounded-xl bg-red-500/15 text-red-400">
            <AlertCircle size={22} />
          </div>
          <div className="flex-1">
            <div className="font-semibold">错题练习</div>
            <div className="text-sm text-dim">
              {wrongCount > 0 ? `${wrongCount} 道待巩固` : '还没有错题，很棒！'}
            </div>
          </div>
          <ChevronRight size={18} className="text-dim" />
        </Card>
      </div>

      {/* 专题练习 */}
      <div>
        <h2 className="text-lg font-bold mb-2 flex items-center gap-1">
          <Layers size={16} className="text-primary" /> 专题练习
        </h2>
        <div className="grid grid-cols-2 gap-2.5">
          {TOPIC_CATS.map((c) => {
            const n = getByCategory(c).length
            return (
              <button
                key={c}
                onClick={() => navigate(`/quiz/topic?cat=${c}`)}
                className="tap surface rounded-xl p-4 text-left border border-token hover:brightness-110"
              >
                <div className="font-semibold">{CATEGORY_LABEL[c]}</div>
                <div className="text-xs text-dim mt-0.5">{n} 张知识卡</div>
              </button>
            )
          })}
        </div>
      </div>

      <p className="text-xs text-dim text-center">
        题库共 {QUESTIONS.length} 道题 · 含单选 / 判断 / 匹配 / 推理
      </p>
    </div>
  )
}
