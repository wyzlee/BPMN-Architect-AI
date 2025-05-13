import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import { Toaster } from '@/components/ui/toaster';
import { ScrollArea } from '@/components/ui/scroll-area';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'BPMN Architect AI',
  description: 'Interactive BPMN 2.0 Guide with AI-Powered Chat',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased flex h-screen overflow-hidden`}>
        <SidebarProvider defaultOpen>
          <AppSidebar />
          <main className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 h-full">
              <div className="p-4 md:p-6 lg:p-8">
                {children}
              </div>
            </ScrollArea>
          </main>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
