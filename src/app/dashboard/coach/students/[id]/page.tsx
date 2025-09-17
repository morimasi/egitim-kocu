import { createServerSupabaseClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Clock } from 'lucide-react'

export default async function StudentProfilePage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'coach') redirect('/auth/login')

  const [{ data: student }, { data: assignments }, { data: progress } ] = await Promise.all([
    supabase
      .from('students')
      .select('*, profiles!students_profile_id_fkey(first_name, last_name, email)')
      .eq('id', params.id)
      .eq('coach_id', user.id)
      .single(),
    supabase
      .from('assignments')
      .select('*')
      .eq('student_id', params.id)
      .order('due_date', { ascending: true })
      .limit(10),
    supabase
      .from('student_progress')
      .select('*')
      .eq('student_id', params.id)
      .order('week_start', { ascending: false })
      .limit(8)
  ])

  if (!student) redirect('/dashboard/coach/students')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{student.profiles?.first_name} {student.profiles?.last_name}</h1>
            <p className="text-sm text-gray-600">{student.school_name} {student.grade_level ? `- ${student.grade_level}` : ''}</p>
          </div>
          <Link href="/dashboard/coach/students">
            <Button variant="outline">Geri</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Yaklaşan Ödevler</CardTitle>
                <CardDescription>En fazla 10 ödev listelenir</CardDescription>
              </CardHeader>
              <CardContent>
                {(!assignments || assignments.length === 0) ? (
                  <p className="text-sm text-gray-500">Ödev bulunmuyor.</p>
                ) : (
                  <ul className="divide-y divide-gray-200 bg-white shadow sm:rounded-md overflow-hidden">
                    {assignments.map((a: any) => (
                      <li key={a.id}>
                        <Link href={`/dashboard/coach/assignments/${a.id}`} className="block">
                          <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-600">{a.title}</p>
                              <p className="text-xs text-gray-500">{a.subject}</p>
                            </div>
                            <div className="text-sm text-gray-500">{new Date(a.due_date).toLocaleDateString('tr-TR')}</div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Haftalık İlerleme</CardTitle>
                <CardDescription>Son 8 hafta</CardDescription>
              </CardHeader>
              <CardContent>
                {(!progress || progress.length === 0) ? (
                  <p className="text-sm text-gray-500">İlerleme verisi yok.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {progress.map((p: any) => (
                      <div key={p.id} className="border rounded-md p-3 text-sm">
                        <p className="font-medium">Hafta: {new Date(p.week_start).toLocaleDateString('tr-TR')}</p>
                        <p>Görevler: {p.assignments_completed}/{p.assignments_total}</p>
                        <p>Ortalama Puan: {p.average_score ?? '-'}</p>
                        <p>Çalışma Saati: {p.study_hours ?? 0}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Öğrenci Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><span className="text-gray-600">Email:</span> {student.profiles?.email}</p>
                <p><span className="text-gray-600">Okul:</span> {student.school_name || '-'}</p>
                <p><span className="text-gray-600">Sınıf:</span> {student.grade_level || '-'}</p>
                <p><span className="text-gray-600">Aktif:</span> {student.is_active ? 'Evet' : 'Hayır'}</p>
                <div className="pt-2">
                  <Link href={`/dashboard/coach/assignments/new?studentId=${params.id}`}>
                    <Button size="sm">Bu Öğrenciye Ödev Ata</Button>
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


