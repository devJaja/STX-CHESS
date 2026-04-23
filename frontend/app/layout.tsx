import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'Stack Chess — Chess on Bitcoin',
  description: 'Decentralized chess on the Stacks blockchain — every move recorded on-chain.',
  openGraph: {
    title: 'Stack Chess',
    description: 'Play chess on Bitcoin via the Stacks blockchain.',
    type: 'website',
  },
  icons: { icon: '/favicon.ico' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f9fb' },
    { media: '(prefers-color-scheme: dark)',  color: '#0d0f14' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
