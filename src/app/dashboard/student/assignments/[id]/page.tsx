import { createServerComponentClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'

export default async function StudentAssignmentDetail({ params }: { params: { id: string } }) {
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

  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!student) redirect('/dashboard')

  const { data: assignment } = await supabase
    .from('assignments')
    .select('*')
    .eq('id', params.id)
    .eq('student_id', student.id)
    .single()

  if (!assignment) redirect('/dashboard/student/assignments')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ödev Detayı</h1>
            <p className="text-sm text-gray-600">Teslim ve dosya yükleme</p>
          </div>
          <Link href="/dashboard/student/assignments">
            <Button variant="outline">Geri</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{assignment.title}</CardTitle>
                <CardDescription>{assignment.subject}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Açıklama</h3>
                  <p className="mt-1 text-gray-800 whitespace-pre-wrap">{assignment.description || 'Açıklama yok.'}</p>
                </div>
                {assignment.instructions && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Talimatlar</h3>
                    <p className="mt-1 text-gray-800 whitespace-pre-wrap">{assignment.instructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Teslim Et</CardTitle>
                <CardDescription>Metin ve dosya bağlantılarıyla teslim yapın</CardDescription>
              </CardHeader>
              <CardContent>
                <SubmitForm assignmentId={assignment.id} studentId={student.id} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

function SubmitForm({ assignmentId, studentId }: { assignmentId: string, studentId: string }) {
  'use client'
  const [content, setContent] = useState('')
  const [attachments, setAttachments] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createSupabaseClient()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    if (!content.trim() && !attachments.trim()) {
      toast({ title: 'Doğrulama', description: 'Metin veya en az bir dosya URL gerekli', variant: 'destructive' })
      return
    }
    const urls = attachments.split('\n').map(s => s.trim()).filter(Boolean)
    for (const u of urls) {
      try { new URL(u) } catch { toast({ title: 'Doğrulama', description: 'Geçersiz URL: ' + u, variant: 'destructive' }); return }
    }
    setLoading(true)
    try {
      const attachmentUrls = urls

      const { data: submission, error } = await supabase
        .from('assignment_submissions')
        .insert([
          {
            assignment_id: assignmentId,
            student_id: studentId,
            content,
            attachment_urls: attachmentUrls,
            is_final: true
          }
        ])
        .select()
        .single()

      if (error) throw error

      await supabase
        .from('assignments')
        .update({ status: 'submitted' })
        .eq('id', assignmentId)

      toast({ title: 'Teslim alındı', description: 'Ödeviniz gönderildi.' })
      router.push('/dashboard/student/assignments')
    } catch (err: any) {
      toast({ title: 'Hata', description: err.message || 'Teslim sırasında hata oluştu', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Metin İçeriği</label>
        <Textarea value={content} onChange={e => setContent(e.target.value)} rows={5} placeholder="Çözümünüzü yazın..." />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Dosya URL'leri (her satıra bir adet)</label>
        <Textarea value={attachments} onChange={e => setAttachments(e.target.value)} rows={3} placeholder="https://..." />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Dosya Yükle</label>
        <input multiple type="file" onChange={async (e) => {
          const files = e.target.files
          if (!files || files.length === 0) return
          setUploading(true)
          try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Oturum bulunamadı')
            const uploadedUrls: string[] = []
            for (const file of Array.from(files)) {
              const ext = file.name.split('.').pop()
              const path = `submissions/${user.id}/${assignmentId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
              const { error: upErr } = await supabase.storage.from('attachments').upload(path, file)
              if (upErr) throw upErr
              const { data: pub } = supabase.storage.from('attachments').getPublicUrl(path)
              uploadedUrls.push(pub.publicUrl)
            }
            const existing = attachments.split('\n').map(s=>s.trim()).filter(Boolean)
            setAttachments([...existing, ...uploadedUrls].join('\n'))
          } catch (err: any) {
            toast({ title: 'Yükleme Hatası', description: err.message || 'Dosya yüklenemedi', variant: 'destructive' })
          } finally {
            setUploading(false)
          }
        }} />
        {uploading && <span className="text-xs text-gray-500">Yükleniyor...</span>}
      </div>
      <Button type="submit" disabled={loading}>{loading ? 'Gönderiliyor...' : 'Teslim Et'}</Button>
    </form>
  )
}

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { createSupabaseClient } from '@/lib/supabase'

