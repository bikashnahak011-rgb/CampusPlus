import { DEMO_ADMIN_FEES } from '../data/demoData'

export default function DemoDataBanner({ user, complaints, students, examResults }) {
  if (!user?.isDemo) return null

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-900">
      <p className="font-semibold">Demo workspace · sample data</p>
      <p className="mt-1 text-xs text-violet-700">
        {complaints !== undefined && `${complaints} complaints`}
        {students !== undefined && ` · ${students} students`}
        {examResults !== undefined && ` · ${examResults} results`}
        {` · ${DEMO_ADMIN_FEES.length} fee records`}
      </p>
    </div>
  )
}
