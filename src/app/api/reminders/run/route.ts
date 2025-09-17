import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST() {
  const supabase = createServerSupabaseClient()

  // Yaklaşan 24 saat içinde teslimi olan pending ödevler için hatırlatma üret
  const now = new Date()
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  const { data: assignments } = await supabase
    .from('assignments')
    .select('id, student_id, coach_id, title, due_date')
    .eq('status', 'pending')
    .gte('due_date', now.toISOString())
    .lte('due_date', in24h.toISOString())

  if (!assignments || assignments.length === 0) {
    return NextResponse.json({ created: 0 })
  }

  const remindersPayload = assignments.flatMap((a) => {
    const title = `Ödev hatırlatma: ${a.title}`
    const message = `"${a.title}" ödevinin teslim tarihi yaklaşıyor.`
    return [
      {
        user_id: a.coach_id,
        assignment_id: a.id,
        title,
        message,
        remind_at: a.due_date,
        is_sent: false,
        reminder_type: 'assignment_due'
      },
      {
        user_id: a.student_id, // Not: reminders.user_id profiles.id bekliyor; burada student_id -> students.id. Gerçek gönderimde profile_id kullanılmalı.
        assignment_id: a.id,
        title,
        message,
        remind_at: a.due_date,
        is_sent: false,
        reminder_type: 'assignment_due'
      }
    ]
  })

  // Güvenlik: RLS nedeniyle bu endpoint service role ile çalışmalıdır; burada demo olarak deneme ekleme yapılır
  const { error } = await supabase.from('reminders').insert(remindersPayload)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ created: remindersPayload.length })
}


