import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Block Breaker Game',
  description: 'A modern block breaker game built with Next.js, TypeScript, and HTML5 Canvas. Features smooth gameplay, particle effects, power-ups, and progressive difficulty levels.',
  keywords: ['block breaker', 'arcade game', 'browser game', 'HTML5 canvas', 'TypeScript'],
  authors: [{ name: 'Block Breaker Game' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#1f2937',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Block Breaker Game',
    description: 'A modern block breaker game with smooth gameplay and exciting power-ups',
    type: 'website',
    images: [
      {
        url: 'https://placehold.co/1200x630?text=Block+Breaker+Game+Screenshot+with+colorful+blocks+and+modern+UI',
        width: 1200,
        height: 630,
        alt: 'Block Breaker Game Screenshot with colorful blocks and modern UI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Block Breaker Game',
    description: 'A modern block breaker game with smooth gameplay and exciting power-ups',
    images: ['https://placehold.co/1200x630?text=Block+Breaker+Game+Screenshot+with+colorful+blocks+and+modern+UI'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="antialiased bg-gray-900 text-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}