// Daha hızlı derleme için optimize edilmiş PostCSS yapılandırması
module.exports = {
  plugins: {
    // Tailwind CSS
    '@tailwindcss/postcss': {
      // Geliştirme modunda daha hızlı derleme için
      ...(process.env.NODE_ENV === 'production' ? {
        cssnano: {
          preset: ['default', {
            discardComments: {
              removeAll: true,
            },
          }],
        },
      } : {}),
    },
    
    // Autoprefixer
    autoprefixer: {
      // Tarayıcı desteği
      overrideBrowserslist: [
        '>1%',
        'last 4 versions',
        'Firefox ESR',
        'not ie < 11',
      ],
      // Grid düzenlemeleri için
      grid: 'autoplace',
    },
    
    // CSSNano (sadece production'da)
    ...(process.env.NODE_ENV === 'production' 
      ? {
          'cssnano': {
            preset: ['default', {
              discardComments: {
                removeAll: true,
              },
              normalizeWhitespace: true,
            }],
          },
        } 
      : {}),
  },
};
