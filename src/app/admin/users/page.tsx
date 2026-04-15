'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, ShieldOff, Trash2, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc, query, limit, startAfter, endBefore, limitToLast, setDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import type { DocumentData } from 'firebase/firestore';

type UserProfile = {
    id: string;
    username: string;
    email: string;
    role: string;
    plan: string;
    isSuspended: boolean;
    featuredByAdmin: boolean;
}

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [lastVisible, setLastVisible] = useState<DocumentData | null>(null);
  const [firstVisible, setFirstVisible] = useState<DocumentData | null>(null);
  const [page, setPage] = useState(1);

  const usersCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), limit(PAGE_SIZE));
  }, [firestore]);
  
  const [currentQuery, setCurrentQuery] = useState(usersCollection);

  const { data: users, isLoading } = useCollection<UserProfile>(currentQuery, (snapshot) => {
    if (!snapshot.empty) {
      setFirstVisible(snapshot.docs[0]);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
    } else {
      setFirstVisible(null);
      setLastVisible(null);
    }
  });

  const handleToggleSuspend = async (user: UserProfile) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', user.id);
    try {
      await updateDoc(userRef, { isSuspended: !user.isSuspended });
      toast({
        title: 'Success',
        description: `User ${user.isSuspended ? 'unsuspended' : 'suspended'}.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error updating user',
        description: error.message,
      });
    }
  };

  const handleToggleFeature = async (user: UserProfile) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', user.id);
    const newFeaturedStatus = !user.featuredByAdmin;

    try {
      await updateDoc(userRef, { featuredByAdmin: newFeaturedStatus });
      
      if (user.role === 'Artist' || user.role === 'Beatmaker') {
        const creatorRef = doc(firestore, 'creators', user.id);
        // Use setDoc with merge to avoid error if creator doc doesn't exist for some reason
        await setDoc(creatorRef, { featuredByAdmin: newFeaturedStatus }, { merge: true });
      }
      toast({
        title: 'Success',
        description: `User ${newFeaturedStatus ? 'featured' : 'unfeatured'}.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error updating user feature status',
        description: error.message,
      });
    }
};

  const handleDeleteUser = async (userId: string) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', userId);
    try {
      await deleteDoc(userRef);
      toast({
        title: 'Success',
        description: 'User document deleted. Note: Auth record is not deleted.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error deleting user',
        description: error.message,
      });
    }
  };
  
  const fetchNextPage = () => {
    if (!lastVisible || !firestore) return;
    const nextQuery = query(collection(firestore, 'users'), startAfter(lastVisible), limit(PAGE_SIZE));
    setCurrentQuery(nextQuery);
    setPage(p => p + 1);
  };

  const fetchPrevPage = () => {
    if (!firstVisible || !firestore) return;
    const prevQuery = query(collection(firestore, 'users'), endBefore(firstVisible), limitToLast(PAGE_SIZE));
    setCurrentQuery(prevQuery);
    setPage(p => p - 1);
  };


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">User Management</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))}
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={`https://avatar.vercel.sh/${user.id}.png`} alt={user.username} />
                            <AvatarFallback>{user.username?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div>{user.username}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Badge variant={user.plan?.toLowerCase() === 'vip' ? 'default' : 'secondary'}>
                      {user.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isSuspended ? 'destructive' : 'default'}>
                        {user.isSuspended ? 'Suspended' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.featuredByAdmin ? (
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
                        {(user.role === 'Artist' || user.role === 'Beatmaker') && (
                            <DropdownMenuItem onSelect={() => handleToggleFeature(user)}>
                                <Star className="mr-2 h-4 w-4" />
                                {user.featuredByAdmin ? 'Unfeature' : 'Feature'}
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onSelect={() => handleToggleSuspend(user)}>
                          <ShieldOff className="mr-2 h-4 w-4" />
                          {user.isSuspended ? 'Unsuspend' : 'Suspend'}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onSelect={() => handleDeleteUser(user.id)}>
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
              disabled={!lastVisible || (users && users.length < PAGE_SIZE)}
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
