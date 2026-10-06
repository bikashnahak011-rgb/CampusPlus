import { useEffect, useState } from 'react'
import { CreditCard, CheckCircle, Clock, Loader2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { supabase } from '../../lib/supabase'
import { DEMO_FEES } from '../../data/demoData'

export default function FeesPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [paying, setPaying] = useState(null)
  const [fees, setFees] = useState({ total: 0, paid: 0, pending: 0, transactions: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    if (user.isDemo) {
      setFees(DEMO_FEES)
      setLoading(false)
      setError('')
      return
    }
    if (!supabase) {
      setFees({ total: 0, paid: 0, pending: 0, transactions: [] })
      setLoading(false)
      setError('Live fee records are unavailable because Supabase is not configured.')
      return
    }

    let active = true
    setLoading(true)
    setError('')
    const loadFees = async () => {
      const { data, error: queryError } = await supabase.from('fees').select('*').eq('student_id', user.id).order('due_date')
        if (!active) return
        if (queryError) {
          setError(`Could not load fee records: ${queryError.message}`)
          setFees({ total: 0, paid: 0, pending: 0, transactions: [] })
        } else {
          const transactions = (data || []).map(fee => ({
            id: fee.id,
            description: fee.description,
            amount: Number(fee.amount) || 0,
            date: fee.paid_date,
            due_date: fee.due_date,
            status: fee.status,
          }))
          const total = transactions.reduce((sum, fee) => sum + fee.amount, 0)
          const paid = transactions.filter(fee => fee.status === 'Paid').reduce((sum, fee) => sum + fee.amount, 0)
          setFees({ total, paid, pending: total - paid, transactions })
        }
        setLoading(false)
    }

    loadFees()
    const refreshInterval = window.setInterval(() => {
      if (document.visibilityState === 'visible') loadFees()
    }, 5000)

    return () => {
      active = false
      window.clearInterval(refreshInterval)
    }
  }, [user])

  const pct = fees.total ? Math.round((fees.paid / fees.total) * 100) : 0

  const handlePay = async (txn) => {
    setPaying(txn.id)
    await new Promise(r => setTimeout(r, 1500))
    setPaying(null)
    toast(`✓ Payment of ₹${txn.amount.toLocaleString('en-IN')} simulated successfully! (Demo mode)`, 'success')
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Fees & Dues</h1><p className="text-gray-500 text-sm mt-1">Your fee payment status and history</p></div>

      {loading && <div className="card text-sm text-gray-500">Loading fee records...</div>}
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {!loading && !error && fees.transactions.length === 0 && <div className="card py-10 text-center text-sm text-gray-500">No fee records have been published for your account.</div>}
      {!loading && !error && fees.transactions.length > 0 && <>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
          <p className="text-blue-200 text-sm mb-1">Total Fees</p>
          <p className="text-3xl font-black">₹{fees.total.toLocaleString('en-IN')}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <p className="text-green-100 text-sm mb-1">Paid</p>
          <p className="text-3xl font-black">₹{fees.paid.toLocaleString('en-IN')}</p>
        </div>
        <div className="card bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <p className="text-orange-100 text-sm mb-1">Pending</p>
          <p className="text-3xl font-black">₹{fees.pending.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">Payment Progress</p>
          <p className="text-sm font-bold text-blue-600">{pct}%</p>
        </div>
        <div className="internal-meter-track w-full rounded-full h-3" role="progressbar" aria-label="Fee payment progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <div className="internal-meter-fill bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-2">₹{fees.paid.toLocaleString('en-IN')} paid of ₹{fees.total.toLocaleString('en-IN')}</p>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Fee Breakdown</h2>
        <div className="space-y-3">
          {fees.transactions.map(txn => (
            <div key={txn.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${txn.status === 'Paid' ? 'bg-green-100' : 'bg-orange-100'}`}>
                  {txn.status === 'Paid' ? <CheckCircle size={20} className="text-green-600" /> : <Clock size={20} className="text-orange-600" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{txn.description}</p>
                  <p className="text-xs text-gray-400">{txn.date ? `Paid on ${txn.date}` : `Payment pending${txn.due_date ? ` • Due ${txn.due_date}` : ''}`} • {txn.id}</p>
                </div>
              </div>
              <div className="text-right flex items-center gap-3">
                <div>
                  <p className="font-bold text-gray-900">₹{txn.amount.toLocaleString('en-IN')}</p>
                  <span className={`badge text-xs ${txn.status === 'Paid' ? 'status-approved' : 'status-pending'}`}>{txn.status}</span>
                </div>
                {user?.isDemo && txn.status === 'Pending' && (
                  <button onClick={() => handlePay(txn)} disabled={paying === txn.id} className="btn-primary text-xs py-1.5 px-3">
                    {paying === txn.id ? <Loader2 size={14} className="animate-spin" /> : <><CreditCard size={14} /> Pay Now</>}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-sm text-yellow-800">
        {user?.isDemo
          ? <><p className="font-semibold mb-1">Demo Mode</p><p>Payments are simulated; no real transaction is processed.</p></>
          : <><p className="font-semibold mb-1">Online payment is not configured</p><p>Use your campus accounts office or its official payment portal. No payment has been made through this page.</p></>}
      </div>
      </>}
    </div>
  )
}
