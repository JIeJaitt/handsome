import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'PingFang SC',
          'Microsoft YaHei',
          'sans-serif'
        ],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            '--prose-body': theme('colors.gray[700]'),
            '--prose-headings': theme('colors.gray[900]'),
            '--prose-lead': theme('colors.gray[600]'),
            '--prose-links': theme('colors.teal[500]'),
            '--prose-bold': theme('colors.gray[900]'),
            '--prose-counters': theme('colors.gray[500]'),
            '--prose-bullets': theme('colors.gray[300]'),
            '--prose-hr': theme('colors.gray[200]'),
            '--prose-quotes': theme('colors.gray[900]'),
            '--prose-quote-borders': theme('colors.gray[200]'),
            '--prose-captions': theme('colors.gray[500]'),
            '--prose-code': theme('colors.pink[600]'),
            '--prose-pre-code': theme('colors.gray[200]'),
            '--prose-pre-bg': theme('colors.gray[800]'),
            '--prose-th-borders': theme('colors.gray[300]'),
            '--prose-td-borders': theme('colors.gray[200]'),

            '--prose-invert-body': theme('colors.gray[300]'),
            '--prose-invert-headings': theme('colors.white'),
            '--prose-invert-lead': theme('colors.gray[400]'),
            '--prose-invert-links': theme('colors.teal[400]'),
            '--prose-invert-bold': theme('colors.white'),
            '--prose-invert-counters': theme('colors.gray[400]'),
            '--prose-invert-bullets': theme('colors.gray[600]'),
            '--prose-invert-hr': theme('colors.gray[700]'),
            '--prose-invert-quotes': theme('colors.gray[100]'),
            '--prose-invert-quote-borders': theme('colors.gray[700]'),
            '--prose-invert-captions': theme('colors.gray[400]'),
            '--prose-invert-code': theme('colors.pink[400]'),
            '--prose-invert-pre-code': theme('colors.gray[300]'),
            '--prose-invert-pre-bg': '#1a1b26',
            '--prose-invert-th-borders': theme('colors.gray[600]'),
            '--prose-invert-td-borders': theme('colors.gray[700]'),

            // ... rest of the styles
            h1: { fontWeight: '700' },
            h2: { fontWeight: '600' },
            h3: { fontWeight: '500' },
            a: {
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.2s ease-in-out',
            },
            'a:hover': {
                color: 'var(--prose-links-hover)'
            },
            'code::before': {
              content: ''
            },
            'code::after': {
              content: ''
            },
            code: {
              fontWeight: '500',
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
            },
            pre: {
              border: `1px solid ${theme('colors.gray.700')}`,
              borderRadius: '0.5rem',
            },
            blockquote: {
                fontStyle: 'normal'
            }
          }
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} satisfies Config;
