import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CircleDollarSign, Clock3, ReceiptText } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

const formatAmount = (amount) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(Number(amount) || 0)

export default function AdminFinance() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const [fees, setFees] = useState([])
  const [loading, setLoading] = useState(Boolean(supabase) && !user?.isDemo)
  const [error, setError] = useState(user?.isDemo
    ? 'Financial records are only available to authenticated Supabase users.'
    : supabase ? '' : 'Supabase is not configured. Check the project environment settings.')
  const section = pathname.split('/').pop()
  const title = section === 'payments'
    ? 'Payments'
    : section === 'accounts'
      ? 'Accounts'
      : section === 'accounts-examination'
        ? 'Account & Examination'
        : 'Fees'

  useEffect(() => {
    let active = true

    const loadFees = async () => {
      if (!supabase || user?.isDemo) return

      const { data, error: queryError } = await supabase
        .from('fees')
        .select('id,student_id,description,amount,status,due_date,paid_date')
        .order('due_date', { ascending: true })

      if (!active) return
      if (queryError) {
        setError(queryError.message)
      } else {
        setFees(data || [])
        setError('')
      }
      setLoading(false)
    }

    loadFees()
    return () => { active = false }
  }, [user?.isDemo])

  const paid = fees.filter((fee) => fee.status === 'Paid')
  const outstanding = fees.filter((fee) => fee.status !== 'Paid')
  const collectedAmount = paid.reduce((total, fee) => total + Number(fee.amount || 0), 0)
  const dueAmount = outstanding.reduce((total, fee) => total + Number(fee.amount || 0), 0)

  return (
    <section className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">{title} & Examination</h1>
        <p className="mt-1 text-sm text-gray-500">Review fee records and exam results with role-scoped access.</p>
      </header>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total fee records', value: loading ? '—' : fees.length, Icon: ReceiptText },
          { label: 'Collected', value: loading ? '—' : formatAmount(collectedAmount), Icon: CircleDollarSign },
          { label: 'Outstanding', value: loading ? '—' : formatAmount(dueAmount), Icon: Clock3 },
        ].map(({ label, value, Icon }) => (
          <article key={label} className="card flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><Icon size={20} /></div>
            <div><p className="text-xs text-gray-500">{label}</p><p className="mt-1 text-xl font-bold text-gray-900">{value}</p></div>
          </article>
        ))}
      </div>

      <div className="card overflow-hidden !p-0">
        <div className="border-b border-gray-100 px-4 py-4 sm:px-5">
          <h2 className="font-semibold text-gray-900">Student fee ledger</h2>
        </div>
        {loading ? <p className="p-5 text-sm text-gray-500">Loading fee records...</p> : fees.length === 0 ? (
          <p className="p-5 text-sm text-gray-500">No fee records are available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Student ID</th>
                  <th className="px-4 py-3">Fee</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Due date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fees.map((fee) => (
                  <tr key={fee.id}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{fee.student_id || '—'}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{fee.description}</td>
                    <td className="px-4 py-3 text-gray-700">{formatAmount(fee.amount)}</td>
                    <td className="px-4 py-3 text-gray-600">{fee.due_date || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${fee.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {fee.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
