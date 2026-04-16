'use client';

import { Button } from '@/components/ui/button';
import { TrackCard } from '@/components/track-card';
import { CreatorCard } from '@/components/creator-card';
import { ArrowRight, Music, Mic, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { type Track, type UserProfile as CreatorProfile } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';


export default function Home() {
  const firestore = useFirestore();
  const { t } = useTranslation();

  const featuredTracksQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'tracks'),
            where('isFeaturedByAdmin', '==', true),
            where('status', '==', 'available'),
            limit(8)
          )
        : null,
    [firestore]
  );
  const { data: featuredTracks, isLoading: tracksLoading } =
    useCollection<Track>(featuredTracksQuery);

  const creatorsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'creators'),
            limit(6)
          )
        : null,
    [firestore]
  );
  const { data: creators, isLoading: creatorsLoading } =
    useCollection<CreatorProfile>(creatorsQuery);


  return (
    <div>
      <section className="relative text-center overflow-hidden">
        <div className="absolute inset-0 z-0 h-[75vh] min-h-[600px] w-full">
            <img
                src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop"
                alt="Concert background"
                className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-background/60" />
        </div>
        <div className="relative z-10 container mx-auto px-4 flex flex-col items-center justify-center h-[75vh] min-h-[600px]">
            <h1
              suppressHydrationWarning
              className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-[linear-gradient(to_right,theme(colors.blue.500),theme(colors.yellow.400),theme(colors.pink.500),theme(colors.green.500),theme(colors.red.500))]"
            >
              {t('HeroTitle')}
            </h1>
            <p suppressHydrationWarning className="mt-4 text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
              {t('HeroSubtitle')}
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg">
                <Link to="/#featured-tracks" suppressHydrationWarning>
                  {t('ExploreTracks')} <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/auth/signup" suppressHydrationWarning>{t('StartSelling')}</Link>
              </Button>
            </div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        <section id="featured-tracks" className="py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 suppressHydrationWarning className="text-3xl font-bold tracking-tight flex items-center">
              <Music className="mr-3 text-primary" /> {t('FeaturedTracks')}
            </h2>
            <Button variant="link" asChild>
              <Link to="/tracks" suppressHydrationWarning>
                {t('ViewAll')} <ArrowRight className="ml-1" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tracksLoading &&
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            {featuredTracks?.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        </section>

        <section id="creators" className="py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 suppressHydrationWarning className="text-3xl font-bold tracking-tight flex items-center">
              <Mic className="mr-3 text-primary" /> {t('FeaturedCreators')}
            </h2>
            <Button variant="link" asChild>
              <Link to="/creators" suppressHydrationWarning>
                {t('ViewAll')} <ArrowRight className="ml-1" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {creatorsLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2 flex flex-col items-center">
                  <Skeleton className="h-24 w-24 rounded-full" />
                  <Skeleton className="h-5 w-20 mt-2" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            {!creatorsLoading && creators?.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground">
                {t('NoArtistsFound') || 'Aucun artiste disponible pour le moment.'}
              </div>
            )}
            {creators?.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        </section>

        <section id="pricing" className="py-16">
          <div className="text-center">
            <h2 suppressHydrationWarning className="text-3xl font-bold tracking-tight">{t('PricingTitle')}</h2>
            <p suppressHydrationWarning className="mt-2 text-lg text-muted-foreground">{t('PricingSubtitle')}</p>
          </div>
          <div className="mt-12 grid max-w-lg mx-auto lg:max-w-none lg:grid-cols-2 gap-8">
            <Card className="flex flex-col">
              <CardHeader className='pb-4'>
                <CardTitle suppressHydrationWarning>{t('FreePlanTitle')}</CardTitle>
                <CardDescription className='pt-2'>
                  <span suppressHydrationWarning className="text-4xl font-bold tracking-tight text-foreground">{t('FreePlanPrice')}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                    <span suppressHydrationWarning>{t('FreePlanPerk1')}</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                    <span suppressHydrationWarning>{t('FreePlanPerk2')}</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                    <span suppressHydrationWarning>{t('FreePlanPerk3')}</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full" variant="secondary">
                  <Link to="/auth/signup" suppressHydrationWarning>{t('SelectPlan')}</Link>
                </Button>
              </CardFooter>
            </Card>
            <Card className="flex flex-col border-2 border-primary shadow-lg">
               <CardHeader className='pb-4'>
                <div className='flex justify-between items-center'>
                   <CardTitle suppressHydrationWarning>{t('VipPlanTitle')}</CardTitle>
                   <Badge>Popular</Badge>
                </div>
                <CardDescription className='pt-2'>
                  <span suppressHydrationWarning className="text-4xl font-bold tracking-tight text-foreground">{t('VipPlanPrice')}</span>
                </CardDescription>
              </CardHeader>
               <CardContent className="flex-1">
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                    <span suppressHydrationWarning>{t('VipPlanPerk1')}</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                    <span suppressHydrationWarning>{t('VipPlanPerk2')}</span>
                  </li>
                   <li className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                    <span suppressHydrationWarning>{t('VipPlanPerk3')}</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                    <span suppressHydrationWarning>{t('VipPlanPerk4')}</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to="/auth/signup" suppressHydrationWarning>{t('SelectPlan')}</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}

