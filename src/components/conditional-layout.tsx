'use client';

import { useLocation } from 'react-router-dom';
import { Header } from '@/components/header';
import { AppHeader } from '@/components/app-header';
import { Footer } from '@/components/footer';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard-sidebar';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const pathname = location.pathname;
  const isAppRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  if (isAppRoute) {
    return (
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
              <DashboardSidebar />
              <div className="flex flex-1 flex-col">
                  <AppHeader />
                  <main className="flex-1 p-4 sm:p-6 bg-muted/40 overflow-auto">{children}</main>
              </div>
          </div>
        </SidebarProvider>
    );
  }

  // For public routes
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

