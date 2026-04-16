
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, Music } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';

export default function AdminPage() {
  const firestore = useFirestore();
  
  const usersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'users')) : null, [firestore]);
  const transactionsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'transactions')) : null, [firestore]);
  const tracksQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'tracks')) : null, [firestore]);

  const { data: users, isLoading: usersLoading } = useCollection(usersQuery);
  const { data: transactions, isLoading: transactionsLoading } = useCollection(transactionsQuery);
  const { data: tracks, isLoading: tracksLoading } = useCollection(tracksQuery);
  
  const totalUsers = users?.length || 0;
  const totalTransactions = transactions?.length || 0;
  const totalTracks = tracks?.length || 0;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersLoading ? '...' : totalUsers}</div>
            <p className="text-xs text-muted-foreground">All registered users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactionsLoading ? '...' : totalTransactions}</div>
             <p className="text-xs text-muted-foreground">All sales on the platform</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tracks</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tracksLoading ? '...' : totalTracks}</div>
            <p className="text-xs text-muted-foreground">All tracks uploaded</p>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Site-wide Activity</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Activity charts and logs will be displayed here.</p>
        </CardContent>
       </Card>
    </div>
  );
}
