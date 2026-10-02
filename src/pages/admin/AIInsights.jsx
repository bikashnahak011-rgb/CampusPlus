import { useEffect, useState } from 'react'
import { Brain, TrendingUp, TrendingDown, Minus, AlertTriangle, Lightbulb, RefreshCw } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { requestBackend } from '../../lib/backendApi'
import { DEMO_AI_INSIGHTS } from '../../data/demoData'
import { buildDynamicInsights, getInsightSummary } from '../../lib/insightFallback'

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

  const dynamicInsights = buildDynamicInsights(complaints)

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
    : backendError || !actionCenter
      ? dynamicInsights
      : liveInsights
  const analysisSummary = getInsightSummary({
    user,
    complaints,
    actionCenter,
    backendError,
    loading,
    dynamicInsights,
  })

  return (
    <div className="space-y-6 p-2 md:p-3">
      <div className="rounded-[28px] border border-[#e9ddf8] bg-[#f2edf9] p-5 md:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 bg-[#f3d8ff] rounded-2xl flex items-center justify-center shadow-inner shadow-white/40"><Brain size={26} className="text-[#7a3db8]" /></div>
            <div className="min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold text-[#2f1f3d] tracking-tight">AI Insights</h1>
              <p className="text-base text-[#66597a]">Recurring issue detection and recommendations</p>
            </div>
          </div>

          {user && !user.isDemo && (
            <button
              onClick={() => { setResult(null); setRetry(value => value + 1) }}
              disabled={loading}
              aria-label="Refresh AI insights"
              className="p-2.5 rounded-xl border border-[#d9cbe8] bg-white/60 text-[#5b4a6f] hover:bg-white disabled:opacity-50 transition-colors"
            >
              <RefreshCw size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="rounded-[30px] border border-[#e7d8f5] bg-[#f4f0f8] p-5 md:p-6">
        <div className="flex items-center gap-2 mb-2">
          <Brain size={18} className="text-[#7a3db8]" />
          <p className="font-semibold text-[#4b2d63] text-xl md:text-2xl">
            {user?.isDemo ? 'Demo Analysis' : backendError ? 'AI Service Unavailable' : loading ? 'Loading AI Analysis' : 'Live AI Analysis'}
          </p>
        </div>
        <p className="text-base text-[#5a4b6b] leading-relaxed">{analysisSummary}</p>
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
