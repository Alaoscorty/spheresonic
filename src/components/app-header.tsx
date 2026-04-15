'use client';

import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Menu, LayoutDashboard, LogOut, Globe } from 'lucide-react';
import { useUser, useUserProfile, useAuth } from '@/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from './theme-toggle';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from './ui/skeleton';

export function AppHeader() {
    const { user, isUserLoading } = useUser();
    const { userProfile, isUserProfileLoading } = useUserProfile();
    const navigate = useNavigate();
    const auth = useAuth();
    const { t, i18n } = useTranslation();
    const { toggleSidebar } = useSidebar();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const handleLogout = async () => {
        if (!auth) return;
        await signOut(auth);
        navigate('/');
    };

    const isLoading = isUserLoading || (user && isUserProfileLoading);

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <div className="md:hidden">
              <Button size="icon" variant="ghost" onClick={toggleSidebar}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </div>
            
            <div className="flex-1" />

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
                 {isLoading ? (
                    <Skeleton className="h-10 w-10 rounded-full" />
                    ) : user && userProfile ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={user.photoURL || `https://avatar.vercel.sh/${user.uid}.png`} alt={userProfile?.username || 'User'} />
                                    <AvatarFallback>{userProfile?.email?.[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                {userProfile?.plan && (
                                <Badge variant={userProfile.plan.toLowerCase() === 'vip' ? 'default' : 'secondary'} className="absolute bottom-0 -right-2.5 text-[10px] px-1 py-0 h-4 leading-none border-2 border-background">
                                    {userProfile.plan.toUpperCase()}
                                </Badge>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className='w-56'>
                            <DropdownMenuLabel>
                                <div className='flex flex-col space-y-1'>
                                    <p className='text-sm font-medium leading-none'>{userProfile?.username || user.email}</p>
                                    <p className='text-xs leading-none text-muted-foreground'>{userProfile?.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => navigate('/dashboard')}>
                                <LayoutDashboard className='mr-2' />
                                <span>{t('Dashboard')}</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={handleLogout}>
                                <LogOut className='mr-2' />
                                <span>{t('LogOut')}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    ) : null
                 }
            </div>
        </header>
    );
}

