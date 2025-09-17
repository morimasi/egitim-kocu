import { createServerComponentClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function CoachNewMessagePage() {
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

  // Koçun öğrencilerini getir
  const { data: students } = await supabase
    .from('students')
    .select('id, profile_id, profiles!students_profile_id_fkey(first_name, last_name)')
    .eq('coach_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Yeni Mesaj</h1>
          <Link href="/dashboard/coach/messages">
            <Button variant="outline">Geri</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Öğrenci seç ve mesaj gönder</CardTitle>
          </CardHeader>
          <CardContent>
            <ComposeForm students={students || []} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function ComposeForm({ students }: { students: any[] }) {
  'use client'
  const [receiverId, setReceiverId] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createSupabaseClient()
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!receiverId) {
      toast({ title: 'Doğrulama', description: 'Öğrenci seçiniz', variant: 'destructive' })
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
      router.push(`/dashboard/coach/messages/${data.id}`)
    } catch (err: any) {
      toast({ title: 'Hata', description: err.message || 'Mesaj gönderilemedi', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <select value={receiverId} onChange={e => setReceiverId(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm">
        <option value="">Öğrenci seçin</option>
        {students.map(s => (
          <option key={s.profile_id} value={s.profile_id}>
            {(s.profiles?.first_name || '') + ' ' + (s.profiles?.last_name || '')}
          </option>
        ))}
      </select>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Mesajınızı yazın..."
        rows={5}
        className="w-full border rounded-md px-3 py-2 text-sm"
      />
      <Button type="submit" disabled={loading || !receiverId}>{loading ? 'Gönderiliyor...' : 'Gönder'}</Button>
    </form>
  )
}

import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

