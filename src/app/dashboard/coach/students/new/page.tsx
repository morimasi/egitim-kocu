import { createServerSupabaseClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function NewStudentPage() {
  const supabase = createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'coach') redirect('/auth/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Öğrenci Ekle</h1>
          <Link href="/dashboard/coach/students">
            <Button variant="outline">Geri</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Öğrenci Oluştur</CardTitle>
          </CardHeader>
          <CardContent>
            <NewStudentForm />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function NewStudentForm() {
  'use client'
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [school, setSchool] = useState('')
  const [grade, setGrade] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createSupabaseClient()
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Oturum bulunamadı')

      // 1) Yeni profil (student rolü) oluşturulmasını varsaymıyoruz, Supabase Auth ile kullanıcı kaydı akışına bağlanmalı.
      // Bu demo: var olan bir profil (email üzerinden) bul ve öğrenciye bağla.
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

      if (!existingProfile) {
        toast({ title: 'Uyarı', description: 'Bu email için profil bulunamadı. Önce kullanıcı kaydı yapın.', variant: 'destructive' })
        setLoading(false)
        return
      }

      const { error } = await supabase
        .from('students')
        .insert([
          {
            profile_id: existingProfile.id,
            coach_id: user.id,
            school_name: school || null,
            grade_level: grade || null,
            is_active: true
          }
        ])

      if (error) throw error

      toast({ title: 'Başarılı', description: 'Öğrenci koçunuza eklendi.' })
      router.push('/dashboard/coach/students')
    } catch (err: any) {
      toast({ title: 'Hata', description: err.message || 'Öğrenci eklenemedi', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input className="w-full border rounded-md px-3 py-2 text-sm" placeholder="Ad" value={firstName} onChange={e => setFirstName(e.target.value)} />
      <input className="w-full border rounded-md px-3 py-2 text-sm" placeholder="Soyad" value={lastName} onChange={e => setLastName(e.target.value)} />
      <input className="w-full border rounded-md px-3 py-2 text-sm" placeholder="E-posta" type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="w-full border rounded-md px-3 py-2 text-sm" placeholder="Okul" value={school} onChange={e => setSchool(e.target.value)} />
      <input className="w-full border rounded-md px-3 py-2 text-sm" placeholder="Sınıf" value={grade} onChange={e => setGrade(e.target.value)} />
      <Button type="submit" disabled={loading}>{loading ? 'Kaydediliyor...' : 'Ekle'}</Button>
      <p className="text-xs text-gray-500">Not: Email için profil yoksa önce kullanıcı kaydı yapılmalıdır.</p>
    </form>
  )
}

import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

