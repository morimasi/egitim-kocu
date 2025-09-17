import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { reviewCreateSchema } from '@/lib/validation'
import { track } from '@/lib/analytics'

export async function POST(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || profile.role !== 'coach') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const parsed = reviewCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }
  const payload = parsed.data

  const { error } = await supabase
    .from('assignment_reviews')
    .insert([
      {
        assignment_id: payload.assignmentId,
        submission_id: payload.submissionId,
        coach_id: user.id,
        score: payload.score ?? null,
        feedback: payload.feedback ?? null,
        suggestions: payload.suggestions ?? null,
        is_final_review: payload.isFinal
      }
    ])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // assignment status -> reviewed
  await supabase.from('assignments').update({ status: 'reviewed' }).eq('id', payload.assignmentId)
  await track({ type: 'review_created', assignmentId: payload.assignmentId, submissionId: payload.submissionId, coachId: user.id })
  return NextResponse.json({ ok: true })
}


