import { createServerSupabaseClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'

export default async function EditAssignmentPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'coach') redirect('/auth/login')

  const { data: assignment } = await supabase
    .from('assignments')
    .select('*')
    .eq('id', params.id)
    .eq('coach_id', user.id)
    .single()

  if (!assignment) redirect('/dashboard/coach/assignments')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-4">
          <h1 className="text-2xl font-bold text-gray-900">Ödevi Düzenle</h1>
          <Link href={`/dashboard/coach/assignments/${assignment.id}`}>
            <Button variant="outline">Geri</Button>
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{assignment.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <EditForm assignment={assignment} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function EditForm({ assignment }: { assignment: any }) {
  'use client'
  const [title, setTitle] = useState(assignment.title || '')
  const [subject, setSubject] = useState(assignment.subject || '')
  const [dueDate, setDueDate] = useState(assignment.due_date ? new Date(assignment.due_date).toISOString().slice(0,16) : '')
  const [priority, setPriority] = useState(assignment.priority || 'medium')
  const [maxScore, setMaxScore] = useState(String(assignment.max_score || 100))
  const [estimatedDuration, setEstimatedDuration] = useState(assignment.estimated_duration ? String(assignment.estimated_duration) : '')
  const [description, setDescription] = useState(assignment.description || '')
  const [instructions, setInstructions] = useState(assignment.instructions || '')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createSupabaseClient()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    if (!title.trim() || title.trim().length < 3) {
      toast({ title: 'Doğrulama', description: 'Başlık en az 3 karakter olmalı', variant: 'destructive' })
      return
    }
    if (!dueDate) {
      toast({ title: 'Doğrulama', description: 'Teslim tarihi gerekli', variant: 'destructive' })
      return
    }
    const ms = parseInt(maxScore)
    if (isNaN(ms) || ms < 1 || ms > 1000) {
      toast({ title: 'Doğrulama', description: 'Maksimum puan 1-1000', variant: 'destructive' })
      return
    }
    if (estimatedDuration) {
      const d = parseInt(estimatedDuration)
      if (isNaN(d) || d < 1 || d > 1440) {
        toast({ title: 'Doğrulama', description: 'Tahmini süre 1-1440 dakika', variant: 'destructive' })
        return
      }
    }
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Oturum yok')
      const { error } = await supabase
        .from('assignments')
        .update({
          title,
          subject,
          due_date: dueDate,
          priority,
          max_score: ms,
          estimated_duration: estimatedDuration ? parseInt(estimatedDuration) : null,
          description,
          instructions
        })
        .eq('id', assignment.id)
        .eq('coach_id', user.id)
      if (error) throw error
      toast({ title: 'Kaydedildi' })
      router.push(`/dashboard/coach/assignments/${assignment.id}`)
    } catch (err: any) {
      toast({ title: 'Hata', description: err.message || 'Güncelleme başarısız', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Başlık</Label>
        <Input id="title" value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="subject">Ders</Label>
        <Input id="subject" value={subject} onChange={e => setSubject(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="due">Teslim Tarihi</Label>
        <Input id="due" type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="priority">Öncelik</Label>
        <Select value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="low">Düşük</option>
          <option value="medium">Orta</option>
          <option value="high">Yüksek</option>
          <option value="urgent">Acil</option>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="max">Maksimum Puan</Label>
          <Input id="max" type="number" value={maxScore} onChange={e => setMaxScore(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="dur">Tahmini Süre (dk)</Label>
          <Input id="dur" type="number" value={estimatedDuration} onChange={e => setEstimatedDuration(e.target.value)} />
        </div>
      </div>
      <div>
        <Label htmlFor="desc">Açıklama</Label>
        <Textarea id="desc" rows={4} value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="ins">Talimatlar</Label>
        <Textarea id="ins" rows={3} value={instructions} onChange={e => setInstructions(e.target.value)} />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>{loading ? 'Kaydediliyor...' : 'Kaydet'}</Button>
      </div>
    </form>
  )
}

import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

