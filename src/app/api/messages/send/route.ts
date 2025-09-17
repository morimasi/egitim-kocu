import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { messageSendSchema } from '@/lib/validation'
import { track } from '@/lib/analytics'

export async function POST(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const parsed = messageSendSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }
  const payload = parsed.data

  const { data, error } = await supabase
    .from('messages')
    .insert([{ sender_id: user.id, receiver_id: payload.toUserId, content: payload.content }])
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await track({ type: 'message_sent', messageId: data.id, senderId: user.id, receiverId: payload.toUserId })
  return NextResponse.json({ message: data })
}


