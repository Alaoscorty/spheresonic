'use client';

import React, { useEffect, useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Music,
  DollarSign,
  Users,
  Settings,
  LogOut,
  CreditCard,
  ListMusic,
  Shield,
  Wallet,
  Rocket,
  Loader2,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser, useUserProfile, useAuth, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { Skeleton } from './ui/skeleton';
import { signOut } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { doc, updateDoc, deleteField, collection, Timestamp, serverTimestamp, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

declare const FedaPay: any;


export function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isUpgrading, setIsUpgrading] = useState(false);


  const { userProfile, isUserProfileLoading } = useUserProfile();
  
  useEffect(() => {
    if (user && userProfile && userProfile.plan === 'VIP' && userProfile.vipEndDate) {
      const expirationDate = (userProfile.vipEndDate as any).toDate();
      if (expirationDate < new Date()) {
        const userRef = doc(firestore, 'users', user.uid);
        updateDoc(userRef, {
          plan: 'Free',
          commissionRate: 0.10,
          vipStartDate: deleteField(),
          vipEndDate: deleteField()
        }).catch(err => {
          console.error("Failed to update user plan after expiration:", err);
        });
      }
    }
  }, [user, userProfile, firestore]);

  const transactionsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'sales')
  }, [user, firestore]);
  
  const { data: transactions, isLoading: isTransactionsLoading } = useCollection<{sellerEarnings: number}>(transactionsQuery);

  const totalEarnings = transactions?.reduce((acc, t) => acc + t.sellerEarnings, 0) || 0;

  const isActive = (path: string) => {
    if (path === '/dashboard' || path === '/admin') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };
  
  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleUpgrade = async () => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Non connecté',
        description: 'Veuillez vous connecter pour mettre à niveau.',
      });
      return;
    }

    if (typeof FedaPay === 'undefined') {
      toast({
        variant: 'destructive',
        title: 'Erreur de paiement',
        description: "La passerelle de paiement n'est pas disponible. Veuillez réessayer plus tard.",
      });
      return;
    }

    setIsUpgrading(true);

    const VIP_PRICE_XOF = 29500; // Approx. $49 USD for 2 years

    try {
      FedaPay.init({
        public_key: 'pk_live_i9VnRnxaLnJ9mwBRODBwBvKx',
        transaction: {
          amount: VIP_PRICE_XOF,
          description: 'Mise à niveau du plan VIP SonicSphere (2 ans)',
          currency: 'XOF',
        },
        customer: {
          email: user.email,
          lastname: userProfile?.username || user.email?.split('@')[0],
          firstname: '',
        },
        onComplete: async ({ reason, transaction }: { reason: string; transaction: any }) => {
          setIsUpgrading(false);

          if (reason === 'CHECKOUT_COMPLETED' && transaction.status === 'approved') {
            try {
              // 1. Update user profile to VIP
              const userRef = doc(firestore, 'users', user.uid);
              const now = new Date();
              const twoYearsFromNow = new Date();
              twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);

              await updateDoc(userRef, {
                plan: 'VIP',
                commissionRate: 0,
                vipStartDate: Timestamp.fromDate(now),
                vipEndDate: Timestamp.fromDate(twoYearsFromNow),
                updatedAt: serverTimestamp(),
              });

              // 2. Create transaction record for auditing
              const transactionData = {
                buyerId: user.uid,
                sellerId: 'sonicsphere-platform', // Platform is the "seller" of the subscription
                trackId: `VIP_UPGRADE_${user.uid}`,
                amountPaid: VIP_PRICE_XOF,
                commissionRateAtPurchase: 0,
                commissionAmount: 0,
                sellerEarnings: 0,
                paymentMethod: 'FedaPay',
                purchaseType: 'Subscription',
                transactionDate: serverTimestamp(),
                status: 'completed',
                paymentGatewayTransactionId: transaction.id,
              };

              await addDoc(collection(firestore, 'transactions'), transactionData);

              toast({
                title: 'Mise à niveau réussie !',
                description: 'Bienvenue dans le plan VIP ! Profitez de 0% de commission.',
              });

            } catch (error: any) {
                console.error("Erreur post-paiement:", error);
                toast({
                    variant: 'destructive',
                    title: 'Erreur post-paiement',
                    description: `Votre paiement a réussi, mais nous n'avons pas pu mettre à jour votre compte. Veuillez contacter le support. Erreur: ${error.message}`
                });
            }
          } else {
            toast({
              variant: 'destructive',
              title: 'Paiement échoué',
              description: `Le paiement n'a pas pu être finalisé. Raison: ${transaction.status || reason}. Veuillez réessayer.`,
            });
          }
        },
      });
    } catch (e: any) {
        console.error("Erreur d'initialisation FedaPay: ", e);
        toast({
            variant: 'destructive',
            title: 'Erreur de paiement',
            description: "Impossible d'initialiser la passerelle de paiement."
        });
        setIsUpgrading(false);
    }
  };


  const isLoading = isUserLoading || (user && (isUserProfileLoading || isTransactionsLoading));

  if (isLoading) {
    return (
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="flex-grow">
            <SidebarMenu>
                <SidebarMenuSkeleton showIcon />
                <SidebarMenuSkeleton showIcon />
                <SidebarMenuSkeleton showIcon />
            </SidebarMenu>
        </SidebarContent>
         <SidebarFooter>
           <SidebarMenu>
              <SidebarMenuItem>
                 <div className="flex w-full items-center gap-2 rounded-md p-2 text-left text-sm">
                    <Wallet/>
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                 </div>
              </SidebarMenuItem>
              <SidebarMenuSkeleton showIcon/>
              <SidebarMenuSkeleton showIcon/>
           </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    );
  }

  const isCreator = userProfile?.role === 'Artist' || userProfile?.role === 'Beatmaker';
  const isAdmin = userProfile?.role === 'Admin';
  const isVip = userProfile?.plan === 'VIP';


  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`https://avatar.vercel.sh/${user?.uid}.png`} alt={userProfile?.username} />
            <AvatarFallback>{userProfile?.email?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold">{userProfile?.username || 'User'}</span>
            <span className="text-xs text-muted-foreground">{userProfile?.plan} Plan</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-grow">
        {(isCreator || isAdmin) && (
          <SidebarGroup>
            <SidebarGroupLabel>{isAdmin ? t('MyCreatorDashboard') : (t(userProfile?.role as any) || t('Creator'))}</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/dashboard')} isActive={isActive('/dashboard')} tooltip={t('Dashboard')}>
                  <LayoutDashboard />
                  <span>{t('Dashboard')}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/dashboard/tracks')} isActive={isActive('/dashboard/tracks')} tooltip={t('Tracks')}>
                  <Music />
                  <span>{t('Tracks')}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/dashboard/sales')} isActive={isActive('/dashboard/sales')} tooltip={t('Sales')}>
                  <DollarSign />
                  <span>{t('Sales')}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}

        {isAdmin && (
           <SidebarGroup>
            <SidebarGroupLabel>{t('Admin')}</SidebarGroupLabel>
            <SidebarMenu>
                <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/admin')} isActive={isActive('/admin')} tooltip={t('Overview')}>
                  <Shield />
                  <span>{t('Overview')}</span>
                </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/admin/users')} isActive={isActive('/admin/users')} tooltip={t('Users')}>
                  <Users />
                  <span>{t('Users')}</span>
                </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/admin/tracks')} isActive={isActive('/admin/tracks')} tooltip={t('Tracks')}>
                  <ListMusic />
                  <span>{t('Tracks')}</span>
                </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/admin/transactions')} isActive={isActive('/admin/transactions')} tooltip={t('Transactions')}>
                  <CreditCard />
                  <span>{t('Transactions')}</span>
                </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
            </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        {!isAdmin && !isVip && (
          <div className="p-2 group">
            <Button
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="w-full h-auto py-3 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 text-white animate-pulse hover:animate-none hover:opacity-90 transition-all"
            >
              {isUpgrading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Rocket className="mr-2 group-hover:animate-bounce" />
              )}
              <span>Upgrader vers VIP</span>
            </Button>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
                <div className="flex w-full items-center gap-2 rounded-md p-2 text-left text-sm">
                    <Wallet />
                    <div className='flex flex-col'>
                        <span>{t('Balance')}</span>
                        <span className="font-bold text-base">${totalEarnings.toFixed(2)}</span>
                    </div>
                </div>
            </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => navigate('/dashboard/settings')} tooltip={t('Settings')} isActive={isActive('/dashboard/settings')}>
              <Settings />
              <span>{t('Settings')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={t('LogOut')} onClick={handleLogout}>
                <LogOut />
                <span>{t('LogOut')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

