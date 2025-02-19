import type { Metadata } from "next";
import "./globals.css";
import 'highlight.js/styles/tokyo-night-dark.css'

export const metadata: Metadata = {
  title: "My Blog",
  description: "A modern blog built with Next.js and TailwindCSS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
