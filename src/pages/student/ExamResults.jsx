import { Award, BookOpen, TrendingUp } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import { EmptyState } from '../../components/ui/States'

function percentage(result) {
  return result.max_marks ? Number(result.marks_obtained) / Number(result.max_marks) * 100 : 0
}

function grade(value) {
  if (value >= 90) return 'A+'
  if (value >= 80) return 'A'
  if (value >= 70) return 'B'
  if (value >= 60) return 'C'
  if (value >= 50) return 'D'
  if (value >= 40) return 'E'
  return 'F'
}

export default function StudentExamResults() {
  const { user } = useAuth()
  const { examResults } = useApp()
  const results = examResults
    .filter(result => result.student_id === user?.id && result.published)
    .sort((first, second) => new Date(second.published_at || second.created_at) - new Date(first.published_at || first.created_at))
  const totalMarks = results.reduce((sum, result) => sum + Number(result.marks_obtained || 0), 0)
  const maximumMarks = results.reduce((sum, result) => sum + Number(result.max_marks || 0), 0)
  const average = maximumMarks ? totalMarks / maximumMarks * 100 : 0
  const exams = new Set(results.map(result => `${result.exam_name}-${result.academic_year}-${result.semester}`)).size

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
            <div className="card flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><TrendingUp size={19} /></div><div><p className="text-2xl font-bold text-gray-900">{average.toFixed(1)}%</p><p className="text-xs text-gray-500">Overall marks average</p></div></div>
            <div className="card flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700"><BookOpen size={19} /></div><div><p className="text-2xl font-bold text-gray-900">{exams}</p><p className="text-xs text-gray-500">Published exam{exams === 1 ? '' : 's'} · {results.length} subjects</p></div></div>
          </div>

          <div className="space-y-4">
            {results.map(result => {
              const score = percentage(result)
              return <article key={result.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0"><p className="text-xs font-semibold uppercase text-cyan-700">Semester {result.semester} · {result.academic_year}</p><h2 className="mt-1 text-lg font-semibold text-gray-900">{result.subject}</h2><p className="text-sm text-gray-500">{result.subject_code} · {result.exam_name}</p></div>
                  <span className="flex h-11 min-w-11 items-center justify-center rounded-xl bg-emerald-50 px-3 text-lg font-bold text-emerald-700">{grade(score)}</span>
                </div>
                <div className="mt-5 grid items-end gap-3 sm:grid-cols-[1fr_auto]">
                  <div><div className="mb-1 flex justify-between text-xs text-gray-500"><span>Marks</span><span>{score.toFixed(1)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-cyan-600" style={{ width: `${Math.min(100, score)}%` }} /></div></div>
                  <p className="text-right text-sm font-semibold text-gray-800">{result.marks_obtained} <span className="font-normal text-gray-400">/ {result.max_marks}</span></p>
                </div>
                <p className="mt-3 text-xs text-gray-400">Published {new Date(result.published_at || result.created_at).toLocaleDateString('en-IN')}</p>
              </article>
            })}
          </div>
        </>}
    </div>
  )
}