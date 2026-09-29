import { useEffect, useState } from 'react'
import { Brain, TrendingUp, TrendingDown, Minus, AlertTriangle, Lightbulb, RefreshCw } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { requestBackend } from '../../lib/backendApi'
import { DEMO_AI_INSIGHTS } from '../../data/demoData'

const severityConfig = {
  critical: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', icon: 'text-red-600' },
  high: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', icon: 'text-orange-600' },
  medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', icon: 'text-yellow-600' },
  low: { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-700', icon: 'text-gray-500' },
}

const trendIcon = { increasing: TrendingUp, decreasing: TrendingDown, stable: Minus }
const trendColor = { increasing: 'text-red-500', decreasing: 'text-green-500', stable: 'text-gray-400' }

export default function AdminAIInsights() {
  const { complaints } = useApp()
  const { user } = useAuth()
  const [result, setResult] = useState(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    if (!user || user.isDemo) return

    let active = true
    requestBackend('insights/action-center')
      .then(data => {
        if (active) setResult({ userId: user.id, data, error: null })
      })
      .catch(error => {
        if (active) setResult({ userId: user.id, data: null, error: error.message })
      })

    return () => { active = false }
  }, [user, retry])

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

  const hasLiveResult = result?.userId === user?.id
  const actionCenter = hasLiveResult ? result.data : null
  const backendError = hasLiveResult ? result.error : null
  const loading = Boolean(user && !user.isDemo && !hasLiveResult)

  const liveInsights = [
    ...(actionCenter?.incident_clusters || []).map((cluster, index) => ({
      id: `cluster-${cluster.category}-${index}`,
      severity: String(cluster.severity || 'low').toLowerCase(),
      title: `Recurring ${cluster.category} incident`,
      description: `${cluster.reports} related reports from ${cluster.affected_students} students.`,
      location: cluster.location || 'Campus',
      count: cluster.reports,
      period: 'Active',
      recommendation: 'Review the affected location and coordinate a response with the responsible department.',
      category: cluster.category,
      trend: 'stable',
    })),
    ...(actionCenter?.top_hotspots || [])
      .filter(([, count]) => count >= 2)
      .map(([location, count]) => ({
        id: `hotspot-${location}`,
        severity: count >= 5 ? 'critical' : count >= 3 ? 'high' : 'medium',
        title: 'Complaint hotspot',
        description: `${count} unresolved complaints are reported at this location.`,
        location,
        count,
        period: 'Active',
        recommendation: 'Inspect this location and check whether a shared infrastructure issue is causing repeat reports.',
        category: 'Campus operations',
        trend: 'stable',
      })),
    ...(actionCenter?.attendance_below_required > 0 ? [{
      id: 'attendance-risk',
      severity: 'high',
      title: 'Students below attendance requirement',
      description: `${actionCenter.attendance_below_required} students are below ${actionCenter.attendance_required}% attendance.`,
      location: 'Across campus',
      count: actionCenter.attendance_below_required,
      period: 'Current',
      recommendation: 'Review attendance records and follow up with students at risk.',
      category: 'Attendance',
      trend: 'stable',
    }] : []),
  ]

  const allInsights = user?.isDemo
    ? [...dynamicInsights, ...DEMO_AI_INSIGHTS]
    : liveInsights
  const analysisSummary = user?.isDemo
    ? `Demo data: ${complaints.length} complaints checked. ${dynamicInsights.length} local pattern${dynamicInsights.length === 1 ? '' : 's'} detected.`
    : backendError
      ? `Live analysis is unavailable: ${backendError}`
      : loading
        ? 'Loading live campus data from the AI service…'
        : `Live analysis: ${actionCenter.unresolved_complaints} unresolved complaints, ${actionCenter.high_priority_complaints} high priority, and ${actionCenter.attendance_below_required} students below attendance requirement.`

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><Brain size={22} className="text-purple-600" /></div>
        <div className="flex-1"><h1 className="text-2xl font-bold text-gray-900">AI Insights</h1><p className="text-gray-500 text-sm">Recurring issue detection and recommendations</p></div>
        {user && !user.isDemo && <button onClick={() => { setResult(null); setRetry(value => value + 1) }} disabled={loading} aria-label="Refresh AI insights" className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50"><RefreshCw size={18} /></button>}
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-1"><Brain size={18} className="text-purple-600" /><p className="font-semibold text-purple-900">{user?.isDemo ? 'Demo Analysis' : backendError ? 'AI Service Unavailable' : loading ? 'Loading AI Analysis' : 'Live AI Analysis'}</p></div>
        <p className="text-sm text-purple-700">{analysisSummary}</p>
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

      {!loading && !backendError && allInsights.length === 0 && (
        <div className="card text-center py-12">
          <Brain size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No recurring issues detected.</p>
          <p className="text-gray-400 text-sm mt-1">Insights will appear when the live data contains a recurring pattern.</p>
        </div>
      )}
    </div>
  )
}
