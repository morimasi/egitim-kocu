import { createServerSupabaseClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users } from 'lucide-react'

export default async function CoachStudentsPage() {
  const supabase = createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'coach') redirect('/auth/login')

  const { data: students } = await supabase
    .from('students')
    .select('id, grade_level, school_name, is_active, profiles!students_profile_id_fkey(first_name, last_name)')
    .eq('coach_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Öğrenciler</h1>
            <p className="text-sm text-gray-600">Koçunuza bağlı öğrenciler</p>
          </div>
          <Link href="/dashboard/coach/students/new">
            <Button>Öğrenci Ekle</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Öğrenci Listesi</CardTitle>
            <CardDescription>Aktif öğrencileriniz</CardDescription>
          </CardHeader>
          <CardContent>
            {(!students || students.length === 0) ? (
              <p className="text-sm text-gray-500">Henüz öğrenci eklenmemiş.</p>
            ) : (
              <ul className="divide-y divide-gray-200 bg-white shadow sm:rounded-md overflow-hidden">
                {students.map((s: any) => (
                  <li key={s.id}>
                    <Link href={`/dashboard/coach/students/${s.id}`} className="block">
                      <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {s.profiles?.first_name} {s.profiles?.last_name}
                            </p>
                            <p className="text-xs text-gray-500">{s.school_name} {s.grade_level ? `- ${s.grade_level}` : ''}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${s.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {s.is_active ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}


