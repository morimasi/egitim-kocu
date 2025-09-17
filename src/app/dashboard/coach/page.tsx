import { createServerSupabaseClient } from '@/lib/supabase'
import { startOfDayIso, endOfDayIso } from '@/lib/utils'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, BookOpen, Clock, MessageCircle, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function CoachDashboard() {
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

  // İstatistikleri al
  const [
    { data: students, count: studentCount },
    { data: assignments },
    { data: pendingAssignments },
    { data: recentMessages },
    { count: dueTodayCount },
    { count: reviewedCount }
  ] = await Promise.all([
    supabase
      .from('students')
      .select('*, profiles!students_profile_id_fkey(first_name, last_name)', { count: 'exact' })
      .eq('coach_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5),
    
    supabase
      .from('assignments')
      .select('*')
      .eq('coach_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
      
    supabase
      .from('assignments')
      .select('*, students!assignments_student_id_fkey(profiles!students_profile_id_fkey(first_name, last_name))')
      .eq('coach_id', user.id)
      .eq('status', 'pending')
      .order('due_date', { ascending: true })
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
      .eq('coach_id', user.id)
      .eq('status', 'pending')
      .gte('due_date', startOfDayIso(new Date()))
      .lte('due_date', endOfDayIso(new Date())),

    supabase
      .from('assignments')
      .select('id', { count: 'exact', head: true })
      .eq('coach_id', user.id)
      .eq('status', 'reviewed')
  ])

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
              <p className="text-sm text-gray-600">Koç Dashboard'ı</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/dashboard/coach/assignments/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Ödev
                </Button>
              </Link>
              <Link href="/dashboard/coach/students/new">
                <Button variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Öğrenci Ekle
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Öğrenci</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentCount || 0}</div>
              <p className="text-xs text-muted-foreground">
                Aktif öğrenciler
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Ödev</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignments?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Son 5 ödev
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
                Teslim edilmedi
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bugün Teslim</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dueTodayCount || 0}</div>
              <p className="text-xs text-muted-foreground">Son teslim tarihi bugün</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hızlı Aksiyonlar</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Link href="/dashboard/coach/assignments/new"><Button size="sm">Yeni Ödev</Button></Link>
                <Link href="/dashboard/coach/messages/new"><Button size="sm" variant="outline">Mesaj</Button></Link>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">İncelenen Ödevler</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reviewedCount || 0}</div>
              <p className="text-xs text-muted-foreground">Geri bildirim verildi</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Son Öğrenciler */}
          <Card>
            <CardHeader>
              <CardTitle>Son Öğrenciler</CardTitle>
              <CardDescription>
                En son eklenen öğrenciler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {students?.length === 0 ? (
                  <p className="text-sm text-gray-500">Henüz öğrenci eklenmemiş.</p>
                ) : (
                  students?.map((student: any) => (
                    <div key={student.id} className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {student.profiles?.first_name} {student.profiles?.last_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {student.school_name} - {student.grade_level}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4">
                <Link href="/dashboard/coach/students">
                  <Button variant="outline" size="sm" className="w-full">
                    Tüm Öğrencileri Görüntüle
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Yaklaşan Ödevler */}
          <Card>
            <CardHeader>
              <CardTitle>Yaklaşan Ödevler</CardTitle>
              <CardDescription>
                Teslim tarihi yaklaşan ödevler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingAssignments?.length === 0 ? (
                  <p className="text-sm text-gray-500">Bekleyen ödev bulunmuyor.</p>
                ) : (
                  pendingAssignments?.map((assignment: any) => (
                    <div key={assignment.id} className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {assignment.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {assignment.students?.profiles?.first_name} - 
                          {new Date(assignment.due_date).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4">
                <Link href="/dashboard/coach/assignments">
                  <Button variant="outline" size="sm" className="w-full">
                    Tüm Ödevleri Görüntüle
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