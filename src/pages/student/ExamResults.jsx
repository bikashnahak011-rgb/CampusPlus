import { Award, BookOpen, TrendingUp } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import { EmptyState } from '../../components/ui/States'

export default function StudentExamResults() {
  const { user } = useAuth()
  const { examResults } = useApp()
  const results = examResults
    .filter(result => result.student_id === user?.id && result.published)
    .sort((first, second) => new Date(second.published_at || second.created_at) - new Date(first.published_at || first.created_at))
  const latestCgpa = results.find(result => result.result_type === 'CGPA')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><Award size={22} /></div>
        <div><h1 className="text-2xl font-bold text-gray-900">Exam Results</h1><p className="mt-1 text-sm text-gray-500">Your published marks and grades</p></div>
      </div>

      {results.length === 0
        ? <div className="card py-12"><EmptyState message="No exam results have been published for you yet." icon={Award} /></div>
        : <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="card flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><TrendingUp size={19} /></div><div><p className="text-2xl font-bold text-gray-900">{latestCgpa ? Number(latestCgpa.result_value).toFixed(2) : '--'}</p><p className="text-xs text-gray-500">Latest CGPA</p></div></div>
            <div className="card flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700"><BookOpen size={19} /></div><div><p className="text-2xl font-bold text-gray-900">{results.length}</p><p className="text-xs text-gray-500">Published GPA results</p></div></div>
          </div>

          <div className="space-y-4">
            {results.map(result => {
              return <article key={result.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0"><p className="text-xs font-semibold uppercase text-cyan-700">Semester {result.semester} · {result.academic_year}</p><h2 className="mt-1 text-lg font-semibold text-gray-900">{result.result_type || 'Legacy result'}</h2></div>
                  <span className="flex h-11 min-w-11 items-center justify-center rounded-xl bg-emerald-50 px-3 text-lg font-bold text-emerald-700">{result.result_value == null ? '--' : Number(result.result_value).toFixed(2)}</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">GPA out of 10</p>
                <p className="mt-3 text-xs text-gray-400">Published {new Date(result.published_at || result.created_at).toLocaleDateString('en-IN')}</p>
              </article>
            })}
          </div>
        </>}
    </div>
  )
}