/** @type {import('tailwindcss').Config} */
import animate from 'tailwindcss-animate';

// Daha hızlı derleme için safleyi devre dışı bırak
if (process.env.NODE_ENV !== 'production') {
  process.env.TAILWIND_DISABLE_TOUCH = 'true';
  process.env.TAILWIND_MODE = 'watch';
}

const config = {
  // JIT modunu kullanarak daha hızlı derleme
  mode: 'jit',
  // Karanlık modu sınıf tabanlı olarak ayarla
  darkMode: ['class'],
  // İçerik tarama yolları
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Üretimde kullanılmayan stilleri temizle
  ...(process.env.NODE_ENV === 'production' ? {
    purge: {
      content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
      ],
      options: {
        safelist: ['dark'],
        keyframes: true,
        fontFace: true,
      },
    },
  } : {}),
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      borderColor: {
        DEFAULT: 'hsl(var(--border))',
      },
      colors: {
        border: "hsl(var(--border)",
        input: "hsl(var(--input)",
        ring: "hsl(var(--ring)",
        background: "hsl(var(--background)",
        foreground: "hsl(var(--foreground)",
        primary: {
          DEFAULT: "hsl(var(--primary)",
          foreground: "hsl(var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary)",
          foreground: "hsl(var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [animate],
};

export default config;
