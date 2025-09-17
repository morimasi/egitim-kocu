-- Kapsamlı Test Verisi Sıfırlama ve Yükleme
-- Bu dosya önce her şeyi temizler, sonra test verilerini yükler

-- RLS'yi devre dışı bırak
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE reminders DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress DISABLE ROW LEVEL SECURITY;

-- Foreign key kısıtlamasını kaldır
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Tüm verileri temizle (cascade ile)
TRUNCATE TABLE assignment_reviews CASCADE;
TRUNCATE TABLE assignment_submissions CASCADE;
TRUNCATE TABLE reminders CASCADE;
TRUNCATE TABLE messages CASCADE;
TRUNCATE TABLE student_progress CASCADE;
TRUNCATE TABLE assignments CASCADE;
TRUNCATE TABLE students CASCADE;
TRUNCATE TABLE profiles CASCADE;

-- Test verilerini yükle
DO $$
DECLARE
    coach_profile_id UUID := gen_random_uuid();
    student1_profile_id UUID := gen_random_uuid();
    student2_profile_id UUID := gen_random_uuid();
    student1_id UUID;
    student2_id UUID;
    assignment1_id UUID;
    assignment2_id UUID;
    assignment3_id UUID;
BEGIN
    -- Örnek koç profili
    INSERT INTO profiles (id, email, first_name, last_name, role, avatar_url, phone) VALUES
    (coach_profile_id, 'coach@test.com', 'Ahmet', 'Yılmaz', 'coach', null, '+90 555 123 4567');

    -- Örnek öğrenci profilleri
    INSERT INTO profiles (id, email, first_name, last_name, role, avatar_url, phone) VALUES
    (student1_profile_id, 'student1@test.com', 'Elif', 'Demir', 'student', null, '+90 555 987 6543'),
    (student2_profile_id, 'student2@test.com', 'Can', 'Kaya', 'student', null, '+90 555 111 2233');

    -- Öğrenci detay kayıtları ekle
    INSERT INTO students (id, profile_id, coach_id, grade_level, school_name, subjects, goals, parent_email, parent_phone) VALUES
    (gen_random_uuid(), student1_profile_id, coach_profile_id, '9. Sınıf', 'Atatürk Lisesi', '{"Matematik","Fizik","Kimya"}', 'Üniversite sınavına hazırlanmak', 'anne1@test.com', '+90 555 444 5566'),
    (gen_random_uuid(), student2_profile_id, coach_profile_id, '11. Sınıf', 'Gazi Lisesi', '{"Matematik","Türkçe","Tarih"}', 'Sayısal bölüm hedefi', 'anne2@test.com', '+90 555 777 8899');

    -- Student ID'lerini al
    SELECT id INTO student1_id FROM students WHERE profile_id = student1_profile_id;
    SELECT id INTO student2_id FROM students WHERE profile_id = student2_profile_id;

    -- Örnek ödevler ekle
    INSERT INTO assignments (id, title, description, subject, coach_id, student_id, due_date, priority, status, estimated_duration, instructions, max_score) VALUES
    (gen_random_uuid(), 'Fonksiyonlar Konu Tekrarı', 'Birinci ve ikinci dereceden fonksiyonların özelliklerini tekrar edin', 'Matematik', coach_profile_id, student1_id, NOW() + INTERVAL '3 days', 'medium', 'pending', 120, 'Ders kitabı sayfa 45-60 arası konuları çalışın ve alıştırmaları çözün', 100),
    (gen_random_uuid(), 'Fizik Problem Çözümü', 'Hareket konusundan 10 problem çözün', 'Fizik', coach_profile_id, student1_id, NOW() + INTERVAL '5 days', 'high', 'pending', 90, 'Kuvvet ve hareket konularından karma problemler çözün', 100),
    (gen_random_uuid(), 'Kompozisyon Yazımı', 'Çevre kirliliği konusunda 300 kelimelik kompozisyon yazın', 'Türkçe', coach_profile_id, student2_id, NOW() + INTERVAL '2 days', 'medium', 'pending', 60, 'Giriş-gelişme-sonuç bölümlerini unutmayın', 100);

    -- Assignment ID'lerini al
    SELECT id INTO assignment1_id FROM assignments WHERE title = 'Fonksiyonlar Konu Tekrarı';
    SELECT id INTO assignment2_id FROM assignments WHERE title = 'Kompozisyon Yazımı';

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

    -- Örnek mesajlar ekle
    INSERT INTO messages (sender_id, receiver_id, content, is_read) VALUES
    (coach_profile_id, student1_profile_id, 'Matematik ödevindeki 3. soruda dikkat etmen gereken nokta var. Akşam saatlerinde çevrimiçi toplantı yapalım mı?', false),
    (student1_profile_id, coach_profile_id, 'Evet hocam, saat 19:00 uygun mu?', true),
    (coach_profile_id, student2_profile_id, 'Türkçe kompozisyon konusunda güzel ilerleme kaydetmişsin. Devam et!', false);

    -- Örnek ödev teslimi ekle
    INSERT INTO assignment_submissions (assignment_id, student_id, content, is_final, notes) VALUES
    (assignment1_id, student1_id, 'Fonksiyonlar konusunu çalıştım. Birinci derece fonksiyonların grafiklerini çizdim ve özelliklerini not aldım.', false, 'Grafik çiziminde zorlandım');

    RAISE NOTICE 'Test verileri başarıyla yüklendi!';

END $$;

-- Sonuçları kontrol et
SELECT 'YÜKLEME SONRASI KONTROL:' as info;

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
    'Messages' as table_name, 
    COUNT(*) as record_count 
FROM messages
UNION ALL
SELECT 
    'Reminders' as table_name, 
    COUNT(*) as record_count 
FROM reminders
UNION ALL
SELECT 
    'Student Progress' as table_name, 
    COUNT(*) as record_count 
FROM student_progress
UNION ALL
SELECT 
    'Assignment Submissions' as table_name, 
    COUNT(*) as record_count 
FROM assignment_submissions;

-- Test verilerini görüntüle
SELECT 'PROFIL LISTESI:' as info;
SELECT first_name, last_name, role, email FROM profiles ORDER BY role, first_name;

SELECT 'ÖĞRENCI-KOÇ EŞLEŞMELERI:' as info;
SELECT 
    s.grade_level,
    s.school_name,
    sp.first_name || ' ' || sp.last_name as student_name,
    cp.first_name || ' ' || cp.last_name as coach_name
FROM students s
JOIN profiles sp ON s.profile_id = sp.id
LEFT JOIN profiles cp ON s.coach_id = cp.id
ORDER BY s.grade_level;

SELECT 'ÖDEV LISTESI:' as info;
SELECT 
    title,
    subject,
    status,
    priority,
    due_date::date as due_date
FROM assignments 
ORDER BY due_date;