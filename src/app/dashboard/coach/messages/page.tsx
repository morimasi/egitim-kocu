'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function CoachInboxPage() {
  const cookieStore = cookies()
  const supabase = createClientComponentClient() => cookieStore })

  const [user, setUser] = useState(null);
  const router = useRouter();
  
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }
      setUser(session.user);
    };
    
    getSession();
  }, [router, supabase]);
  
  if (!user) return <div>Yükleniyor...</div>;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'coach') redirect('/auth/login')

  const { data: threads } = await supabase
    .from('messages')
    .select('*, sender:profiles!messages_sender_id_fkey(first_name, last_name), receiver:profiles!messages_receiver_id_fkey(first_name, last_name)')
    .is('parent_message_id', null)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mesajlar</h1>
            <p className="text-sm text-gray-600">Gelen kutusu</p>
          </div>
          <div className="flex space-x-2">
            <Link href="/dashboard/coach">
              <Button variant="outline">Geri</Button>
            </Link>
            <Link href="/dashboard/coach/messages/new">
              <Button>Yeni Mesaj</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Konuşmalar</CardTitle>
            <CardDescription>Öğrencilerle mesajlaşmalar</CardDescription>
          </CardHeader>
          <CardContent>
            {(!threads || threads.length === 0) ? (
              <p className="text-sm text-gray-500">Henüz mesaj yok.</p>
            ) : (
              <ul className="divide-y divide-gray-200 bg-white shadow sm:rounded-md overflow-hidden">
                {threads.map((t: any) => {
                  const otherName = t.sender_id === user.id
                    ? `${t.receiver?.first_name || ''} ${t.receiver?.last_name || ''}`.trim()
                    : `${t.sender?.first_name || ''} ${t.sender?.last_name || ''}`.trim()
                  const unread = !t.is_read && t.receiver_id === user.id
                  return (
                    <li key={t.id}>
                      <Link href={`/dashboard/coach/messages/${t.id}`} className="block">
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-blue-600 truncate">{otherName || 'Konuşma'}</p>
                            <div className="flex items-center gap-2">
                              {unread && <span className="inline-block w-2 h-2 rounded-full bg-blue-600" />}
                              <p className="text-xs text-gray-500">{new Date(t.created_at).toLocaleString('tr-TR')}</p>
                            </div>
                          </div>
                          <p className="mt-1 text-sm text-gray-700 line-clamp-1">{t.content}</p>
                        </div>
                      </Link>
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


