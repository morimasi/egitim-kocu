import { createServerSupabaseClient } from '@/lib/supabase'
import { startOfDayIso, endOfDayIso } from '@/lib/utils'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Clock, CheckCircle, MessageCircle, Calendar } from 'lucide-react'
import Link from 'next/link'

export default async function StudentDashboard() {
  const supabase = createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Öğrenci profilini al
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'student') {
    redirect('/auth/login')
  }

  // Öğrenci bilgilerini al
  const { data: studentInfo } = await supabase
    .from('students')
    .select('*, profiles!students_coach_id_fkey(first_name, last_name)')
    .eq('profile_id', user.id)
    .single()

  // İstatistikleri al
  const [
    { data: allAssignments },
    { data: pendingAssignments },
    { data: completedAssignments },
    { data: recentMessages },
    { count: dueTodayCount }
  ] = await Promise.all([
    supabase
      .from('assignments')
      .select('*')
      .eq('student_id', studentInfo?.id)
      .order('created_at', { ascending: false }),
    
    supabase
      .from('assignments')
      .select('*')
      .eq('student_id', studentInfo?.id)
      .eq('status', 'pending')
      .order('due_date', { ascending: true })
      .limit(5),
      
    supabase
      .from('assignments')
      .select('*')
      .eq('student_id', studentInfo?.id)
      .eq('status', 'completed')
      .order('updated_at', { ascending: false })
      .limit(3),
      
    supabase
      .from('messages')
      .select('*, profiles!messages_sender_id_fkey(first_name, last_name)')
      .eq('receiver_id', user.id)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(3),

    supabase
      .from('assignments')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', studentInfo?.id)
      .eq('status', 'pending')
      .gte('due_date', startOfDayIso(new Date()))
      .lte('due_date', endOfDayIso(new Date()))
  ])

  const upcomingAssignments = pendingAssignments?.filter(assignment => {
    const dueDate = new Date(assignment.due_date)
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7 && diffDays >= 0
  }) || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Merhaba, {profile.first_name}!
              </h1>
              <p className="text-sm text-gray-600">
                {studentInfo?.profiles ? 
                  `Koçunuz: ${studentInfo.profiles.first_name} ${studentInfo.profiles.last_name}` : 
                  'Öğrenci Dashboard\'ı'
                }
              </p>
            </div>
            <div className="flex space-x-4">
              <Link href="/dashboard/student/assignments">
                <Button variant="outline">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Ödevlerim
                </Button>
              </Link>
              <Link href="/dashboard/student/messages">
                <Button>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Mesajlar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bugün Teslim</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dueTodayCount || 0}</div>
              <p className="text-xs text-muted-foreground">Son teslim tarihi bugün</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Okunmamış Mesaj</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(recentMessages || []).length}</div>
              <p className="text-xs text-muted-foreground">Gelen kutunuz</p>
            </CardContent>
          </Card>
        </div>
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Ödev</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allAssignments?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Tüm ödevler
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bekleyen Ödevler</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingAssignments?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Teslim edilmemiş
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedAssignments?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Bitirilen ödevler
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Yeni Mesajlar</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentMessages?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Okunmamış
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Yaklaşan Ödevler */}
          <Card>
            <CardHeader>
              <CardTitle>Bu Hafta Teslim Edilecekler</CardTitle>
              <CardDescription>
                7 gün içinde teslim edilmesi gereken ödevler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAssignments.length === 0 ? (
                  <p className="text-sm text-gray-500">Bu hafta teslim edilecek ödev yok.</p>
                ) : (
                  upcomingAssignments.map((assignment: any) => {
                    const dueDate = new Date(assignment.due_date)
                    const today = new Date()
                    const diffTime = dueDate.getTime() - today.getTime()
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                    
                    return (
                      <div key={assignment.id} className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          diffDays <= 1 ? 'bg-red-100' :
                          diffDays <= 3 ? 'bg-yellow-100' : 'bg-blue-100'
                        }`}>
                          <Calendar className={`w-4 h-4 ${
                            diffDays <= 1 ? 'text-red-600' :
                            diffDays <= 3 ? 'text-yellow-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {assignment.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {assignment.subject} - {diffDays === 0 ? 'Bugün' : `${diffDays} gün kaldı`}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              <div className="mt-4">
                <Link href="/dashboard/student/assignments">
                  <Button variant="outline" size="sm" className="w-full">
                    Tüm Ödevleri Görüntüle
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Son Tamamlanan Ödevler */}
          <Card>
            <CardHeader>
              <CardTitle>Son Tamamlanan Ödevler</CardTitle>
              <CardDescription>
                Yakın zamanda tamamladığınız ödevler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedAssignments?.length === 0 ? (
                  <p className="text-sm text-gray-500">Henüz tamamlanan ödev bulunmuyor.</p>
                ) : (
                  completedAssignments?.map((assignment: any) => (
                    <div key={assignment.id} className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {assignment.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {assignment.subject} - {new Date(assignment.updated_at).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4">
                <Link href="/dashboard/student/progress">
                  <Button variant="outline" size="sm" className="w-full">
                    İlerleme Raporunu Görüntüle
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
