import { createServerComponentClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Calendar } from 'lucide-react'

export default async function StudentAssignmentsPage() {
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

  const { data: assignments } = await supabase
    .from('assignments')
    .select('*')
    .eq('student_id', student.id)
    .order('due_date', { ascending: true })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'reviewed': return 'bg-purple-100 text-purple-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ödevlerim</h1>
            <p className="text-sm text-gray-600">Size atanan tüm ödevler</p>
          </div>
          <Link href="/dashboard/student">
            <Button variant="outline">Geri</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Ödev Listesi</CardTitle>
            <CardDescription>Yaklaşan teslim tarihlerini kaçırmayın</CardDescription>
          </CardHeader>
          <CardContent>
            {(!assignments || assignments.length === 0) ? (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Ödev bulunmuyor</h3>
                <p className="mt-1 text-sm text-gray-500">Koçunuz ödev atadığında burada göreceksiniz.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 bg-white shadow sm:rounded-md overflow-hidden">
                {assignments.map(assignment => {
                  const dueDate = new Date(assignment.due_date as unknown as string)
                  const today = new Date()
                  const diffTime = dueDate.getTime() - today.getTime()
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                  return (
                    <li key={assignment.id}>
                      <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-blue-600">{assignment.title}</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(assignment.status as unknown as string)}`}>
                              {assignment.status}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">{assignment.subject}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-gray-500 flex items-center">
                            <Calendar className="h-5 w-5 text-gray-400 mr-1.5" />
                            {dueDate.toLocaleDateString('tr-TR')}
                          </div>
                          <Link href={`/dashboard/student/assignments/${assignment.id}`}>
                            <Button variant="outline" size="sm">Görüntüle</Button>
                          </Link>
                        </div>
                      </div>
                      <div className={`px-4 pb-4 text-xs ${
                        diffDays < 0 ? 'text-red-600' : diffDays === 0 ? 'text-orange-600' : diffDays <= 3 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {diffDays < 0 ? `${Math.abs(diffDays)} gün gecikti` : diffDays === 0 ? 'Bugün teslim' : `${diffDays} gün kaldı`}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}


