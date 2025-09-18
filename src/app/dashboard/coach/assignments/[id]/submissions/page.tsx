"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@supabase/supabase-js'

// Supabase bağlantısı
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Veri modelleri
type Profile = {
  id: string
  first_name: string
  last_name: string
  role: 'koç' | 'öğrenci'
  email: string
  avatar_url: string | null
}

type Student = {
  id: string
  profile_id: string
  coach_id: string | null
  profiles?: Profile
}

type Assignment = {
  id: string
  title: string
  description: string | null
  status: 'beklemede' | 'teslim edildi' | 'değerlendirildi' | 'tamamlandı'
  student_id: string | null
  students?: Student
}

type Submission = {
  id: string
  assignment_id: string
  student_id: string
  content: string | null
  attachment_urls: string[] | null
  submitted_at: string | null
  students?: Student & {
    profiles?: Profile
  }
}

export default function SubmissionsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)

  // Verileri yükleme efekti
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Ödev detaylarını çek
        const { data: assignmentData, error: assignmentError } = await supabase
          .from('assignments')
          .select('*')
          .eq('id', params.id)
          .single()

        if (assignmentError) throw assignmentError
        setAssignment(assignmentData)

        // Bu ödeve ait teslimleri çek
        const { data: submissionsData, error: submissionsError } = await supabase
          .from('submissions')
          .select('*, students!inner(profiles(*))')
          .eq('assignment_id', params.id)

        if (submissionsError) throw submissionsError
        setSubmissions(submissionsData || [])

      } catch (error) {
        console.error('Veri yüklenirken hata:', error)
        toast({
          title: 'Hata',
          description: 'Teslimler yüklenirken bir hata oluştu',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-muted-foreground">Ödev bulunamadı</h1>
          <Button 
            onClick={() => router.back()} 
            variant="outline" 
            className="mt-4"
          >
            Geri Dön
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{assignment.title} için Teslimler</h1>
          <p className="text-muted-foreground">
            {submissions.length} adet teslim bulundu
          </p>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          Ödevlere Dön
        </Button>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardHeader className="text-center py-12">
            <CardTitle>Henüz Teslim Yok</CardTitle>
            <CardDescription className="mt-2">
              Bu ödev için henüz teslim edilen çalışma bulunmuyor.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {submission.students?.profiles?.first_name || 'Bilinmeyen'}{' '}
                      {submission.students?.profiles?.last_name || 'Öğrenci'}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Teslim Tarihi: {new Date(submission.submitted_at || '').toLocaleString('tr-TR')}
                    </CardDescription>
                  </div>
                  <Button asChild variant="outline">
                    <Link href={`/dashboard/coach/assignments/${params.id}/submissions/${submission.id}`}>
                      Değerlendir
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              {submission.content && (
                <CardContent>
                  <div className="prose max-w-none">
                    <h4 className="text-sm font-medium mb-2">Teslim İçeriği:</h4>
                    <p className="text-sm text-muted-foreground">
                      {submission.content.length > 200 
                        ? `${submission.content.substring(0, 200)}...` 
                        : submission.content}
                    </p>
                  </div>
                </CardContent>
              )}
              {submission.attachment_urls && submission.attachment_urls.length > 0 && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Ek Dosyalar:</h4>
                    <div className="flex flex-wrap gap-2">
                      {submission.attachment_urls.map((url, index) => (
                        <a 
                          key={index} 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Dosya {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}