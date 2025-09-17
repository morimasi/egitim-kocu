import { createServerComponentClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

export default async function SubmissionsPage({ params }: { params: { id: string } }) {
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

  const [{ data: assignment }, { data: submissions }] = await Promise.all([
    supabase
      .from('assignments')
      .select('*')
      .eq('id', params.id)
      .eq('coach_id', user.id)
      .single(),
    supabase
      .from('assignment_submissions')
      .select('*, students(*, profiles!students_profile_id_fkey(first_name, last_name))')
      .eq('assignment_id', params.id)
      .order('submitted_at', { ascending: false })
  ])

  if (!assignment) redirect('/dashboard/coach/assignments')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teslimler</h1>
            <p className="text-sm text-gray-600">{assignment.title}</p>
          </div>
          <Link href={`/dashboard/coach/assignments/${assignment.id}`}>
            <Button variant="outline">Geri</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {(submissions || []).length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Henüz teslim yok</CardTitle>
                  <CardDescription>Öğrenci teslim yaptığında burada göreceksiniz.</CardDescription>
                </CardHeader>
              </Card>
            ) : (
              submissions!.map((s: any) => (
                <Card key={s.id}>
                  <CardHeader>
                    <CardTitle>{s.students?.profiles?.first_name} {s.students?.profiles?.last_name}</CardTitle>
                    <CardDescription>{new Date(s.submitted_at).toLocaleString('tr-TR')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {s.content && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Metin İçeriği</p>
                        <p className="whitespace-pre-wrap text-gray-800">{s.content}</p>
                      </div>
                    )}
                    {Array.isArray(s.attachment_urls) && s.attachment_urls.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Dosyalar</p>
                        <ul className="list-disc pl-5 space-y-1">
                          {s.attachment_urls.map((url: string, i: number) => (
                            <li key={i}>
                              <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 underline">Dosya {i + 1}</a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <EvaluateForm assignmentId={assignment.id} submissionId={s.id} />
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ödev Bilgileri</CardTitle>
                <CardDescription>Durumu güncelleyebilirsiniz</CardDescription>
              </CardHeader>
              <CardContent>
                <UpdateAssignmentStatus assignmentId={assignment.id} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

function EvaluateForm({ assignmentId, submissionId }: { assignmentId: string, submissionId: string }) {
  'use client'
  const [score, setScore] = useState('')
  const [feedback, setFeedback] = useState('')
  const [suggestions, setSuggestions] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createSupabaseClient()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    if (score) {
      const parsed = parseInt(score)
      if (isNaN(parsed) || parsed < 0 || parsed > 1000) {
        toast({ title: 'Doğrulama', description: 'Puan 0-1000 aralığında olmalı', variant: 'destructive' })
        return
      }
    }
    if (feedback.length > 5000 || suggestions.length > 5000) {
      toast({ title: 'Doğrulama', description: 'Metin alanları çok uzun (maks. 5000)', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const parsedScore = score ? parseInt(score) : null
      const { error } = await supabase
        .from('assignment_reviews')
        .insert([
          {
            assignment_id: assignmentId,
            submission_id: submissionId,
            coach_id: (await supabase.auth.getUser()).data.user?.id,
            score: parsedScore,
            feedback,
            suggestions,
            is_final_review: true
          }
        ])

      if (error) throw error

      await supabase
        .from('assignments')
        .update({ status: 'reviewed' })
        .eq('id', assignmentId)

      toast({ title: 'Değerlendirildi', description: 'Geri bildirim kaydedildi.' })
    } catch (err: any) {
      toast({ title: 'Hata', description: err.message || 'Değerlendirme sırasında hata oluştu', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="text-sm text-gray-600">Puan</label>
        <Input type="number" min={0} max={100} value={score} onChange={e => setScore(e.target.value)} placeholder="100" />
      </div>
      <div>
        <label className="text-sm text-gray-600">Geri Bildirim</label>
        <Textarea rows={3} value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Genel geri bildirim" />
      </div>
      <div>
        <label className="text-sm text-gray-600">Öneriler</label>
        <Textarea rows={2} value={suggestions} onChange={e => setSuggestions(e.target.value)} placeholder="Geliştirme önerileri" />
      </div>
      <Button type="submit" disabled={loading}>{loading ? 'Kaydediliyor...' : 'Değerlendir ve Kaydet'}</Button>
    </form>
  )
}

function UpdateAssignmentStatus({ assignmentId }: { assignmentId: string }) {
  'use client'
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createSupabaseClient()

  async function setStatus(status: 'pending' | 'submitted' | 'reviewed' | 'completed') {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('assignments')
        .update({ status })
        .eq('id', assignmentId)
      if (error) throw error
      toast({ title: 'Durum güncellendi', description: `Durum: ${status}` })
    } catch (err: any) {
      toast({ title: 'Hata', description: err.message || 'Durum güncellenemedi', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button variant="outline" disabled={loading} onClick={() => setStatus('reviewed')}>Değerlendirildi</Button>
      <Button variant="outline" disabled={loading} onClick={() => setStatus('completed')}>Tamamlandı</Button>
    </div>
  )
}

import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { createSupabaseClient } from '@/lib/supabase'

