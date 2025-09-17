'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border rounded-lg p-6 text-center space-y-4">
        <h1 className="text-xl font-semibold text-gray-900">Bir hata oluştu</h1>
        <p className="text-sm text-gray-600">İşlem sırasında bir hata meydana geldi. Lütfen tekrar deneyin.</p>
        {process.env.NODE_ENV !== 'production' && (
          <pre className="text-left text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">{error?.message}</pre>
        )}
        <div className="flex items-center justify-center gap-2">
          <Button onClick={() => reset()} variant="outline">Tekrar Dene</Button>
          <Link href="/dashboard">
            <Button>Ana Sayfa</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}


