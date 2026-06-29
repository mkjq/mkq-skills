import type { Metadata } from 'next';
import { Cairo, Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import ThemeCustomizer from '@/components/ThemeCustomizer';
import Link from 'next/link';

const cairo = Cairo({ subsets: ['arabic'], variable: '--font-cairo' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'MKQ Skills | Premium AI Prompts',
  description: 'Manage your AI skills with a world-class premium interface.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" data-theme="dark">
      <body className={`${cairo.variable} ${inter.variable}`}>
        <ThemeProvider>
          <div className="layout-container">
            <div className="bg-animated-mesh"></div>
            <div className="app-content-wrapper">
               {children}
            </div>
            <footer style={{
              width: '100%',
              padding: '12px',
              display: 'flex',
              justifyContent: 'center',
              borderTop: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface-solid)',
              zIndex: 10
            }}>
              <Link href="/about" className="footer-link">
                من نحن
              </Link>
            </footer>
          </div>
          <ThemeCustomizer />
        </ThemeProvider>
      </body>
    </html>
  );
}
