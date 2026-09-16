import { useState } from 'react'
import { CreditCard, CheckCircle, Clock, Loader2 } from 'lucide-react'
import { useToast } from '../../components/ui/Toast'
import { DEMO_FEES } from '../../data/demoData'

export default function FeesPage() {
  const toast = useToast()
  const [paying, setPaying] = useState(null)
  const pct = Math.round((DEMO_FEES.paid / DEMO_FEES.total) * 100)

  const handlePay = async (txn) => {
    setPaying(txn.id)
    await new Promise(r => setTimeout(r, 1500))
    setPaying(null)
    toast(`✓ Payment of ₹${txn.amount.toLocaleString('en-IN')} simulated successfully! (Demo mode)`, 'success')
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Fees & Dues</h1><p className="text-gray-500 text-sm mt-1">Your fee payment status and history</p></div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
          <p className="text-blue-200 text-sm mb-1">Total Fees</p>
          <p className="text-3xl font-black">₹{DEMO_FEES.total.toLocaleString('en-IN')}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <p className="text-green-100 text-sm mb-1">Paid</p>
          <p className="text-3xl font-black">₹{DEMO_FEES.paid.toLocaleString('en-IN')}</p>
        </div>
        <div className="card bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <p className="text-orange-100 text-sm mb-1">Pending</p>
          <p className="text-3xl font-black">₹{DEMO_FEES.pending.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">Payment Progress</p>
          <p className="text-sm font-bold text-blue-600">{pct}%</p>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-2">₹{DEMO_FEES.paid.toLocaleString('en-IN')} paid of ₹{DEMO_FEES.total.toLocaleString('en-IN')}</p>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Fee Breakdown</h2>
        <div className="space-y-3">
          {DEMO_FEES.transactions.map(txn => (
            <div key={txn.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${txn.status === 'Paid' ? 'bg-green-100' : 'bg-orange-100'}`}>
                  {txn.status === 'Paid' ? <CheckCircle size={20} className="text-green-600" /> : <Clock size={20} className="text-orange-600" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{txn.description}</p>
                  <p className="text-xs text-gray-400">{txn.date ? `Paid on ${txn.date}` : 'Payment pending'} • {txn.id}</p>
                </div>
              </div>
              <div className="text-right flex items-center gap-3">
                <div>
                  <p className="font-bold text-gray-900">₹{txn.amount.toLocaleString('en-IN')}</p>
                  <span className={`badge text-xs ${txn.status === 'Paid' ? 'status-approved' : 'status-pending'}`}>{txn.status}</span>
                </div>
                {txn.status === 'Pending' && (
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
        <p className="font-semibold mb-1">⚠ Demo Mode</p>
        <p>Payment is simulated for hackathon demo. No real transactions are processed.</p>
      </div>
    </div>
  )
}
