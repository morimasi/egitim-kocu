import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  // Kullanıcı kimlik doğrulamasını kontrol et
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
  }

  // Kullanıcının profilini al
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/auth/login')
  }

  // Role göre yönlendir
  if (profile.role === 'coach') {
    redirect('/dashboard/coach')
  } else if (profile.role === 'student') {
    redirect('/dashboard/student')
  }

  // Varsayılan yönlendirme
  redirect('/auth/login')
}