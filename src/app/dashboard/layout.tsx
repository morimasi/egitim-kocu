import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, first_name, role')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth/login')

  const isCoach = profile.role === 'coach'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="hidden lg:block w-64 bg-white border-r min-h-screen sticky top-0">
          <div className="h-16 flex items-center px-4 border-b">
            <span className="text-lg font-semibold text-gray-900">Eğitim Koçu</span>
          </div>
          <nav className="p-4 space-y-1">
            {isCoach ? (
              <>
                <NavLink href="/dashboard/coach" label="Dashboard" />
                <NavLink href="/dashboard/coach/assignments" label="Ödevler" />
                <NavLink href="/dashboard/coach/students" label="Öğrenciler" />
                <NavLink href="/dashboard/coach/messages" label="Mesajlar" />
              </>
            ) : (
              <>
                <NavLink href="/dashboard/student" label="Dashboard" />
                <NavLink href="/dashboard/student/assignments" label="Ödevlerim" />
                <NavLink href="/dashboard/student/messages" label="Mesajlar" />
                <NavLink href="/dashboard/student/progress" label="İlerleme" />
              </>
            )}
          </nav>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="lg:hidden bg-white border-b">
            <div className="h-16 max-w-7xl mx-auto px-4 flex items-center justify-between">
              <span className="text-base font-semibold text-gray-900">Eğitim Koçu</span>
              <MobileMenu isCoach={isCoach} />
            </div>
          </header>
          <main className="max-w-7xl mx-auto">{children}</main>
        </div>
      </div>
    </div>
  )
}

function NavLink({ href, label }: { href: string, label: string }) {
  'use client'
  const pathname = usePathname()
  const active = pathname === href
  return (
    <Link
      href={href}
      className={cn(
        'block px-3 py-2 rounded-md text-sm hover:bg-gray-100',
        active ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700'
      )}
    >
      {label}
    </Link>
  )
}

function MobileMenu({ isCoach }: { isCoach: boolean }) {
  'use client'
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setOpen(v => !v)}>
        Menü
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg p-2 z-50">
          {isCoach ? (
            <div className="space-y-1">
              <NavLink href="/dashboard/coach" label="Dashboard" />
              <NavLink href="/dashboard/coach/assignments" label="Ödevler" />
              <NavLink href="/dashboard/coach/students" label="Öğrenciler" />
              <NavLink href="/dashboard/coach/messages" label="Mesajlar" />
            </div>
          ) : (
            <div className="space-y-1">
              <NavLink href="/dashboard/student" label="Dashboard" />
              <NavLink href="/dashboard/student/assignments" label="Ödevlerim" />
              <NavLink href="/dashboard/student/messages" label="Mesajlar" />
              <NavLink href="/dashboard/student/progress" label="İlerleme" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'

