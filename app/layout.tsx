import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { ChatProvider } from '@/contexts/ChatContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'RAG Chatbot Demo',
  description: 'A RAG chatbot with vector search and persistent chat sessions',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={cn(inter.className, 'bg-background')}>
        <ChatProvider>
          <div className="flex h-screen">
            <main className="flex-1 p-4 overflow-auto">{children}</main>
          </div>
        </ChatProvider>
      </body>
    </html>
  );
}
