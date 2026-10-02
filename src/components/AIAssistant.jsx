import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react'
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
      <button onClick={() => setOpen(true)} aria-label="Open Campus AI assistant" className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 bg-gradient-to-r from-[#8d4ef7] to-[#7f52e6] hover:from-[#7c42ee] hover:to-[#6e46d8] text-white rounded-[20px] px-4 sm:px-5 py-3 shadow-[0_12px_30px_rgba(125,89,220,0.35)] flex items-center gap-2 transition-all hover:scale-[1.02]">
        <MessageCircle size={20} />
        <span className="text-base font-semibold hidden sm:block">Ask Campus AI</span>
      </button>
      {open && (
        <div className="fixed inset-x-3 bottom-20 sm:inset-x-auto sm:bottom-20 sm:right-6 z-50 w-auto sm:w-[430px] bg-[#f7f3fb] rounded-[28px] shadow-[0_28px_60px_rgba(60,45,82,0.18)] border border-[#e4d8f8] flex flex-col overflow-hidden" style={{ height: 'min(520px, calc(100dvh - 7rem))' }}>
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#8c52ee] via-[#8350ea] to-[#7c4de1] text-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                <Bot size={16} />
              </div>
              <div>
                <p className="font-semibold text-sm">Campus AI</p>
                <p className="text-xs text-violet-100">Always here to help</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wide">Live</span>
              <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-white/10 transition-colors"><X size={18} /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[radial-gradient(circle_at_top,_rgba(166,130,255,0.14),transparent_40%),linear-gradient(180deg,#f7f3fb_0%,#f2ecf9_100%)]">
            {messages.map(m => (
              <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'assistant' ? 'bg-[#efe7ff] text-[#5f32b3]' : 'bg-[#8d4ef7] text-white shadow-[0_8px_20px_rgba(141,78,247,0.25)]'}`}>
                  {m.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
                </div>
                <div className={`max-w-[85%] rounded-[22px] px-4 py-3 text-[15px] leading-6 whitespace-pre-line shadow-sm border ${m.role === 'assistant'
                  ? 'bg-white/90 text-[#2a2235] border-[#e7ddfb]'
                  : 'bg-gradient-to-r from-[#8d4ef7] to-[#7e4fdb] text-white border-transparent'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#efe7ff] text-[#5f32b3] flex items-center justify-center">
                  <Bot size={14} />
                </div>
                <div className="bg-white/90 border border-[#e7ddfb] rounded-[22px] px-4 py-3 shadow-sm">
                  <Loader2 size={16} className="animate-spin text-[#7b59d5]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-[#e8e1f1] bg-[#f5f2f9]">
            <div className="flex flex-wrap gap-2 mb-3">
              {quickQuestions.slice(0, 3).map((q, index) => (
                <button
                  key={q}
                  disabled={loading}
                  onClick={() => send(q)}
                  className={`text-[12px] rounded-full px-3 py-2 transition-all ${index === 0 ? 'bg-[#8d4ef7] text-white shadow-[0_6px_16px_rgba(141,78,247,0.2)]' : 'bg-white text-[#4d3f5d] border border-[#e3d8f3] hover:bg-[#f2ebff]'}`}
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="flex gap-2 items-center rounded-[18px] border border-[#ddd0f0] bg-[#fdfbfd] px-2 py-2 shadow-inner shadow-white/50">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Ask about campus services..."
                className="flex-1 bg-transparent border-0 px-2 py-2 text-[15px] text-[#362c42] placeholder:text-[#817191] focus:outline-none"
              />
              {loading
                ? <button type="button" onClick={cancel} className="rounded-xl bg-[#efeafc] text-[#4f3c66] px-3 py-2 text-sm font-medium">Cancel</button>
                : <button onClick={() => send()} disabled={!input.trim()} className="rounded-xl bg-gradient-to-r from-[#8d4ef7] to-[#7d4fe1] p-3 text-white shadow-md disabled:opacity-50"><Send size={17} /></button>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
