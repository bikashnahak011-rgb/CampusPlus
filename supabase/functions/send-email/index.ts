import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? ''
const FROM_NAME = Deno.env.get('FROM_NAME') ?? 'CampusOne'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    if (!RESEND_API_KEY || !FROM_EMAIL) {
      console.warn('RESEND_API_KEY or FROM_EMAIL not set — skipping email delivery')
      return new Response(
        JSON.stringify({ sent: 0, skipped: true, reason: 'Resend credentials not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const body = await req.json()

    let type: string
    let payload: any

    if (body.record && body.table) {
      const record = body.record
      if (body.table === 'notices') {
        type = 'notice'; payload = record
      } else if (body.table === 'exam_results' && record.published) {
        type = 'exam_result'; payload = record
      } else if (body.table === 'campus_journal' && (record.status === 'published' || record.status === 'rejected')) {
        type = 'journal_review'; payload = record
      } else {
        return new Response(JSON.stringify({ skipped: true }), { headers: corsHeaders })
      }
    } else {
      type = body.type; payload = body.payload
    }

    let emails: { to: string; subject: string; html: string }[] = []

    if (type === 'notice') {
      const { data: students } = await supabase
        .from('profiles').select('email, name, department, year, hostel_block').eq('role', 'student')
      const targets = filterByTarget(students ?? [], payload.target)
      emails = targets.map((s) => ({
        to: s.email,
        subject: `📢 ${payload.important ? '[Important] ' : ''}${payload.title}`,
        html: noticeTemplate(s.name, payload),
      }))
    } else if (type === 'journal_review') {
      const { data: student } = await supabase
        .from('profiles').select('email, name').eq('id', payload.student_id).single()
      if (student) {
        emails = [{
          to: student.email,
          subject: payload.status === 'published'
            ? `✅ Your journal entry "${payload.title}" has been published!`
            : `❌ Your journal entry "${payload.title}" was not accepted`,
          html: journalTemplate(student.name, payload),
        }]
      }
    } else if (type === 'exam_result') {
      const { data: student } = await supabase
        .from('profiles').select('email, name').eq('id', payload.student_id).single()
      if (student) {
        emails = [{
          to: student.email,
          subject: `📊 Your ${payload.result_type} result is now available`,
          html: examResultTemplate(student.name, payload),
        }]
      }
    }

    if (!emails.length) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let sent = 0, failed = 0
    for (const email of emails) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${FROM_NAME} <${FROM_EMAIL}>`,
          to: [email.to],
          subject: email.subject,
          html: email.html,
        }),
      })
      if (res.ok) sent++
      else {
        const err = await res.text()
        console.error(`Failed to send to ${email.to}:`, err)
        failed++
      }
    }

    return new Response(JSON.stringify({ sent, failed, total: emails.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('send-email error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function filterByTarget(students: any[], target: string) {
  if (!target || target === 'All Students') return students
  return students.filter((s) => {
    if (target === 'Hostel') return Boolean(s.hostel_block)
    if (target === 'Day Scholars') return !s.hostel_block
    if (/^Year \d$/.test(target)) return String(s.year) === target.replace('Year ', '')
    return s.department === target
  })
}

function base(title: string, body: string) {
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:24px">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
  <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:20px 28px">
    <h1 style="margin:0;color:#fff;font-size:1.1rem">🎓 CampusOne</h1>
  </div>
  <div style="padding:28px">
    <h2 style="margin:0 0 12px;color:#1f2937;font-size:1.15rem">${title}</h2>
    ${body}
    <p style="margin:24px 0 0;font-size:.75rem;color:#9ca3af">This is an automated message from CampusOne. Do not reply to this email.</p>
  </div>
</div></body></html>`
}

function noticeTemplate(name: string, p: any) {
  return base(p.title,
    `<p style="color:#374151;line-height:1.6">Hi ${name},</p>
     <p style="color:#374151;line-height:1.6">${p.content}</p>
     ${p.important ? '<p style="color:#7c3aed;font-weight:700">⚠️ This is an important notice.</p>' : ''}
     <p style="color:#6b7280;font-size:.85rem">Audience: ${p.target}</p>`)
}

function journalTemplate(name: string, p: any) {
  const published = p.status === 'published'
  return base(published ? '🎉 Your journal entry is live!' : 'Journal submission update',
    `<p style="color:#374151;line-height:1.6">Hi ${name},</p>
     <p style="color:#374151;line-height:1.6">
       ${published
         ? `Your submission <strong>"${p.title}"</strong> has been <strong style="color:#16a34a">published</strong> on the Campus Journal.`
         : `Your submission <strong>"${p.title}"</strong> was <strong style="color:#dc2626">not accepted</strong> at this time.`}
     </p>
     <p style="color:#6b7280;font-size:.85rem">Log in to CampusOne to view your journal.</p>`)
}

function examResultTemplate(name: string, p: any) {
  return base(`${p.result_type} Result Published`,
    `<p style="color:#374151;line-height:1.6">Hi ${name},</p>
     <p style="color:#374151;line-height:1.6">Your <strong>${p.result_type}</strong> for <strong>Semester ${p.semester}</strong> (${p.academic_year}) has been published.</p>
     <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:16px;margin:16px 0;text-align:center">
       <span style="font-size:2rem;font-weight:700;color:#7c3aed">${Number(p.result_value).toFixed(2)}</span>
       <span style="color:#6d28d9;font-size:1rem"> / 10</span>
     </div>
     <p style="color:#6b7280;font-size:.85rem">Log in to CampusOne to view your full result details.</p>`)
}
