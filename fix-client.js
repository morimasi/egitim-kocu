const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src/app');

async function processDirectory(directory) {
  const files = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(directory, file.name);
    
    if (file.isDirectory()) {
      await processDirectory(fullPath);
    } else if (file.name === 'page.tsx') {
      await processPageFile(fullPath);
    }
  }
}

async function processPageFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Eğer zaten 'use client' ekliyse atla
  if (content.includes("'use client'")) {
    console.log(`Skipping (already client): ${filePath}`);
    return;
  }
  
  // createServerComponentClient yerine createClientComponentClient kullan
  if (content.includes('createServerComponentClient')) {
    content = content.replace(
      /import\s+{\s*createServerComponentClient\s*}\s+from\s+['"]@supabase\/ssr['"]/g,
      'import { createClientComponentClient } from \'@supabase/auth-helpers-nextjs\''
    );
    
    content = content.replace(
      /const\s+supabase\s*=\s*createServerComponentClient\([^)]*\)/g,
      'const supabase = createClientComponentClient()'
    );
    
    // async fonksiyonunu kaldır ve client component'e dönüştür
    content = content.replace(
      /export\s+default\s+async\s+function\s+(\w+)/g,
      'export default function $1'
    );
    
    // use client ekle
    content = "'use client';\n\n" + content;
    
    // Kullanıcı kontrolünü useEffect içine taşı
    content = content.replace(
      /const\s*{\s*data:\s*{\s*user\s*}\s*}\s*=\s*await\s+supabase\.auth\.getUser\(\)\s*\n\s*if\s*\(!user\)\s*redirect\('[^']+'\)/g,
      'const [user, setUser] = useState(null);\n  const router = useRouter();\n  \n  useEffect(() => {\n    const getSession = async () => {\n      const { data: { session } } = await supabase.auth.getSession();\n      if (!session) {\n        router.push(\'/auth/login\');\n        return;\n      }\n      setUser(session.user);\n    };\n    \n    getSession();\n  }, [router, supabase]);\n  \n  if (!user) return <div>Yükleniyor...</div>;'
    );
    
    // Gerekli importları ekle
    if (!content.includes('useEffect') && content.includes('useState')) {
      content = content.replace(
        /import\s+{\s*useState\s*}/,
        'import { useState, useEffect }'
      );
    } else if (!content.includes('useEffect') && !content.includes('useState')) {
      content = content.replace(
        /import\s+([^']+?)from\s+['"]/,
        'import { useState, useEffect } from \'react\';\nimport '
      );
    }
    
    if (!content.includes('useRouter')) {
      content = content.replace(
        /import\s+([^']+?)from\s+['"]next\/navigation['"]/,
        'import { useRouter } from \'next/navigation\'\nimport $1from \'next/navigation\''
      );
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

// Scripti çalıştır
processDirectory(pagesDir)
  .then(() => console.log('Tüm dosyalar güncellendi!'))
  .catch(console.error);
