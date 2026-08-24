import type { Metadata } from 'next';
import { Inter, Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ToastContainer } from '@/components/Toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AeroMatrix ATO — Flight Training Operations & DGCA FDTL Compliance Platform',
  description:
    'Comprehensive operational scheduling, simulator resource allocation, instructor qualification tracking, and DGCA CAR FDTL compliance engine.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} font-sans bg-aviation-950 text-slate-100 min-h-screen antialiased`}>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
