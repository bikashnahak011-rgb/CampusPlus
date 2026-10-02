export function buildDynamicInsights(complaints = []) {
  const catCount = {}
  const locCount = {}

  complaints
    .filter((complaint) => !['Resolved', 'Closed'].includes(complaint.status))
    .forEach((complaint) => {
      const category = complaint.category || 'General'
      catCount[category] = (catCount[category] || 0) + 1

      const match = complaint.location?.match(/Block ([A-Z])/i)?.[1]
      const blockName = match ? `Block ${match.toUpperCase()}` : complaint.location || 'Campus'
      locCount[blockName] = (locCount[blockName] || 0) + 1
    })

  return Object.entries(catCount)
    .filter(([, count]) => count >= 2)
    .map(([category, count]) => {
      const location = Object.entries(locCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Campus'

      return {
        id: `dyn-${category}`,
        severity: count >= 5 ? 'critical' : count >= 3 ? 'high' : 'medium',
        title: `Recurring ${category} Issues`,
        description: `${count} active ${category.toLowerCase()} complaints detected.`,
        location,
        count,
        period: 'Current',
        recommendation: `Investigate ${category.toLowerCase()} infrastructure. Schedule preventive maintenance.`,
        category,
        trend: count >= 3 ? 'increasing' : 'stable',
      }
    })
}

export function getInsightSummary({ user, complaints, actionCenter, backendError, loading, dynamicInsights }) {
  if (user?.isDemo) {
    return `Demo data: ${complaints.length} complaints checked. ${dynamicInsights.length} local pattern${dynamicInsights.length === 1 ? '' : 's'} detected.`
  }

  if (backendError) {
    return `Live AI service unavailable. Showing local campus pattern analysis instead.`
  }

  if (loading) {
    return 'Loading live campus data from the AI service…'
  }

  if (!actionCenter) {
    return `${dynamicInsights.length} local pattern${dynamicInsights.length === 1 ? '' : 's'} detected while the live service is unavailable.`
  }

  return `Live analysis: ${actionCenter.unresolved_complaints} unresolved complaints, ${actionCenter.high_priority_complaints} high priority, and ${actionCenter.attendance_below_required} students below attendance requirement.`
}
