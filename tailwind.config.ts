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
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'var(--foreground)',
            a: {
              color: '#3182ce',
              '&:hover': {
                color: '#2c5282',
              },
              textDecoration: 'none',
            },
            'h1,h2,h3,h4': {
              color: 'var(--foreground)',
              fontWeight: '600',
              letterSpacing: '-0.02em',
            },
            h1: {
              fontSize: '2.25em',
              marginTop: '2em',
            },
            h2: {
              fontSize: '1.875em',
              marginTop: '1.75em',
            },
            h3: {
              fontSize: '1.5em',
              marginTop: '1.5em',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            code: {
              color: '#e83e8c',
              backgroundColor: '#f8f9fa',
              padding: '0.2em 0.4em',
              borderRadius: '3px',
              fontSize: '0.875em',
            },
            'pre code': {
              backgroundColor: 'transparent',
              borderWidth: '0',
              borderRadius: '0',
              padding: '0',
              fontWeight: '400',
              color: 'inherit',
              fontSize: 'inherit',
              fontFamily: 'inherit',
              lineHeight: 'inherit',
            },
            pre: {
              backgroundColor: '#1a1b26',
              color: '#a9b1d6',
              borderRadius: '0.75rem',
              padding: '1.25em',
              overflow: 'auto',
              border: '1px solid #2f3347',
            },
            blockquote: {
              borderLeftColor: '#e2e8f0',
              color: '#718096',
              fontStyle: 'normal',
              padding: '0.5em 1em',
            },
            'blockquote p:first-of-type::before': {
              content: '""',
            },
            'blockquote p:last-of-type::after': {
              content: '""',
            },
            table: {
              width: '100%',
              borderCollapse: 'collapse',
              borderSpacing: 0,
              marginTop: '2em',
              marginBottom: '2em',
            },
            thead: {
              borderBottomColor: '#cbd5e0',
            },
            'thead th': {
              fontWeight: '600',
              borderBottom: '2px solid #e2e8f0',
              padding: '0.75em',
              textAlign: 'left',
            },
            'tbody tr': {
              borderBottomColor: '#e2e8f0',
            },
            'tbody td': {
              padding: '0.75em',
              borderBottom: '1px solid #e2e8f0',
              verticalAlign: 'top',
            },
            'tbody tr:last-child td': {
              borderBottom: 'none',
            },
            'tbody tr:nth-child(odd)': {
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
            },
            hr: {
              borderColor: '#e2e8f0',
              marginTop: '3em',
              marginBottom: '3em',
            },
            ul: {
              listStyleType: 'disc',
              paddingLeft: '1.625em',
            },
            ol: {
              paddingLeft: '1.625em',
            },
            'ul > li::marker': {
              color: '#718096',
            },
            'ol > li::marker': {
              color: '#718096',
            },
            '.hljs-comment,.hljs-quote': {
              color: '#5c6370',
              fontStyle: 'italic',
            },
            '.hljs-doctag,.hljs-keyword,.hljs-formula': {
              color: '#c678dd',
            },
            '.hljs-section,.hljs-name,.hljs-selector-tag,.hljs-deletion,.hljs-subst': {
              color: '#e06c75',
            },
            '.hljs-literal': {
              color: '#56b6c2',
            },
            '.hljs-string,.hljs-regexp,.hljs-addition,.hljs-attribute,.hljs-meta-string': {
              color: '#98c379',
            },
            '.hljs-built_in,.hljs-class .hljs-title': {
              color: '#e6c07b',
            },
            '.hljs-attr,.hljs-variable,.hljs-template-variable,.hljs-type,.hljs-selector-class,.hljs-selector-attr,.hljs-selector-pseudo,.hljs-number': {
              color: '#d19a66',
            },
            '.hljs-symbol,.hljs-bullet,.hljs-link,.hljs-meta,.hljs-selector-id,.hljs-title': {
              color: '#61aeee',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} satisfies Config;
