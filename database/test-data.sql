-- Eğitim Koçluğu Uygulaması Test Verileri
-- Bu dosyayı Supabase SQL Editor'de çalıştırarak test verileri ekleyebilirsiniz

-- NOT: Bu veriler sadece authentication olmadan test için kullanılır
-- Gerçek kullanımda profiles tablosu Supabase Auth ile otomatik doldurulur

-- Örnek koç profili (Test için - gerçekte Supabase Auth'dan gelir)
INSERT INTO profiles (id, email, first_name, last_name, role, avatar_url, phone) VALUES
(gen_random_uuid(), 'coach@test.com', 'Ahmet', 'Yılmaz', 'coach', null, '+90 555 123 4567');

-- Örnek öğrenci profilleri (Test için - gerçekte Supabase Auth'dan gelir)
INSERT INTO profiles (id, email, first_name, last_name, role, avatar_url, phone) VALUES
(gen_random_uuid(), 'student1@test.com', 'Elif', 'Demir', 'student', null, '+90 555 987 6543'),
(gen_random_uuid(), 'student2@test.com', 'Can', 'Kaya', 'student', null, '+90 555 111 2233');

-- Koç ID'sini almak için
DO $$
DECLARE
    coach_profile_id UUID;
    student1_profile_id UUID;
    student2_profile_id UUID;
    student1_id UUID;
    student2_id UUID;
    assignment1_id UUID;
    assignment2_id UUID;
BEGIN
    -- Profile ID'lerini al
    SELECT id INTO coach_profile_id FROM profiles WHERE email = 'coach@test.com';
    SELECT id INTO student1_profile_id FROM profiles WHERE email = 'student1@test.com';
    SELECT id INTO student2_profile_id FROM profiles WHERE email = 'student2@test.com';

    -- Öğrenci detay kayıtları ekle
    INSERT INTO students (id, profile_id, coach_id, grade_level, school_name, subjects, goals, parent_email, parent_phone) VALUES
    (gen_random_uuid(), student1_profile_id, coach_profile_id, '9. Sınıf', 'Atatürk Lisesi', '{"Matematik","Fizik","Kimya"}', 'Üniversite sınavına hazırlanmak', 'anne1@test.com', '+90 555 444 5566'),
    (gen_random_uuid(), student2_profile_id, coach_profile_id, '11. Sınıf', 'Gazi Lisesi', '{"Matematik","Türkçe","Tarih"}', 'Sayısal bölüm hedefi', 'anne2@test.com', '+90 555 777 8899')
    RETURNING id INTO student1_id, student2_id;

    -- Student ID'lerini tekrar al (RETURNING sadece son kaydı döndürür)
    SELECT id INTO student1_id FROM students WHERE profile_id = student1_profile_id;
    SELECT id INTO student2_id FROM students WHERE profile_id = student2_profile_id;

    -- Örnek ödevler ekle
    INSERT INTO assignments (id, title, description, subject, coach_id, student_id, due_date, priority, status, estimated_duration, instructions, max_score) VALUES
    (gen_random_uuid(), 'Fonksiyonlar Konu Tekrarı', 'Birinci ve ikinci dereceden fonksiyonların özelliklerini tekrar edin', 'Matematik', coach_profile_id, student1_id, NOW() + INTERVAL '3 days', 'medium', 'pending', 120, 'Ders kitabı sayfa 45-60 arası konuları çalışın ve alıştırmaları çözün', 100),
    (gen_random_uuid(), 'Fizik Problem Çözümü', 'Hareket konusundan 10 problem çözün', 'Fizik', coach_profile_id, student1_id, NOW() + INTERVAL '5 days', 'high', 'pending', 90, 'Kuvvet ve hareket konularından karma problemler çözün', 100),
    (gen_random_uuid(), 'Kompozisyon Yazımı', 'Çevre kirliliği konusunda 300 kelimelik kompozisyon yazın', 'Türkçe', coach_profile_id, student2_id, NOW() + INTERVAL '2 days', 'medium', 'pending', 60, 'Giriş-gelişme-sonuç bölümlerini unutmayın', 100)
    RETURNING id INTO assignment1_id, assignment2_id;

    -- Örnek hatırlatmalar ekle
    INSERT INTO reminders (user_id, assignment_id, title, message, remind_at, reminder_type) VALUES
    (student1_profile_id, assignment1_id, 'Matematik Ödevi Hatırlatması', 'Fonksiyonlar konusu ödevinizin teslim tarihi yaklaşıyor', NOW() + INTERVAL '2 days', 'assignment_due'),
    (student2_profile_id, assignment2_id, 'Kompozisyon Ödevi', 'Türkçe kompozisyon ödevinizi unutmayın', NOW() + INTERVAL '1 day', 'assignment_due');

    -- İlerleme takip verileri
    INSERT INTO student_progress (student_id, subject, week_start, assignments_completed, assignments_total, average_score, study_hours) VALUES
    (student1_id, 'Matematik', CURRENT_DATE - INTERVAL '7 days', 3, 5, 85.50, 8.5),
    (student1_id, 'Fizik', CURRENT_DATE - INTERVAL '7 days', 2, 3, 78.00, 6.0),
    (student2_id, 'Matematik', CURRENT_DATE - INTERVAL '7 days', 4, 4, 92.25, 10.0),
    (student2_id, 'Türkçe', CURRENT_DATE - INTERVAL '7 days', 2, 3, 88.00, 5.5);

END $$;

-- Verilerin başarıyla eklenip eklenmediğini kontrol etmek için
SELECT 
    'Profiles' as table_name, 
    COUNT(*) as record_count 
FROM profiles
UNION ALL
SELECT 
    'Students' as table_name, 
    COUNT(*) as record_count 
FROM students
UNION ALL
SELECT 
    'Assignments' as table_name, 
    COUNT(*) as record_count 
FROM assignments
UNION ALL
SELECT 
    'Reminders' as table_name, 
    COUNT(*) as record_count 
FROM reminders
UNION ALL
SELECT 
    'Student Progress' as table_name, 
    COUNT(*) as record_count 
FROM student_progress;