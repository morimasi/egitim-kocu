import { createHandler } from '@vercel/remix-custom-cache-handler';

const cacheHandler = createHandler({
  // Cache kontrolü için özel bir anahtar fonksiyonu
  getCacheKey: (req) => {
    const url = new URL(req.url);
    // URL'ye ve kullanıcı ajanına göre önbellek anahtarı oluştur
    return `${req.method}:${url.pathname}${url.search}:${req.headers.get('user-agent')}`;
  },
  
  // Önbellek süresini belirle (saniye cinsinden)
  getCacheTtl: (req) => {
    // Varsayılan önbellek süresi: 5 dakika
    let ttl = 5 * 60;
    
    // API yanıtları için daha kısa önbellek süresi
    if (req.url.includes('/api/')) {
      ttl = 30; // 30 saniye
    }
    
    // Statik dosyalar için daha uzun önbellek süresi
    if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
      ttl = 60 * 60 * 24 * 30; // 30 gün
    }
    
    return ttl;
  },
  
  // Önbellek kontrolü için özel mantık
  shouldCache: (req, res) => {
    // Sadece GET isteklerini önbelleğe al
    if (req.method !== 'GET') return false;
    
    // Hata durumlarını önbelleğe alma
    if (res.statusCode >= 400) return false;
    
    // Özel yolları önbelleğe alma
    if (req.url.includes('/_next/') || req.url.includes('/api/')) {
      return true;
    }
    
    // Varsayılan olarak sayfaları önbelleğe al
    return true;
  },
  
  // Önbellek yeniden doğrulama için
  revalidate: async () => {
    // Önbellek yenileme mantığı
    return false;
  },
});

export default cacheHandler;
