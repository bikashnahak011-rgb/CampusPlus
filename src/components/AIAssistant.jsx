import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { askCampusAssistant } from '../lib/aiService'

const QUICK = {
  student: ['How do I submit a complaint?', 'How do I request a document?', "What is today's mess menu?", 'What is my attendance?'],
  admin: ['Summarize current campus issues', 'Where do I edit bus routes?', 'How do I review requests?', 'How do I update the mess menu?'],
}

export default function AIAssistant() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState(() => [{
    id: 1,
    role: 'assistant',
    text: user?.role === 'admin'
      ? 'Hi! I can guide you around admin tools and summarize authorized campus operations data.'
      : 'Hi! I can guide you around student services and answer questions about your own campus records.',
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const requestController = useRef(null)
  const quickQuestions = QUICK[user?.role === 'admin' ? 'admin' : 'student']

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => () => requestController.current?.abort(), [])

  const cancel = () => {
    const controller = requestController.current
    if (!controller) return
    requestController.current = null
    controller.abort()
    setLoading(false)
    setMessages(previous => [...previous, { id: Date.now(), role: 'assistant', text: 'Response cancelled.' }])
  }

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    const controller = new AbortController()
    requestController.current = controller
    setInput('')
    setMessages(p => [...p, { id: Date.now(), role: 'user', text: msg }])
    setLoading(true)
    try {
      const reply = await askCampusAssistant(msg, user, { signal: controller.signal })
      setMessages(p => [...p, { id: Date.now() + 1, role: 'assistant', text: reply }])
    } catch {
      if (controller.signal.aborted) return
      setMessages(p => [...p, { id: Date.now() + 1, role: 'assistant', text: 'I hit a temporary issue. Please try again in a moment.' }])
    } finally {
      if (requestController.current === controller) {
        requestController.current = null
        setLoading(false)
      }
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="Open Campus AI assistant" className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-3 sm:px-4 py-3 shadow-xl flex items-center gap-2 transition-all hover:scale-105">
        <MessageCircle size={20} /><span className="text-sm font-medium hidden sm:block">Ask Campus AI</span>
      </button>
      {open && (
        <div className="fixed inset-x-3 bottom-20 sm:inset-x-auto sm:bottom-20 sm:right-6 z-50 w-auto sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col animate-slide-up" style={{ height: 'min(480px, calc(100dvh - 7rem))' }}>
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
              {quickQuestions.slice(0, 2).map(q => <button key={q} disabled={loading} onClick={() => send(q)} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-100 disabled:opacity-50">{q}</button>)}
            </div>
            <div className="flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask anything..." className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {loading
                ? <button type="button" onClick={cancel} className="btn-secondary px-3 py-2">Cancel</button>
                : <button onClick={() => send()} disabled={!input.trim()} className="btn-primary px-3 py-2"><Send size={16} /></button>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
