import { createServerSupabaseClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Calendar, Clock, User, FileText } from 'lucide-react'
import Link from 'next/link'

export default async function AssignmentDetailPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const supabase = createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Koç profilini al
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'coach') {
    redirect('/auth/login')
  }

  // Ödev detaylarını al
  const { data: assignment } = await supabase
    .from('assignments')
    .select('*, students!assignments_student_id_fkey(profiles!students_profile_id_fkey(first_name, last_name))')
    .eq('id', params.id)
    .eq('coach_id', user.id)
    .single()

  if (!assignment) {
    redirect('/dashboard/coach/assignments')
  }

  // Ödev durumuna göre metin belirle
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Beklemede'
      case 'submitted': return 'Teslim Edildi'
      case 'reviewed': return 'Değerlendirildi'
      case 'completed': return 'Tamamlandı'
      default: return status
    }
  }

  // Öncelik seviyesine göre metin belirle
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return 'Düşük'
      case 'medium': return 'Orta'
      case 'high': return 'Yüksek'
      case 'urgent': return 'Acil'
      default: return priority
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Ödev Detayı
              </h1>
              <p className="text-sm text-gray-600">Ödev bilgilerini görüntüleyin</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/dashboard/coach/assignments">
                <Button variant="outline">
                  Geri
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{assignment.title}</CardTitle>
                <CardDescription>
                  {assignment.subject}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ödev Açıklaması</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {assignment.description || 'Açıklama bulunmuyor.'}
                  </p>
                </div>

                {assignment.instructions && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Talimatlar</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {assignment.instructions}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ödev Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Öğrenci</p>
                    <p className="text-sm text-gray-900">
                      {assignment.students?.profiles?.first_name} {assignment.students?.profiles?.last_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Teslim Tarihi</p>
                    <p className="text-sm text-gray-900">
                      {new Date(assignment.due_date).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Öncelik</p>
                    <p className="text-sm text-gray-900">
                      {getPriorityText(assignment.priority)}
                    </p>
                  </div>
                </div>

                {assignment.estimated_duration && (
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Tahmini Süre</p>
                      <p className="text-sm text-gray-900">
                        {assignment.estimated_duration} dakika
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Durum</p>
                    <p className="text-sm text-gray-900">
                      {getStatusText(assignment.status)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Maksimum Puan</p>
                    <p className="text-sm text-gray-900">
                      {assignment.max_score}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>İşlemler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href={`/dashboard/coach/assignments/${assignment.id}/submissions`}>
                    <Button variant="outline" className="w-full">
                      Teslimleri Gör
                    </Button>
                  </Link>
                  <Link href={`/dashboard/coach/assignments/${assignment.id}/submissions`}>
                    <Button className="w-full" disabled={assignment.status !== 'submitted'}>
                      Ödevi Değerlendir
                    </Button>
                  </Link>
                  <Link href={`/dashboard/coach/assignments/${assignment.id}/edit`}>
                    <Button variant="outline" className="w-full">
                      Düzenle
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}