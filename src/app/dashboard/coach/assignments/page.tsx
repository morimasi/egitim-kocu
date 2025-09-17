import { createServerSupabaseClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Clock, Plus, Calendar } from 'lucide-react'
import Link from 'next/link'

export default async function CoachAssignmentsPage({ searchParams }: { searchParams?: { page?: string; q?: string; status?: string } }) {
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

  // Ödevleri al (sayfalama)
  const pageSize = 10
  const currentPage = Math.max(1, parseInt(searchParams?.page || '1') || 1)
  const from = (currentPage - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('assignments')
    .select('*, students!assignments_student_id_fkey(profiles!students_profile_id_fkey(first_name, last_name))', { count: 'exact' })
    .eq('coach_id', user.id)
    .order('created_at', { ascending: false })

  if (searchParams?.q) {
    query = query.or(`title.ilike.%${searchParams.q}%,subject.ilike.%${searchParams.q}%`)
  }
  if (searchParams?.status) {
    query = query.eq('status', searchParams.status)
  }

  const { data: assignments, count: totalCount } = await query.range(from, to)

  // Ödev durumuna göre sınıf belirle
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'reviewed': return 'bg-purple-100 text-purple-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Öncelik seviyesine göre sınıf belirle
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'urgent': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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
                Ödevler
              </h1>
              <p className="text-sm text-gray-600">Atadığınız tüm ödevleri görüntüleyin</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/dashboard/coach/assignments/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Ödev
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input name="q" placeholder="Başlık/Ders ara" className="border rounded px-3 py-2 text-sm" defaultValue={typeof searchParams?.q === 'string' ? searchParams?.q : ''} />
          <select name="status" defaultValue={typeof searchParams?.status === 'string' ? searchParams?.status : ''} className="border rounded px-3 py-2 text-sm">
            <option value="">Tüm Durumlar</option>
            <option value="pending">Beklemede</option>
            <option value="submitted">Teslim</option>
            <option value="reviewed">Değerlendirildi</option>
            <option value="completed">Tamamlandı</option>
          </select>
          <Button type="submit" variant="outline">Filtrele</Button>
        </form>
        <Card>
          <CardHeader>
            <CardTitle>Ödev Listesi</CardTitle>
            <CardDescription>
              Oluşturduğunuz tüm ödevleri burada görebilirsiniz
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignments?.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz ödev yok</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Henüz hiç ödev oluşturmadınız.
                </p>
                <div className="mt-6">
                  <Link href="/dashboard/coach/assignments/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      İlk Ödevi Oluştur
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden bg-white shadow sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {assignments?.map((assignment) => {
                    const dueDate = new Date(assignment.due_date)
                    const today = new Date()
                    const diffTime = dueDate.getTime() - today.getTime()
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                    
                    return (
                      <li key={assignment.id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <BookOpen className="h-6 w-6 text-blue-600" />
                              </div>
                              <div className="ml-4">
                                <div className="flex items-center">
                                  <p className="text-sm font-medium text-blue-600 truncate">
                                    {assignment.title}
                                  </p>
                                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(assignment.status)}`}>
                                    {assignment.status === 'pending' && 'Beklemede'}
                                    {assignment.status === 'submitted' && 'Teslim Edildi'}
                                    {assignment.status === 'reviewed' && 'Değerlendirildi'}
                                    {assignment.status === 'completed' && 'Tamamlandı'}
                                  </span>
                                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityClass(assignment.priority)}`}>
                                    {assignment.priority === 'low' && 'Düşük'}
                                    {assignment.priority === 'medium' && 'Orta'}
                                    {assignment.priority === 'high' && 'Yüksek'}
                                    {assignment.priority === 'urgent' && 'Acil'}
                                  </span>
                                </div>
                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                  <span>
                                    {assignment.students?.profiles?.first_name} {assignment.students?.profiles?.last_name}
                                  </span>
                                  <span className="mx-2">•</span>
                                  <span>{assignment.subject}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <div className="flex flex-col items-end">
                                <div className="flex items-center text-sm text-gray-500">
                                  <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                  <span>
                                    {dueDate.toLocaleDateString('tr-TR')}
                                  </span>
                                </div>
                                <div className={`mt-1 text-xs ${
                                  diffDays < 0 ? 'text-red-600' : 
                                  diffDays === 0 ? 'text-orange-600' : 
                                  diffDays <= 3 ? 'text-yellow-600' : 'text-green-600'
                                }`}>
                                  {diffDays < 0 ? `${Math.abs(diffDays)} gün geçti` : 
                                   diffDays === 0 ? 'Bugün son gün' : 
                                   `${diffDays} gün kaldı`}
                                </div>
                              </div>
                              <div className="ml-5 flex-shrink-0">
                                <Link href={`/dashboard/coach/assignments/${assignment.id}`}>
                                  <Button variant="outline" size="sm">
                                    Görüntüle
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
              <Pagination total={totalCount || 0} pageSize={pageSize} currentPage={currentPage} />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function Pagination({ total, pageSize, currentPage }: { total: number; pageSize: number; currentPage: number }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const prevPage = Math.max(1, currentPage - 1)
  const nextPage = Math.min(totalPages, currentPage + 1)
  return (
    <div className="flex items-center justify-between mt-4">
      <a href={`?page=${prevPage}`} className={`px-3 py-2 text-sm border rounded ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}>Önceki</a>
      <span className="text-sm text-gray-600">Sayfa {currentPage} / {totalPages}</span>
      <a href={`?page=${nextPage}`} className={`px-3 py-2 text-sm border rounded ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}>Sonraki</a>
    </div>
  )
}