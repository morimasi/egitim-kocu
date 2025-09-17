# Eğitim Koçluğu Uygulaması

Modern, hızlı ve kullanıcı dostu eğitim koçluğu platformu. Öğrenci takibi, ödev yönetimi, hatırlatmalar ve iletişim özelliklerini tek platformda sunar.

## 🚀 Özellikler

- **👨‍🏫 Koç Paneli**: Öğrenci yönetimi, ödev atama, ilerleme takibi
- **👩‍🎓 Öğrenci Paneli**: Ödev görüntüleme/teslimi, mesajlaşma, ilerleme raporu
- **📝 Ödev Yönetimi**: Kolay ödev oluşturma, atama ve değerlendirme
- **💬 Mesajlaşma**: Koç-öğrenci arası anlık iletişim
- **📊 İlerleme Takibi**: Detaylı performans raporları
- **🔒 Güvenli Authentication**: Supabase Auth ile güvenli giriş sistemi
- **📱 Responsive Design**: Mobile-friendly arayüz

## 🛠️ Teknoloji Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React
- **Deployment**: Vercel (önerilen)

## 📋 Kurulum

### 1. Bağımlılıkları yükleyin
```bash
npm install
```

### 2. Supabase Kurulumu

#### a) Supabase projesini oluşturun
1. [supabase.com](https://supabase.com) adresine gidin
2. Yeni proje oluşturun
3. Proje URL'sini ve Anon Key'ini not alın

#### b) Veritabanı şemasını oluşturun
1. Supabase Dashboard'da SQL Editor'e gidin
2. `database/schema.sql` dosyasındaki SQL kodlarını çalıştırın

### 3. Environment Variables

`.env.local` dosyasını güncelleyin:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Geliştirme sunucusunu başlatın
```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışmaya başlayacaktır.

## 📊 Veritabanı Şeması

### Ana Tablolar

- **profiles**: Kullanıcı profilleri (koç/öğrenci rolleri)
- **students**: Öğrenci detay bilgileri
- **assignments**: Ödevler
- **assignment_submissions**: Ödev teslimleri
- **assignment_reviews**: Ödev değerlendirmeleri
- **messages**: Mesajlaşma sistemi
- **reminders**: Hatırlatmalar
- **student_progress**: İlerleme takibi

### Güvenlik (RLS)

Tüm tablolarda Row Level Security (RLS) aktif:
- Kullanıcılar sadece kendi verilerine erişebilir
- Koçlar sadece kendi öğrencilerini görür
- Öğrenciler sadece kendi ödevlerini görür

## 🚦 Kullanım

### İlk Kullanıcı Oluşturma

1. Ana sayfada "Kayıt Ol" butonuna tıklayın
2. Bilgilerinizi girin ve **Koç** rolünü seçin
3. E-posta onayından sonra giriş yapın
4. Koç dashboard'ında "Öğrenci Ekle" ile öğrenci profilleri oluşturun

### Koç Olarak

- **Dashboard**: Genel bakış ve istatistikler
- **Yeni Ödev**: Öğrencilere ödev atama
- **Öğrenci Ekle**: Yeni öğrenci profili oluşturma
- **Mesajlar**: Öğrencilerle iletişim

### Öğrenci Olarak

- **Dashboard**: Ödevler ve ilerleme özeti
- **Ödevlerim**: Atanan ödevleri görüntüleme ve teslim etme
- **Mesajlar**: Koçla iletişim

## 🚀 Deploy

### Vercel'e Deploy (Önerilen)

1. GitHub'a push edin
2. [vercel.com](https://vercel.com) hesabınızla bağlanın
3. Projeyi import edin
4. Environment variables'ları ekleyin
5. Deploy edin

## 📝 To-Do

- [ ] Ödev yönetimi modülü (oluşturma, listeleme, teslim)
- [ ] Mesajlaşma sistemi
- [ ] E-posta bildirimleri
- [ ] Dosya yükleme sistemi
- [ ] İlerleme raporu grafikleri

## 📄 Lisans

MIT License

---

**Not**: Bu proje hızlı prototyping için optimize edilmiştir. Production kullanımı için ek güvenlik önlemleri ve testler eklenmelidir.
