'use client';


import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Plus, Star, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, doc, updateDoc, deleteDoc, increment, limit, startAfter, endBefore, limitToLast } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import type { DocumentData } from 'firebase/firestore';

type Track = {
  id: string;
  title: string;
  ownerId: string;
  price: number;
  status: 'available' | 'sold' | 'draft';
  isFeaturedByAdmin: boolean;
};

const PAGE_SIZE = 10;

export default function AdminTracksPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [lastVisible, setLastVisible] = useState<DocumentData | null>(null);
  const [firstVisible, setFirstVisible] = useState<DocumentData | null>(null);
  const [page, setPage] = useState(1);

  const tracksQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'tracks'), limit(PAGE_SIZE));
  }, [firestore]);
  
  const [currentQuery, setCurrentQuery] = useState(tracksQuery);

  const { data: tracks, isLoading } = useCollection<Track>(currentQuery, (snapshot) => {
    if (!snapshot.empty) {
        setFirstVisible(snapshot.docs[0]);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
    } else {
        setFirstVisible(null);
        setLastVisible(null);
    }
  });

  const handleToggleFeature = async (track: Track) => {
    if (!firestore) return;
    const trackRef = doc(firestore, 'tracks', track.id);
    try {
      await updateDoc(trackRef, { isFeaturedByAdmin: !track.isFeaturedByAdmin });
      toast({
        title: 'Success',
        description: `Track ${track.isFeaturedByAdmin ? 'unfeatured' : 'featured'}.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error updating track',
        description: error.message,
      });
    }
  };

  const handleDeleteTrack = async (track: Track) => {
    if (!firestore) return;
    const trackRef = doc(firestore, 'tracks', track.id);
    const creatorRef = doc(firestore, 'creators', track.ownerId);

    try {
      await deleteDoc(trackRef);
      await updateDoc(creatorRef, { tracksCount: increment(-1) });
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
  
  const fetchNextPage = () => {
    if (!lastVisible || !firestore) return;
    const nextQuery = query(collection(firestore, 'tracks'), startAfter(lastVisible), limit(PAGE_SIZE));
    setCurrentQuery(nextQuery);
    setPage(p => p + 1);
  };

  const fetchPrevPage = () => {
    if (!firstVisible || !firestore) return;
    const prevQuery = query(collection(firestore, 'tracks'), endBefore(firstVisible), limitToLast(PAGE_SIZE));
    setCurrentQuery(prevQuery);
    setPage(p => p - 1);
  };


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Track Management</h1>
        <Button asChild>
          <Link to="/dashboard/tracks/upload">
            <Plus className="mr-2" /> Upload New Track
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Platform Tracks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Track</TableHead>
                <TableHead>Creator ID</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                    <TableCell>
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-md" />
                            <Skeleton className="h-6 w-32" />
                        </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))}
              {tracks?.map((track) => (
                <TableRow key={track.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://picsum.photos/seed/${track.id}/40/40`}
                        alt={track.title}
                        width={40}
                        height={40}
                        className="rounded-md object-cover"
                        data-ai-hint="abstract music"
                      />
                      <span className="truncate">{track.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="truncate max-w-[150px]">{track.ownerId}</TableCell>
                  <TableCell>${track.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={track.status === 'sold' ? 'destructive' : 'secondary'}>
                      {track.status === 'sold' ? 'Sold' : 'Available'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {track.isFeaturedByAdmin ? (
                       <Badge variant="default">
                         <Star className="mr-1 h-3 w-3" />
                         Featured
                       </Badge>
                    ) : (
                        <Badge variant="outline">Standard</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => handleToggleFeature(track)}>
                          <Star className="mr-2 h-4 w-4" />
                          {track.isFeaturedByAdmin ? 'Unfeature' : 'Feature'}
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
           <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPrevPage}
              disabled={page <= 1}
            >
               <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchNextPage}
              disabled={!lastVisible || (tracks && tracks.length < PAGE_SIZE)}
            >
              Next
               <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

