'use client';

import { TrackCard } from '@/components/track-card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { type Track } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { Music } from 'lucide-react';

export default function AllTracksPage() {
  const firestore = useFirestore();

  const tracksQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'tracks'),
            where('status', '==', 'available')
          )
        : null,
    [firestore]
  );
  const { data: tracks, isLoading: tracksLoading } =
    useCollection<Track>(tracksQuery);

  return (
    <div className="container mx-auto px-4 py-8">
       <section id="all-tracks" className="py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold tracking-tight flex items-center">
            <Music className="mr-3 text-primary" /> Explore All Tracks
          </h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tracksLoading &&
            Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          {tracks?.map((track) => (
            <TrackCard key={track.id} track={track} />
          ))}
        </div>
         {/* Could add pagination here later if needed */}
      </section>
    </div>
  );
}
