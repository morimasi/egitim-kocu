"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { createClientSupabaseClient } from '@/lib/supabase'

export default function EditAssignmentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [assignment, setAssignment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    status: 'draft'
  })

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClientSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      setUser(user)
      
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      setProfile(profileData)
      
      // Fetch assignment
      const { data: assignmentData } = await supabase
        .from('assignments')
        .select('*')
        .eq('id', params.id)
        .single()
      
      if (assignmentData) {
        setAssignment(assignmentData)
        setFormData({
          title: assignmentData.title,
          description: assignmentData.description || '',
          due_date: assignmentData.due_date || '',
          status: assignmentData.status || 'draft'
        })
      }
      
      setLoading(false)
    }
    
    fetchData()
  }, [params.id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const supabase = createClientSupabaseClient()
      const { error } = await supabase
        .from('assignments')
        .update({
          title: formData.title,
          description: formData.description,
          due_date: formData.due_date,
          status: formData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)
        .eq('coach_id', user.id)
      
      if (error) throw error
      
      toast({
        title: 'Başarılı',
        description: 'Ödev başarıyla güncellendi',
        variant: 'default'
      })
      
      router.push(`/dashboard/coach/assignments/${params.id}`)
    } catch (error) {
      console.error('Error updating assignment:', error)
      toast({
        title: 'Hata',
        description: 'Ödev güncellenirken bir hata oluştu',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile || profile.role !== 'coach') {
    router.push('/auth/login')
    return null
  }

  if (!assignment) {
    router.push('/dashboard/coach/assignments')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-4">
          <h1 className="text-2xl font-bold text-gray-900">Ödevi Düzenle</h1>
          <Link href={`/dashboard/coach/assignments/${params.id}`}>
            <Button variant="outline">Geri</Button>
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{assignment.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Başlık</Label>
                <Input 
                  id="title" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="due_date">Teslim Tarihi</Label>
                <Input
                  id="due_date"
                  type="datetime-local"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="status">Durum</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="draft">Taslak</option>
                  <option value="published">Yayında</option>
                  <option value="archived">Arşivlendi</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push(`/dashboard/coach/assignments/${params.id}`)}
                >
                  İptal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
