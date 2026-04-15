'use client';

import { CreatorCard } from '@/components/creator-card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { type UserProfile as CreatorProfile } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { Mic } from 'lucide-react';

export default function AllCreatorsPage() {
  const firestore = useFirestore();

  const creatorsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'creators')) : null),
    [firestore]
  );
  const { data: creators, isLoading: creatorsLoading } =
    useCollection<CreatorProfile>(creatorsQuery);

  return (
    <div className="container mx-auto px-4 py-8">
        <section id="all-creators" className="py-12">
            <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold tracking-tight flex items-center">
                <Mic className="mr-3 text-primary" /> Discover All Creators
            </h1>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {creatorsLoading &&
                Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-2 flex flex-col items-center">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <Skeleton className="h-5 w-20 mt-2" />
                    <Skeleton className="h-4 w-16" />
                </div>
                ))}
            {creators?.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
            ))}
            </div>
             {/* Could add pagination here later if needed */}
        </section>
    </div>
  );
}
