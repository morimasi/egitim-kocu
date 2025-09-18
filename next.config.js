/** @type {import('next').NextConfig} */
const nextConfig = {
  // Geliştirme modunda daha hızlı yeniden yükleme
  reactStrictMode: process.env.NODE_ENV === 'production',
  // Daha hızlı derleme için SWC'yi etkinleştir
  swcMinify: true,
  // GZIP ve Brotli sıkıştırması
  compress: true,
  // Görüntü optimizasyonu
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    minimumCacheTTL: 60, // 60 saniye
  },
  compiler: {
    // Daha hızlı build için dev modunda React devtools'u devre dışı bırak
    reactRemoveProperties: process.env.NODE_ENV === 'production',
    // Styled-components için geliştirici modunu kapat
    styledComponents: {
      displayName: process.env.NODE_ENV !== 'production',
      ssr: true,
    },
  },
  // Webpack yapılandırması
  webpack: (config, { isServer, dev }) => {
    // Geliştirme modunda bazı optimizasyonları devre dışı bırak
    if (!dev) {
      // Production-only optimizations
      config.optimization = {
        ...config.optimization,
        minimize: true,
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 25,
          cacheGroups: {
            framework: {
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types)[\\/]/,
              name: 'framework',
              chunks: 'all',
              priority: 40,
              enforce: true,
            },
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                const packageName = module.context.match(
                  /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                )?.[1];
                return packageName ? `lib.${packageName.replace('@', '')}` : null;
              },
              priority: 30,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    // Gerekli olmayan modülleri yüklemeyi önle
    config.resolve.alias = {
      ...config.resolve.alias,
      // Büyük kütüphaneleri sadece gerekli olduğunda yükle
      'react-icons': 'react-icons/lib/esm/iconBase',
    };

    // Webpack 5 için önbellek yapılandırması
    if (!isServer) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
    }

    return config;
  },
  // Deneysel özellikler
  experimental: {
    // Daha hızlı sayfa yüklemeleri için kaydırma konumunu koru
    scrollRestoration: true,
    // CSS optimizasyonu
    optimizeCss: true,
    // Paket optimizasyonu
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-slot',
      '@radix-ui/react-avatar',
      '@radix-ui/react-label',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
    ],
    // Daha hızlı derleme için
    turbo: {
      resolveAlias: {
        'react-icons': 'react-icons/lib/esm/iconBase',
      },
    },
    // Daha hızlı yeniden derleme
    fastRefresh: true,
    // Daha hızlı başlangıç süreleri için
    workerThreads: true,
    // Daha iyi önbellek yönetimi
    incrementalCacheHandlerPath: require.resolve('./cache-handler.js'),
  },
  // Üretimde performans ölçümleri
  productionBrowserSourceMaps: false, // Geliştirme dışında kapalı tutun
  // HTTP/2 push özelliği
  httpAgentOptions: {
    keepAlive: true,
  },
};

module.exports = nextConfig;
