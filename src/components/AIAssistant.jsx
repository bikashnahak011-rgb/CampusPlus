import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import { DEMO_MESS_MENU, DEMO_SUBJECTS } from '../data/demoData'

const QUICK = ["What is today's mess menu?", "How do I apply for a gate pass?", "What is my attendance?", "How to report a complaint?"]

function getResponse(msg, user) {
  const lower = msg.toLowerCase()
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const menu = DEMO_MESS_MENU[today]
  if (lower.includes('mess') || lower.includes('menu') || lower.includes('food')) {
    return `Today is ${today}. Here's the menu:\n🌅 Breakfast: ${menu?.breakfast}\n☀️ Lunch: ${menu?.lunch}\n🌙 Dinner: ${menu?.dinner}\n\nView the full weekly menu in the Mess section.`
  }
  if (lower.includes('attendance')) {
    const avg = Math.round(DEMO_SUBJECTS.reduce((s, sub) => s + (sub.present / sub.total) * 100, 0) / DEMO_SUBJECTS.length)
    const low = DEMO_SUBJECTS.filter(s => (s.present / s.total) * 100 < 80)
    return `Your overall attendance is ~${avg}%. ${low.length > 0 ? `⚠️ ${low.map(s => s.name).join(', ')} ${low.length > 1 ? 'are' : 'is'} below 80%.` : 'All subjects are above 80%.'}\n\nGo to Attendance page for details.`
  }
  if (lower.includes('gate pass') || lower.includes('gatepass')) {
    return `To apply for a Gate Pass:\n1. Go to Leave & Gate Pass in the sidebar\n2. Click "New Request"\n3. Select "Gate Pass"\n4. Fill in destination, date, and time\n5. Submit for approval\n\nYou'll get notified once approved.`
  }
  if (lower.includes('bonafide') || lower.includes('certificate') || lower.includes('document')) {
    return `To request a Bonafide Certificate:\n1. Go to Documents in the sidebar\n2. Click "New Request"\n3. Select "Bonafide Certificate"\n4. Enter the reason\n5. Submit\n\nAdmin will review and you'll be notified when ready.`
  }
  if (lower.includes('complaint') || lower.includes('problem') || lower.includes('issue') || lower.includes('water') || lower.includes('electric') || lower.includes('leak')) {
    return `To report a problem:\n1. Go to Complaints in the sidebar\n2. Click "Report a Problem"\n3. Describe your issue — AI will auto-categorize it\n4. Submit\n\nYou'll get a complaint ID and can track status in real-time.`
  }
  if (lower.includes('fee') || lower.includes('payment') || lower.includes('due')) {
    return `View your fee details in Fees & Dues section.\nPending amount: ₹15,000\n\nFor payment, visit the accounts office or use the online payment portal.`
  }
  if (lower.includes('hostel') || lower.includes('room') || lower.includes('warden')) {
    return `You are in Hostel Block A, Room 203.\nWarden: Mr. Suresh Nair (📞 9876500001)\n\nFor hostel issues, use the Complaints section or visit the Hostel page.`
  }
  if (lower.includes('leave')) {
    return `To apply for leave:\n1. Go to Leave & Gate Pass\n2. Click "New Request"\n3. Select "Leave"\n4. Fill in dates, destination, and reason\n5. Submit\n\nLeave requests need warden and admin approval.`
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return `Hello ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your Campus AI assistant.\n\nI can help with:\n• Mess menu\n• Attendance info\n• Complaints & requests\n• Gate pass & leave\n• Documents & fees\n\nWhat do you need?`
  }
  return `I can help with campus services like mess menu, attendance, complaints, gate pass, documents, and fees. Try asking something specific or use the quick questions below!`
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ id: 1, role: 'assistant', text: "Hi! I'm your Campus AI assistant 🎓 Ask me anything about campus services, mess menu, attendance, complaints, or how to use CampusOne!" }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg) return
    setInput('')
    setMessages(p => [...p, { id: Date.now(), role: 'user', text: msg }])
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    setMessages(p => [...p, { id: Date.now() + 1, role: 'assistant', text: getResponse(msg, user) }])
    setLoading(false)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-2 transition-all hover:scale-105">
        <MessageCircle size={20} /><span className="text-sm font-medium hidden sm:block">Ask Campus AI</span>
      </button>
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col animate-slide-up" style={{ height: 480 }}>
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><Bot size={16} className="text-white" /></div>
              <div><p className="text-white font-semibold text-sm">Campus AI</p><p className="text-blue-200 text-xs">Always here to help</p></div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white"><X size={18} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(m => (
              <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'assistant' ? 'bg-blue-100' : 'bg-gray-200'}`}>
                  {m.role === 'assistant' ? <Bot size={14} className="text-blue-600" /> : <User size={14} className="text-gray-600" />}
                </div>
                <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm whitespace-pre-line ${m.role === 'assistant' ? 'bg-gray-100 text-gray-800' : 'bg-blue-600 text-white'}`}>{m.text}</div>
              </div>
            ))}
            {loading && <div className="flex gap-2"><div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center"><Bot size={14} className="text-blue-600" /></div><div className="bg-gray-100 px-3 py-2 rounded-2xl"><Loader2 size={14} className="animate-spin text-gray-400" /></div></div>}
            <div ref={bottomRef} />
          </div>
          <div className="p-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-1 mb-2">
              {QUICK.slice(0, 2).map(q => <button key={q} onClick={() => send(q)} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-100">{q}</button>)}
            </div>
            <div className="flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask anything..." className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={() => send()} disabled={!input.trim() || loading} className="btn-primary px-3 py-2"><Send size={16} /></button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
