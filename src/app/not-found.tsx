import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white border rounded-lg p-6 text-center space-y-4">
        <h1 className="text-xl font-semibold text-gray-900">Sayfa bulunamadı</h1>
        <p className="text-sm text-gray-600">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
        <Link href="/">
          <Button>Ana Sayfa</Button>
        </Link>
      </div>
    </div>
  )
}


