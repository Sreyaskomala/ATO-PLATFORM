import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport = {
  themeColor: '#0F172A',
};

export const metadata: Metadata = {
  title: 'AVI OPS Connect — FSTD Operations Platform',
  description: 'Enterprise-grade Flight Simulator Training Device Operations Management. Precision in Training. Excellence in Flight.',
  keywords: ['aviation', 'FSTD', 'flight simulator', 'training', 'AVI'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
