-- Test Verilerini Temizleme SQL
-- Bu dosyayı önce çalıştırın, sonra test verilerini yükleyin

-- RLS'yi devre dışı bırak (temizleme için)
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

-- Var olan test verilerini temizle (ters sırada - foreign key'ler için)
DELETE FROM assignment_reviews;
DELETE FROM assignment_submissions;
DELETE FROM reminders;
DELETE FROM messages;
DELETE FROM student_progress;
DELETE FROM assignments;
DELETE FROM students;
DELETE FROM profiles;

-- Temizlik sonrası kontrol
SELECT 'TEMIZLIK SONRASI:' as info;
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
FROM assignment_submissions
UNION ALL
SELECT 
    'Assignment Reviews' as table_name, 
    COUNT(*) as record_count 
FROM assignment_reviews;