import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { assignmentCreateSchema } from '@/lib/validation'
import { track } from '@/lib/analytics'

export async function POST(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || profile.role !== 'coach') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const parsed = assignmentCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }
  const payload = parsed.data

  const { data, error } = await supabase
    .from('assignments')
    .insert([
      {
        title: payload.title,
        description: payload.description ?? null,
        subject: payload.subject ?? null,
        coach_id: user.id,
        student_id: payload.studentId,
        due_date: payload.dueDate,
        priority: payload.priority,
        estimated_duration: payload.estimatedDuration ?? null,
        instructions: payload.instructions ?? null,
        max_score: payload.maxScore,
      }
    ])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await track({ type: 'assignment_created', assignmentId: data.id, coachId: user.id, studentId: data.student_id })
  return NextResponse.json({ assignment: data })
}


