import { createServerComponentClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function CoachConversationPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'coach') redirect('/auth/login')

  const { data: root } = await supabase
    .from('messages')
    .select('*, sender:profiles!messages_sender_id_fkey(first_name, last_name), receiver:profiles!messages_receiver_id_fkey(first_name, last_name)')
    .eq('id', params.id)
    .single()

  if (!root || (root.sender_id !== user.id && root.receiver_id !== user.id)) redirect('/dashboard/coach/messages')

  // İlgili mesajları görüldü olarak işaretle (koç okuyor)
  await supabase
    .from('messages')
    .update({ is_read: true })
    .or(`id.eq.${params.id},parent_message_id.eq.${params.id}`)
    .eq('receiver_id', user.id)

  const { data: replies } = await supabase
    .from('messages')
    .select('*, sender:profiles!messages_sender_id_fkey(first_name, last_name), receiver:profiles!messages_receiver_id_fkey(first_name, last_name)')
    .eq('parent_message_id', params.id)
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Konuşma</h1>
          <Link href="/dashboard/coach/messages">
            <Button variant="outline">Geri</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{root.sender_id === user.id ? `${root.receiver?.first_name || ''} ${root.receiver?.last_name || ''}` : `${root.sender?.first_name || ''} ${root.sender?.last_name || ''}`}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ThreadLive
              currentUserId={user.id}
              root={root}
              initialReplies={replies || []}
              toUserId={root.sender_id === user.id ? root.receiver_id : root.sender_id}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function MessageBubble({ currentUserId, item }: { currentUserId: string, item: any }) {
  const isMine = item.sender_id === currentUserId
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${isMine ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
        <p className="mb-1">{item.content}</p>
        <p className={`text-[10px] ${isMine ? 'text-blue-100' : 'text-gray-500'}`}>{new Date(item.created_at).toLocaleString('tr-TR')}</p>
      </div>
    </div>
  )
}

function ReplyForm({ parentId, toUserId }: { parentId: string, toUserId: string }) {
  'use client'
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createSupabaseClient()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Oturum bulunamadı')

      const { error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: user.id,
            receiver_id: toUserId,
            content,
            parent_message_id: parentId
          }
        ])
      if (error) throw error

      setContent('')
      toast({ title: 'Gönderildi' })
      location.reload()
    } catch (err: any) {
      toast({ title: 'Hata', description: err.message || 'Mesaj gönderilemedi', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center space-x-2 pt-2 border-t" aria-label="Mesaj yanıt formu">
      <input
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Yanıt yazın..."
        aria-label="Yanıt metni"
        className="flex-1 border rounded-md px-3 py-2 text-sm"
      />
      <Button type="submit" aria-label="Mesajı gönder" disabled={loading}>{loading ? 'Gönderiliyor...' : 'Gönder'}</Button>
    </form>
  )
}

function ThreadLive({ currentUserId, root, initialReplies, toUserId }: { currentUserId: string, root: any, initialReplies: any[], toUserId: string }) {
  'use client'
  const [items, setItems] = useState<any[]>(initialReplies)
  const supabase = createSupabaseClient()

  React.useEffect(() => {
    const channel = supabase.channel(`thread:${root.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `parent_message_id=eq.${root.id}` }, (payload) => {
        setItems(prev => [...prev, payload.new as any])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [root.id, supabase])

  return (
    <div className="space-y-4">
      <MessageBubble currentUserId={currentUserId} item={root} />
      {items.map((m: any) => (
        <MessageBubble key={m.id} currentUserId={currentUserId} item={m} />
      ))}
      <ReplyForm parentId={root.id} toUserId={toUserId} />
    </div>
  )
}

import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { createSupabaseClient } from '@/lib/supabase'
import * as React from 'react'

