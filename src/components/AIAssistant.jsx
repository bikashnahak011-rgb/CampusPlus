import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { askCampusAssistant } from '../lib/aiService'

const QUICK = {
  student: ['How do I submit a complaint?', 'How do I request a document?', "What is today's mess menu?", 'What is my attendance?'],
  admin: ['Summarize current campus issues', 'Where do I review requests?', 'How do I manage attendance?', 'How do I edit bus routes?'],
  main_administrator: ['Summarize current campus issues', 'How do I review requests?', 'How do I publish a notice?', 'How do I edit bus routes?'],
  faculty: ['How do I see today’s classes?', 'How do I review attendance?', 'How do I add an assignment?', 'Where do I edit the timetable?'],
  hostel_management: ['How do I review hostel complaints?', 'How do I allocate a room?', 'Where are hostel students?', 'How do I manage maintenance?'],
  mess_manager: ['How do I update the mess menu?', 'Where do I review meal feedback?', 'How do I view food complaints?', 'What is today’s menu?'],
  account_examination: ['How do I review fees?', 'Where are exam results?', 'How do I view payments?', 'Where can I see reports?'],
}

function greetingFor(role) {
  return role === 'admin'
    ? 'Hi! I can guide you around tools available to your administrator role and answer questions about authorized campus information.'
    : 'Hi! I can guide you around student services and answer questions about your own campus records.'
}

function CampusRobot({ small = false }) {
  return (
    <span className={`campus-ai-robot ${small ? 'campus-ai-robot-small' : ''}`} aria-hidden="true">
      <span className="campus-ai-robot-antenna" />
      <span className="campus-ai-robot-ear campus-ai-robot-ear-left" />
      <span className="campus-ai-robot-ear campus-ai-robot-ear-right" />
      <span className="campus-ai-robot-head">
        <span className="campus-ai-robot-eyes"><i /><i /></span>
        <span className="campus-ai-robot-mouth" />
      </span>
      {!small && <span className="campus-ai-robot-body"><i /><i /><i /></span>}
    </span>
  )
}

export default function AIAssistant() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const initialMessage = { id: 1, role: 'assistant', text: greetingFor(user?.role) }
  const [conversation, setConversation] = useState(() => ({ userId: user?.id, messages: [initialMessage] }))
  const messages = conversation.userId === user?.id
    ? conversation.messages
    : [{ ...initialMessage, id: `greeting-${user?.id || 'guest'}` }]
  const setMessages = update => setConversation(previous => {
    const currentMessages = previous.userId === user?.id ? previous.messages : messages
    return {
      userId: user?.id,
      messages: typeof update === 'function' ? update(currentMessages) : update,
    }
  })
  const [input, setInput] = useState('')
  const [pendingRequest, setPendingRequest] = useState({ userId: user?.id, loading: false })
  const loading = pendingRequest.userId === user?.id && pendingRequest.loading
  const setLoading = value => setPendingRequest({ userId: user?.id, loading: value })
  const bottomRef = useRef(null)
  const requestController = useRef(null)
  const quickQuestions = user?.role === 'admin'
    ? QUICK[user.admin_role] || QUICK.admin
    : QUICK.student

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => () => requestController.current?.abort(), [])
  useEffect(() => {
    requestController.current?.abort()
    requestController.current = null
  }, [user?.id, user?.role, user?.admin_role])

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
      const history = messages
        .filter(message => message.role === 'user' || message.role === 'assistant')
        .slice(-10)
        .map(message => ({ role: message.role, content: message.text }))
      const reply = await askCampusAssistant(msg, user, { signal: controller.signal, history })
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
      <button onClick={() => setOpen(true)} aria-label="Open Campus AI assistant" className="campus-ai-launcher fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40">
        <span className="campus-ai-launcher-icon"><MessageCircle size={19} /></span>
        <span className="campus-ai-launcher-label">Ask Campus AI</span>
      </button>
      {open && (
        <section className="campus-ai-panel fixed inset-x-3 bottom-20 sm:inset-x-auto sm:bottom-20 sm:right-6 z-50" aria-label="Campus AI chat" style={{ height: 'min(570px, calc(100dvh - 7rem))' }}>
          <header className="campus-ai-header">
            <div className="campus-ai-brand">
              <span className="campus-ai-robot-stage"><CampusRobot /></span>
              <div>
                <p className="campus-ai-title">Campus AI</p>
                <p className="campus-ai-subtitle"><span className="campus-ai-live-dot" />Ready to help with campus life</p>
              </div>
            </div>
            <div className="campus-ai-header-actions">
              <span className="campus-ai-header-chip">{user?.role === 'admin' ? 'ADMIN ASSIST' : 'STUDENT ASSIST'}</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close Campus AI" className="campus-ai-close"><X size={18} /></button>
            </div>
          </header>

          <div className="campus-ai-messages" aria-live="polite">
            {messages.map(m => (
              <div key={m.id} className={`campus-ai-message ${m.role === 'user' ? 'campus-ai-message-user' : ''}`}>
                <div className={`campus-ai-message-avatar ${m.role === 'user' ? 'campus-ai-message-avatar-user' : ''}`}>
                  {m.role === 'assistant' ? <CampusRobot small /> : <User size={15} />}
                </div>
                <div className={`campus-ai-bubble ${m.role === 'user' ? 'campus-ai-bubble-user' : ''}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="campus-ai-message">
                <div className="campus-ai-message-avatar"><CampusRobot small /></div>
                <div className="campus-ai-bubble campus-ai-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <footer className="campus-ai-composer">
            <div className="campus-ai-suggestions" aria-label="Suggested questions">
              {quickQuestions.map((q, index) => (
                <button
                  key={q}
                  disabled={loading}
                  onClick={() => send(q)}
                  className={`campus-ai-suggestion ${index === 0 ? 'campus-ai-suggestion-featured' : ''}`}
                >
                  {q}
                </button>
              ))}
            </div>

            <form className="campus-ai-input" onSubmit={event => { event.preventDefault(); send() }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about campus services..."
                aria-label="Ask Campus AI about campus services"
                className="campus-ai-text-input"
              />
              {loading
                ? <button type="button" onClick={cancel} className="campus-ai-send campus-ai-cancel">Cancel</button>
                : <button type="submit" disabled={!input.trim()} aria-label="Send message" className="campus-ai-send"><Send size={17} /></button>}
            </form>
            <p className="campus-ai-footnote">Campus answers, one question at a time</p>
          </footer>
        </section>
      )}
    </>
  )
}
