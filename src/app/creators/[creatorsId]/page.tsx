'use client';

import { useParams } from 'react-router-dom';
import { useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { type UserProfile as CreatorProfile, type Track } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { TrackCard } from '@/components/track-card';
import { Mic, Music } from 'lucide-react';

export default function CreatorProfilePage() {
  const params = useParams();
  const creatorId = params.creatorId as string;
  const firestore = useFirestore();

  // Fetch creator profile
  const creatorRef = useMemoFirebase(
    () => (firestore && creatorId ? doc(firestore, 'creators', creatorId) : null),
    [firestore, creatorId]
  );
  const { data: creator, isLoading: creatorLoading } =
    useDoc<CreatorProfile>(creatorRef);

  // Fetch creator's tracks
  const tracksQuery = useMemoFirebase(
    () =>
      firestore && creatorId
        ? query(
            collection(firestore, 'tracks'),
            where('ownerId', '==', creatorId),
            where('status', '==', 'available')
          )
        : null,
    [firestore, creatorId]
  );
  const { data: tracks, isLoading: tracksLoading } =
    useCollection<Track>(tracksQuery);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Creator Profile Header */}
      <header className="flex flex-col items-center text-center py-12">
        {creatorLoading ? (
            <>
                <Skeleton className="h-32 w-32 rounded-full mb-4" />
                <Skeleton className="h-10 w-64 mb-2" />
                <Skeleton className="h-6 w-48" />
            </>
        ) : creator ? (
            <>
                <img
                    src={`https://avatar.vercel.sh/${creator.id}.png`}
                    alt={creator.username}
                    width={128}
                    height={128}
                    className="rounded-full mb-4 border-4 border-primary/50"
                    data-ai-hint="person portrait"
                />
                <h1 className="text-4xl font-bold tracking-tight">{creator.username}</h1>
                <p className="text-lg text-muted-foreground mt-1 flex items-center gap-4">
                   <span>{creator.role}</span>
                   <span className="flex items-center gap-1"><Music className="h-4 w-4"/> {creator.tracksCount || 0} tracks</span>
                </p>
            </>
        ) : (
            <p>Creator not found.</p>
        )}
      </header>

      {/* Creator's Tracks */}
      <main>
        <h2 className="text-3xl font-bold tracking-tight mb-8">Tracks by {creator?.username || 'this creator'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tracksLoading ? (
                 Array.from({ length: creator?.tracksCount || 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="aspect-square w-full" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))
            ) : tracks && tracks.length > 0 ? (
                tracks.map((track) => <TrackCard key={track.id} track={track} />)
            ) : (
                <p className="col-span-full text-muted-foreground">This creator hasn't published any tracks yet.</p>
            )}
        </div>
      </main>
    </div>
  );
}
