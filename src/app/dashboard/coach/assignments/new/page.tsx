'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { BookOpen, Calendar, Clock, Plus } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function NewAssignmentPage() {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    studentId: (searchParams.get('studentId') as string) || '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    estimatedDuration: '',
    instructions: '',
    maxScore: '100'
  })
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<any[]>([])
  const router = useRouter()
  const supabase = createSupabaseClient()
  const { toast } = useToast()

  // Öğrenci listesini yükle
  useState(() => {
    const fetchStudents = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('students')
          .select('id, profiles(first_name, last_name)')
          .eq('coach_id', user.id)
          .eq('is_active', true)

        if (error) {
          toast({
            title: "Hata",
            description: "Öğrenci listesi yüklenirken bir hata oluştu.",
            variant: "destructive"
          })
          return
        }

        setStudents(data || [])
      } catch (err) {
        toast({
          title: "Hata",
          description: "Bir hata oluştu.",
          variant: "destructive"
        })
      }
    }

    fetchStudents()
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    // Basit istemci doğrulamaları
    if (!formData.title.trim() || formData.title.trim().length < 3) {
      toast({ title: 'Doğrulama', description: 'Başlık en az 3 karakter olmalı.', variant: 'destructive' })
      return
    }
    if (formData.title.length > 200) {
      toast({ title: 'Doğrulama', description: 'Başlık 200 karakteri aşmamalı.', variant: 'destructive' })
      return
    }
    if (formData.description && formData.description.length > 5000) {
      toast({ title: 'Doğrulama', description: 'Açıklama çok uzun (maks. 5000).', variant: 'destructive' })
      return
    }
    if (!formData.studentId) {
      toast({ title: 'Doğrulama', description: 'Öğrenci seçmelisiniz.', variant: 'destructive' })
      return
    }
    if (!formData.dueDate) {
      toast({ title: 'Doğrulama', description: 'Teslim tarihi gerekli.', variant: 'destructive' })
      return
    }
    const due = new Date(formData.dueDate)
    if (isNaN(due.getTime()) || due.getTime() < Date.now() - 60_000) {
      toast({ title: 'Doğrulama', description: 'Teslim tarihi ileri bir tarih olmalı.', variant: 'destructive' })
      return
    }
    const maxScore = parseInt(formData.maxScore)
    if (isNaN(maxScore) || maxScore < 1 || maxScore > 1000) {
      toast({ title: 'Doğrulama', description: 'Maksimum puan 1-1000 aralığında olmalı.', variant: 'destructive' })
      return
    }
    if (formData.estimatedDuration) {
      const d = parseInt(formData.estimatedDuration)
      if (isNaN(d) || d < 1 || d > 24 * 60) {
        toast({ title: 'Doğrulama', description: 'Tahmini süre 1-1440 dakika olmalı.', variant: 'destructive' })
        return
      }
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Hata",
          description: "Kullanıcı bulunamadı. Lütfen tekrar giriş yapın.",
          variant: "destructive"
        })
        setLoading(false)
        return
      }

      // Ödevi oluştur
      const { data, error } = await supabase
        .from('assignments')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            subject: formData.subject,
            coach_id: user.id,
            student_id: formData.studentId,
            due_date: formData.dueDate,
            priority: formData.priority,
            estimated_duration: formData.estimatedDuration ? parseInt(formData.estimatedDuration) : null,
            instructions: formData.instructions,
            max_score: parseInt(formData.maxScore)
          }
        ])
        .select()

      if (error) {
        toast({
          title: "Hata",
          description: "Ödev oluşturulurken bir hata oluştu: " + error.message,
          variant: "destructive"
        })
        setLoading(false)
        return
      }

      toast({
        title: "Başarılı",
        description: "Ödev başarıyla oluşturuldu."
      })

      // Ödev listesine yönlendir
      router.push('/dashboard/coach/assignments')
    } catch (err) {
      toast({
        title: "Hata",
        description: "Bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
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
                Yeni Ödev Oluştur
              </h1>
              <p className="text-sm text-gray-600">Öğrenciler için yeni ödev tanımlayın</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/dashboard/coach/assignments">
                <Button variant="outline">
                  İptal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Ödev Bilgileri</CardTitle>
            <CardDescription>
              Yeni ödev oluşturmak için aşağıdaki bilgileri doldurun
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Ödev Başlığı</Label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="title"
                      name="title"
                      placeholder="Matematik Ödevi #1"
                      value={formData.title}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Ders</Label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="Matematik"
                    value={formData.subject}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentId">Öğrenci</Label>
                  <Select 
                    value={formData.studentId} 
                    onValueChange={(value) => handleSelectChange('studentId', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Öğrenci seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.profiles?.first_name} {student.profiles?.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Teslim Tarihi</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="dueDate"
                      name="dueDate"
                      type="datetime-local"
                      value={formData.dueDate}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Öncelik</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => handleSelectChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Öncelik seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Düşük</SelectItem>
                      <SelectItem value="medium">Orta</SelectItem>
                      <SelectItem value="high">Yüksek</SelectItem>
                      <SelectItem value="urgent">Acil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedDuration">Tahmini Süre (dakika)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="estimatedDuration"
                      name="estimatedDuration"
                      type="number"
                      placeholder="60"
                      value={formData.estimatedDuration}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxScore">Maksimum Puan</Label>
                  <Input
                    id="maxScore"
                    name="maxScore"
                    type="number"
                    placeholder="100"
                    value={formData.maxScore}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Ödev Açıklaması</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Ödevin detaylı açıklamasını buraya yazın..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Talimatlar</Label>
                <Textarea
                  id="instructions"
                  name="instructions"
                  placeholder="Öğrenciler için özel talimatları buraya yazın..."
                  value={formData.instructions}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Link href="/dashboard/coach/assignments">
                  <Button variant="outline">
                    İptal
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Ödevi Oluştur
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}