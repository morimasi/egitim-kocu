-- Eğitim Koçluğu Uygulaması Veritabanı Şeması (Güvenli Versiyon)
-- Bu dosya var olan yapıları kontrol eder ve sadece yoksa oluşturur

-- Kullanıcı rolleri için enum (sadece yoksa oluştur)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('coach', 'student');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ödev durumları için enum (sadece yoksa oluştur)
DO $$ BEGIN
    CREATE TYPE assignment_status AS ENUM ('pending', 'submitted', 'reviewed', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ödev öncelik seviyeleri için enum (sadece yoksa oluştur)
DO $$ BEGIN
    CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Kullanıcılar tablosu (Supabase Auth ile entegre)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    avatar_url VARCHAR(500),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Öğrenciler tablosu (ek bilgiler için)
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    coach_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    grade_level VARCHAR(50),
    school_name VARCHAR(200),
    subjects TEXT[], -- İlgilendiği dersler
    goals TEXT, -- Hedefler
    parent_email VARCHAR(255),
    parent_phone VARCHAR(20),
    enrollment_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ödevler tablosu
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    subject VARCHAR(100),
    coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    priority priority_level DEFAULT 'medium',
    status assignment_status DEFAULT 'pending',
    estimated_duration INTEGER, -- dakika cinsinden
    attachment_urls TEXT[], -- dosya URL'leri
    instructions TEXT,
    max_score INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ödev teslimleri tablosu
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    content TEXT, -- Metin içeriği
    attachment_urls TEXT[], -- Öğrenci dosyaları
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_final BOOLEAN DEFAULT false, -- Son teslim mi?
    notes TEXT -- Öğrenci notları
);

-- Ödev değerlendirmeleri tablosu
CREATE TABLE IF NOT EXISTS assignment_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES assignment_submissions(id) ON DELETE CASCADE,
    coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    score INTEGER,
    feedback TEXT,
    suggestions TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_final_review BOOLEAN DEFAULT false
);

-- Mesajlar tablosu
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachment_urls TEXT[],
    is_read BOOLEAN DEFAULT false,
    parent_message_id UUID REFERENCES messages(id) ON DELETE CASCADE, -- Yanıt için
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hatırlatmalar tablosu
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    remind_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_sent BOOLEAN DEFAULT false,
    reminder_type VARCHAR(50) DEFAULT 'assignment_due', -- 'assignment_due', 'custom', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Öğrenci progress takibi
CREATE TABLE IF NOT EXISTS student_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    subject VARCHAR(100),
    week_start DATE NOT NULL,
    assignments_completed INTEGER DEFAULT 0,
    assignments_total INTEGER DEFAULT 0,
    average_score DECIMAL(5,2),
    study_hours DECIMAL(5,2), -- haftalık çalışma saati
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler (performans için) - Sadece yoksa oluştur
DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_assignments_student_id ON assignments(student_id);
    CREATE INDEX IF NOT EXISTS idx_assignments_coach_id ON assignments(coach_id);
    CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
    CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);

    CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);
    CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_students_coach_id ON students(coach_id);
    CREATE INDEX IF NOT EXISTS idx_students_is_active ON students(is_active);

    CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
    CREATE INDEX IF NOT EXISTS idx_reminders_remind_at ON reminders(remind_at);
    CREATE INDEX IF NOT EXISTS idx_reminders_is_sent ON reminders(is_sent);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- RLS (Row Level Security) Politikaları
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;

-- Profiles politikaları
DO $$ BEGIN
    CREATE POLICY "Kullanıcılar kendi profillerini görebilir" ON profiles
        FOR SELECT USING (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Kullanıcılar kendi profillerini güncelleyebilir" ON profiles
        FOR UPDATE USING (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Students politikaları
DO $$ BEGIN
    CREATE POLICY "Koçlar kendi öğrencilerini görebilir" ON students
        FOR SELECT USING (
            coach_id = auth.uid() OR 
            profile_id = auth.uid()
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Koçlar öğrenci ekleyebilir" ON students
        FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() AND role = 'coach'
            )
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Assignments politikaları
DO $$ BEGIN
    CREATE POLICY "Koçlar ve öğrenciler ödevleri görebilir" ON assignments
        FOR SELECT USING (
            coach_id = auth.uid() OR 
            student_id IN (
                SELECT id FROM students WHERE profile_id = auth.uid()
            )
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Koçlar ödev oluşturabilir" ON assignments
        FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() AND role = 'coach'
            )
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Messages politikaları
DO $$ BEGIN
    CREATE POLICY "Kullanıcılar kendi mesajlarını görebilir" ON messages
        FOR SELECT USING (
            sender_id = auth.uid() OR receiver_id = auth.uid()
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Kullanıcılar mesaj gönderebilir" ON messages
        FOR INSERT WITH CHECK (sender_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Otomatik timestamp güncellemeleri için fonksiyon
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger'lar (sadece yoksa oluştur)
DO $$ BEGIN
    CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;