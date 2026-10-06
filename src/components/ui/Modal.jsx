import { X } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const dialogRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const titleId = useId()

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return undefined

    const previousOverflow = document.body.style.overflow
    const previouslyFocused = document.activeElement
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()
    const handleKeyDown = event => {
      if (event.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [isOpen])

  if (!isOpen) return null
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  return createPortal(
    <div className="internal-modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-2 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div className={`internal-dialog relative w-full ${sizes[size]} max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl animate-scale-in`} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} ref={dialogRef} onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 p-4 sm:p-5 border-b border-gray-100">
          <h2 id={titleId} className="text-lg font-semibold text-gray-900 leading-tight">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"><X size={18} /></button>
        </div>
        <div className="p-4 sm:p-5">{children}</div>
      </div>
    </div>
    ,
    document.body
  )
}
