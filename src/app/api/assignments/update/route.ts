import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { assignmentUpdateSchema } from '@/lib/validation'
import { track } from '@/lib/analytics'

export async function POST(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || profile.role !== 'coach') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const parsed = assignmentUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }
  const payload = parsed.data

  const { error } = await supabase
    .from('assignments')
    .update({
      title: payload.title,
      description: payload.description ?? null,
      subject: payload.subject ?? null,
      due_date: payload.dueDate,
      priority: payload.priority,
      estimated_duration: payload.estimatedDuration ?? null,
      instructions: payload.instructions ?? null,
      max_score: payload.maxScore,
    })
    .eq('id', payload.id)
    .eq('coach_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await track({ type: 'assignment_updated', assignmentId: payload.id, coachId: user.id })
  return NextResponse.json({ ok: true })
}


