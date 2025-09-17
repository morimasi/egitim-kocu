import { createServerComponentClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function NewMessagePage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'student') redirect('/auth/login')

  // Öğrencinin koçunu bul
  const { data: student } = await supabase
    .from('students')
    .select('coach_id')
    .eq('profile_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Yeni Mesaj</h1>
          <Link href="/dashboard/student/messages">
            <Button variant="outline">Geri</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Koçunuza mesaj gönderin</CardTitle>
          </CardHeader>
          <CardContent>
            <ComposeForm receiverId={student?.coach_id || ''} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function ComposeForm({ receiverId }: { receiverId: string }) {
  'use client'
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createSupabaseClient()
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!receiverId) {
      toast({ title: 'Doğrulama', description: 'Koç bulunamadı', variant: 'destructive' })
      return
    }
    if (!content.trim() || content.trim().length < 2) {
      toast({ title: 'Doğrulama', description: 'Mesaj en az 2 karakter olmalı', variant: 'destructive' })
      return
    }
    if (content.length > 5000) {
      toast({ title: 'Doğrulama', description: 'Mesaj çok uzun (maks. 5000)', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Oturum bulunamadı')

      const { data, error } = await supabase
        .from('messages')
        .insert([{ sender_id: user.id, receiver_id: receiverId, content }])
        .select()
        .single()
      if (error) throw error

      toast({ title: 'Gönderildi' })
      router.push(`/dashboard/student/messages/${data.id}`)
    } catch (err: any) {
      toast({ title: 'Hata', description: err.message || 'Mesaj gönderilemedi', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Mesajınızı yazın..."
        rows={5}
        className="w-full border rounded-md px-3 py-2 text-sm"
      />
      <Button type="submit" disabled={loading || !receiverId}>{loading ? 'Gönderiliyor...' : 'Gönder'}</Button>
      {!receiverId && (
        <p className="text-xs text-red-600">Koç ataması bulunamadı.</p>
      )}
    </form>
  )
}

import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

