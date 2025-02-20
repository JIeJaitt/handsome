import "./globals.css";
import 'highlight.js/styles/tokyo-night-dark.css'
import ThemeProvider from '@/components/ThemeProvider'
import { metadata } from './metadata'

export { metadata }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className="font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
