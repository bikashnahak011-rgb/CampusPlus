import { Brain, TrendingUp, TrendingDown, Minus, AlertTriangle, Lightbulb } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { DEMO_AI_INSIGHTS } from '../../data/demoData'

const severityConfig = {
  critical: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', icon: 'text-red-600' },
  high: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', icon: 'text-orange-600' },
  medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', icon: 'text-yellow-600' },
}

const trendIcon = { increasing: TrendingUp, decreasing: TrendingDown, stable: Minus }
const trendColor = { increasing: 'text-red-500', decreasing: 'text-green-500', stable: 'text-gray-400' }

export default function AdminAIInsights() {
  const { complaints } = useApp()

  // Dynamically detect recurring issues from live complaint data
  const catCount = {}
  const locCount = {}
  complaints.filter(c => !['Resolved','Closed'].includes(c.status)).forEach(c => {
    catCount[c.category] = (catCount[c.category]||0)+1
    const block = c.location?.match(/Block ([A-Z])/)?.[1]
    if (block) locCount[`Block ${block}`] = (locCount[`Block ${block}`]||0)+1
  })

  const dynamicInsights = Object.entries(catCount)
    .filter(([,count]) => count >= 2)
    .map(([cat, count]) => ({
      id: `dyn-${cat}`,
      severity: count >= 5 ? 'critical' : count >= 3 ? 'high' : 'medium',
      title: `Recurring ${cat} Issues`,
      description: `${count} active ${cat.toLowerCase()} complaints detected.`,
      location: Object.entries(locCount).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'Campus',
      count,
      period: 'Current',
      recommendation: `Investigate ${cat.toLowerCase()} infrastructure. Schedule preventive maintenance.`,
      category: cat,
      trend: count >= 3 ? 'increasing' : 'stable',
    }))

  const allInsights = [...dynamicInsights, ...DEMO_AI_INSIGHTS]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><Brain size={22} className="text-purple-600" /></div>
        <div><h1 className="text-2xl font-bold text-gray-900">AI Insights</h1><p className="text-gray-500 text-sm">Recurring issue detection and recommendations</p></div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-1"><Brain size={18} className="text-purple-600" /><p className="font-semibold text-purple-900">AI Analysis Active</p></div>
        <p className="text-sm text-purple-700">Analyzing {complaints.length} complaints to detect patterns and recurring issues. {dynamicInsights.length > 0 ? `${dynamicInsights.length} live pattern${dynamicInsights.length>1?'s':''} detected.` : 'No new patterns detected.'}</p>
      </div>

      <div className="space-y-4">
        {allInsights.map(insight => {
          const cfg = severityConfig[insight.severity] || severityConfig.medium
          const TrendIcon = trendIcon[insight.trend] || Minus
          return (
            <div key={insight.id} className={`${cfg.bg} border ${cfg.border} rounded-2xl p-5`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <AlertTriangle size={18} className={cfg.icon} />
                    <span className={`badge ${cfg.badge} text-xs uppercase font-bold`}>{insight.severity} — {insight.category}</span>
                    <span className="badge bg-white text-gray-600 text-xs">{insight.period}</span>
                    <div className="flex items-center gap-1">
                      <TrendIcon size={14} className={trendColor[insight.trend]} />
                      <span className={`text-xs font-medium ${trendColor[insight.trend]}`}>{insight.trend}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">🚨 {insight.title}</h3>
                  <p className="text-gray-700 mb-1"><span className="font-semibold">{insight.location}</span> — <span className="text-2xl font-black text-gray-900">{insight.count}</span> {insight.category.toLowerCase()} complaint{insight.count>1?'s':''} {insight.period.toLowerCase()}</p>
                  <p className="text-sm text-gray-600">{insight.description}</p>
                </div>
              </div>
              <div className="mt-4 bg-white/70 rounded-xl p-3 flex items-start gap-2">
                <Lightbulb size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-0.5">Recommendation</p>
                  <p className="text-sm text-gray-700">{insight.recommendation}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {allInsights.length === 0 && (
        <div className="card text-center py-12">
          <Brain size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No recurring issues detected.</p>
          <p className="text-gray-400 text-sm mt-1">AI will flag patterns as complaints come in.</p>
        </div>
      )}
    </div>
  )
}
