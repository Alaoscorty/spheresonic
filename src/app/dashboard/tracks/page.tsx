'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, deleteDoc, updateDoc, increment } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import React, { useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';

type Track = {
  id: string;
  title: string;
  price: number;
  status: 'available' | 'sold' | 'draft';
  isExclusive: boolean;
}

export default function TracksPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userTracksQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'tracks'), where('ownerId', '==', user.uid));
  }, [user, firestore]);
  
  const userDraftsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'draft_tracks');
  }, [user, firestore]);

  const { data: tracks, isLoading: tracksLoading } = useCollection<Track>(userTracksQuery);
  const { data: draftTracks, isLoading: draftsLoading } = useCollection<Track>(userDraftsQuery);

  const allTracks = useMemo(() => {
    const combined = [...(tracks || []), ...(draftTracks || [])];
    const uniqueTracks = Array.from(new Map(combined.map(item => [item.id, item])).values());
    return uniqueTracks.sort((a, b) => a.title.localeCompare(b.title));
  }, [tracks, draftTracks]);

  const isLoading = tracksLoading || draftsLoading;

  const handleDeleteTrack = async (track: Track) => {
    if (!firestore || !user) return;
    
    const isPublished = track.status !== 'draft';
    const collectionName = isPublished ? 'tracks' : `users/${user.uid}/draft_tracks`;
    const trackRef = doc(firestore, collectionName, track.id);
    const creatorRef = doc(firestore, 'creators', user.uid);
    
    try {
      await deleteDoc(trackRef);
      if (isPublished) {
        await updateDoc(creatorRef, { tracksCount: increment(-1) });
      }
      toast({
        title: 'Success',
        description: 'Track deleted successfully.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error deleting track',
        description: error.message,
      });
    }
  };


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Tracks</h1>
        <Button asChild>
          <Link to="/dashboard/tracks/upload">
            <Plus className="mr-2" /> Upload New Track
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Tracks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-6 w-36" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))}
              {!isLoading && allTracks.map((track) => (
                <TableRow key={track.id}>
                  <TableCell className="font-medium">{track.title}</TableCell>
                  <TableCell>${track.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={
                      track.status === 'sold' ? 'destructive' :
                      track.status === 'draft' ? 'outline' : 'secondary'
                    }>
                      {track.status.charAt(0).toUpperCase() + track.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={track.isExclusive ? 'outline' : 'default'}>
                      {track.isExclusive ? 'Exclusive' : 'Non-Exclusive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onSelect={() => handleDeleteTrack(track)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

