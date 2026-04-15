'use client';

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Music, Globe, Menu } from 'lucide-react';
import { useUser } from '@/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from './ui/skeleton';
import { useTranslation } from 'react-i18next';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

export function Header() {
  const { user, isUserLoading } = useUser();
  const { t, i18n } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  
  const closeMobileMenu = () => setIsMobileMenuOpen(false);


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sm:max-w-xs flex flex-col">
                  <SheetHeader>
                    <SheetTitle>
                      <Link to="/" className="inline-flex items-center space-x-2" onClick={closeMobileMenu}>
                          <Music className="h-6 w-6 text-primary" />
                          <span className="font-bold">SonicSphere</span>
                      </Link>
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="mt-8 flex flex-1 flex-col gap-2">
                      <Link to="/#featured-tracks" className="text-muted-foreground p-2 -mx-2 rounded-md hover:bg-accent" onClick={closeMobileMenu} suppressHydrationWarning>{t('Tracks')}</Link>
                      <Link to="/#creators" className="text-muted-foreground p-2 -mx-2 rounded-md hover:bg-accent" onClick={closeMobileMenu} suppressHydrationWarning>{t('Creators')}</Link>
                  </nav>
                   <div className="mt-auto flex flex-col gap-2">
                      {!isUserLoading && !user && (
                          <>
                          <Button variant="secondary" asChild onClick={closeMobileMenu}>
                              <Link to="/auth/login" suppressHydrationWarning>{t('LogIn')}</Link>
                          </Button>
                          <Button asChild onClick={closeMobileMenu}>
                              <Link to="/auth/signup" suppressHydrationWarning>{t('SignUp')}</Link>
                          </Button>
                          </>
                      )}
                      {!isUserLoading && user && (
                          <Button asChild onClick={closeMobileMenu}>
                              <Link to="/dashboard" suppressHydrationWarning>{t('Dashboard')}</Link>
                          </Button>
                      )}
                  </div>
                </SheetContent>
              </Sheet>
          </div>

          <Link to="/" className="flex items-center space-x-2">
              <Music className="h-6 w-6 text-primary" />
              <span className="hidden font-bold sm:inline-block">SonicSphere</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link
            to="/#featured-tracks"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
            suppressHydrationWarning
            >
            {t('Tracks')}
            </Link>
            <Link
            to="/#creators"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
            suppressHydrationWarning
            >
            {t('Creators')}
            </Link>
        </nav>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                  <Globe className="h-[1.2rem] w-[1.2rem]" />
              </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => changeLanguage('en')}>{t('English')}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('fr')}>{t('French')}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('es')}>{t('Spanish')}</DropdownMenuItem>
              </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />

          {isUserLoading && (
              <div className='flex items-center gap-2'>
                  <Skeleton className="h-8 w-24" />
              </div>
          )}

          <div className="hidden md:flex items-center gap-2">
            {!isUserLoading && !user && (
                <>
                <Button variant="ghost" asChild>
                    <Link to="/auth/login" suppressHydrationWarning>{t('LogIn')}</Link>
                </Button>
                <Button asChild>
                    <Link to="/auth/signup" suppressHydrationWarning>{t('SignUp')}</Link>
                </Button>
                </>
            )}

            {!isUserLoading && user && (
                <Button asChild>
                    <Link to="/dashboard" suppressHydrationWarning>{t('Dashboard')}</Link>
                </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

