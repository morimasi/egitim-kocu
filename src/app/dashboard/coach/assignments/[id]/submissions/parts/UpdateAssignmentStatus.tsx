"use client"

import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { createSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export default function UpdateAssignmentStatus({ assignmentId }: { assignmentId: string }) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createSupabaseClient()

  async function setStatus(status: 'pending' | 'submitted' | 'reviewed' | 'completed') {
    setLoading(true)
    try {
      const { error } = await supabase.from('assignments').update({ status }).eq('id', assignmentId)
      if (error) throw error
      toast({ title: 'Durum güncellendi', description: `Durum: ${status}` })
    } catch (err: any) {
      toast({ title: 'Hata', description: err.message || 'Durum güncellenemedi', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button variant="outline" disabled={loading} onClick={() => setStatus('reviewed')}>Değerlendirildi</Button>
      <Button variant="outline" disabled={loading} onClick={() => setStatus('completed')}>Tamamlandı</Button>
    </div>
  )
}


