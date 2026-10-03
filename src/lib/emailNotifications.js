import { supabase } from './supabase.js'

/**
 * Calls the send-email Supabase Edge Function.
 * Silently logs a warning on failure so it never breaks the main action.
 *
 * @param {'notice'|'journal_review'|'exam_result'} type
 * @param {object} payload
 */
export async function sendEmailNotification(type, payload) {
  if (!supabase) return

  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: { type, payload },
    })
    if (error) {
      console.warn('Email notification skipped:', error.message)
    }
  } catch (err) {
    console.warn('Email notification skipped:', err.message)
  }
}
