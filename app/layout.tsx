import Link from 'next/link';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Simple Chat App',
  description: 'A simple chat app with OpenAI integration',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={cn(inter.className, 'bg-background')}>
        <div className="flex h-screen">
          <main className="flex-1 p-4 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
