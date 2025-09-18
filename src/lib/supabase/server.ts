'use server'

import { createServerComponentClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

// Server component client
export const createServerSupabaseClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}
