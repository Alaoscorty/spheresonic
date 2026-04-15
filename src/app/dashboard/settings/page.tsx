'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, Smartphone } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const profileFormSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters.'),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const payoutFormSchema = z.object({
  bankName: z.string().optional(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  mobileMoneyProvider: z.string().optional(),
  mobileMoneyNumber: z.string().optional(),
});
type PayoutFormValues = z.infer<typeof payoutFormSchema>;

type UserProfile = {
  username: string;
  payoutInfo?: {
    bankAccount?: {
      bankName?: string;
      accountName?: string;
      accountNumber?: string;
    };
    mobileMoney?: {
      provider?: string;
      phoneNumber?: string;
    }
  }
}

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPayout, setIsSavingPayout] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    values: {
      username: userProfile?.username || '',
    },
    mode: 'onChange'
  });
  
  const payoutForm = useForm<PayoutFormValues>({
    resolver: zodResolver(payoutFormSchema),
    values: {
      bankName: userProfile?.payoutInfo?.bankAccount?.bankName || '',
      accountName: userProfile?.payoutInfo?.bankAccount?.accountName || '',
      accountNumber: userProfile?.payoutInfo?.bankAccount?.accountNumber || '',
      mobileMoneyProvider: userProfile?.payoutInfo?.mobileMoney?.provider || '',
      mobileMoneyNumber: userProfile?.payoutInfo?.mobileMoney?.phoneNumber || '',
    },
    mode: 'onChange'
  });

  async function onProfileSubmit(data: ProfileFormValues) {
    if (!userDocRef) return;
    setIsSavingProfile(true);
    
    try {
      await updateDoc(userDocRef, { username: data.username });
      toast({ title: 'Profil mis à jour avec succès !' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'La mise à jour a échoué',
        description: error.message,
      });
    } finally {
      setIsSavingProfile(false);
    }
  }
  
  async function onPayoutSubmit(data: PayoutFormValues) {
    if (!userDocRef) return;
    setIsSavingPayout(true);

    const payoutInfo = {
      bankAccount: {
        bankName: data.bankName || '',
        accountName: data.accountName || '',
        accountNumber: data.accountNumber || '',
      },
      mobileMoney: {
        provider: data.mobileMoneyProvider || '',
        phoneNumber: data.mobileMoneyNumber || '',
      }
    }

    try {
      await updateDoc(userDocRef, { payoutInfo });
      toast({ title: 'Informations de paiement enregistrées !' });
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Échec de l\'enregistrement',
        description: error.message,
      });
    } finally {
      setIsSavingPayout(false);
    }
  }

  const isLoading = isUserLoading || isProfileLoading;
  
  // This is needed to re-sync the form once the data is loaded from Firestore
  if (userProfile && payoutForm.getValues().mobileMoneyNumber !== userProfile?.payoutInfo?.mobileMoney?.phoneNumber) {
      payoutForm.reset({
        bankName: userProfile?.payoutInfo?.bankAccount?.bankName || '',
        accountName: userProfile?.payoutInfo?.bankAccount?.accountName || '',
        accountNumber: userProfile?.payoutInfo?.bankAccount?.accountNumber || '',
        mobileMoneyProvider: userProfile?.payoutInfo?.mobileMoney?.provider || '',
        mobileMoneyNumber: userProfile?.payoutInfo?.mobileMoney?.phoneNumber || '',
      })
  }


  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>Gérez votre profil public et les détails de votre compte.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="flex items-center gap-4">
            {isLoading ? <Skeleton className="h-24 w-24 rounded-full" /> : 
              <img
                src={`https://avatar.vercel.sh/${user?.uid}.png`}
                alt={userProfile?.username || 'User avatar'}
                width={96}
                height={96}
                className="rounded-full"
              />
            }
            <div>
              <Label htmlFor="avatar-upload">Changer d'avatar</Label>
              <Input id="avatar-upload" type="file" className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF jusqu'à 5MB.</p>
            </div>
          </div>
          
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <FormField
                control={profileForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom d'utilisateur</FormLabel>
                    <FormControl>
                      {isLoading ? <Skeleton className="h-10 w-1/2"/> : <Input placeholder="Votre nom d'affichage" {...field} />}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSavingProfile || !profileForm.formState.isDirty}>
                {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sauvegarder les changements
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Méthodes de Paiement</CardTitle>
          <CardDescription>Gérez vos comptes pour recevoir vos gains.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...payoutForm}>
              <form onSubmit={payoutForm.handleSubmit(onPayoutSubmit)} className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center"><CreditCard className="mr-2 h-5 w-5" /> Compte Bancaire</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                              control={payoutForm.control}
                              name="bankName"
                              render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>Nom de la banque</FormLabel>
                                      <FormControl>
                                          {isLoading ? <Skeleton className="h-10 w-full" /> : <Input placeholder="Ex: Ecobank" {...field} />}
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <FormField
                              control={payoutForm.control}
                              name="accountName"
                              render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>Nom du titulaire</FormLabel>
                                      <FormControl>
                                          {isLoading ? <Skeleton className="h-10 w-full" /> : <Input placeholder="Ex: John Doe" {...field} />}
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
                           <FormField
                              control={payoutForm.control}
                              name="accountNumber"
                              render={({ field }) => (
                                  <FormItem className="sm:col-span-2">
                                      <FormLabel>Numéro de compte (RIB)</FormLabel>
                                      <FormControl>
                                          {isLoading ? <Skeleton className="h-10 w-full" /> : <Input placeholder="Votre numéro de compte" {...field} />}
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
                      </div>
                  </div>
                   <div className="space-y-4">
                    <h3 className="font-medium flex items-center"><Smartphone className="mr-2 h-5 w-5" /> Mobile Money</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <FormField
                            control={payoutForm.control}
                            name="mobileMoneyProvider"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Opérateur</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                     {isLoading ? <Skeleton className="h-10 w-full" /> :
                                    <SelectTrigger>
                                      <SelectValue placeholder="Choisir un opérateur" />
                                    </SelectTrigger>}
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="MTN">MTN</SelectItem>
                                    <SelectItem value="Moov">Moov</SelectItem>
                                    <SelectItem value="Orange Money">Orange Money</SelectItem>
                                    <SelectItem value="Wave">Wave</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                        />
                         <FormField
                              control={payoutForm.control}
                              name="mobileMoneyNumber"
                              render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>Numéro de téléphone</FormLabel>
                                      <FormControl>
                                          {isLoading ? <Skeleton className="h-10 w-full" /> : <Input type="tel" placeholder="+229 12 34 56 78" {...field} />}
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
                      </div>
                  </div>

                  <Button type="submit" disabled={isSavingPayout || !payoutForm.formState.isDirty}>
                    {isSavingPayout && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sauvegarder les informations de paiement
                </Button>
              </form>
           </Form>
        </CardContent>
      </Card>
    </div>
  );
}

