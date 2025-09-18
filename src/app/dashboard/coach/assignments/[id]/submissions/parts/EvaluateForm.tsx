"use client"

import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { createSupabaseClient } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export default function EvaluateForm({ assignmentId, submissionId }: { assignmentId: string, submissionId: string }) {
  const [score, setScore] = useState('')
  const [feedback, setFeedback] = useState('')
  const [suggestions, setSuggestions] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createSupabaseClient()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    const parsedScore = score ? parseInt(score) : null
    if (parsedScore && (parsedScore < 0 || parsedScore > 1000)) {
      toast({ title: 'Doğrulama', description: 'Puan 0-1000 aralığında olmalı', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Oturum bulunamadı')
      const { error } = await supabase
        .from('assignment_reviews')
        .insert([
          {
            assignment_id: assignmentId,
            submission_id: submissionId,
            coach_id: user.id,
            score: parsedScore,
            feedback,
            suggestions,
            is_final_review: true
          }
        ])
      if (error) throw error
      await supabase.from('assignments').update({ status: 'reviewed' }).eq('id', assignmentId)
      toast({ title: 'Değerlendirildi', description: 'Geri bildirim kaydedildi.' })
      setScore(''); setFeedback(''); setSuggestions('')
    } catch (err: any) {
      toast({ title: 'Hata', description: err.message || 'Değerlendirme sırasında hata oluştu', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="text-sm text-gray-600">Puan</label>
        <Input type="number" min={0} max={1000} value={score} onChange={e => setScore(e.target.value)} placeholder="100" />
      </div>
      <div>
        <label className="text-sm text-gray-600">Geri Bildirim</label>
        <Textarea rows={3} value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Genel geri bildirim" />
      </div>
      <div>
        <label className="text-sm text-gray-600">Öneriler</label>
        <Textarea rows={2} value={suggestions} onChange={e => setSuggestions(e.target.value)} placeholder="Geliştirme önerileri" />
      </div>
      <Button type="submit" disabled={loading}>{loading ? 'Kaydediliyor...' : 'Değerlendir ve Kaydet'}</Button>
    </form>
  )
}


