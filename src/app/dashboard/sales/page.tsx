'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

type Transaction = {
    id: string;
    trackId: string;
    transactionDate: { toDate: () => Date };
    buyerId: string;
    purchaseType: 'Exclusive' | 'Non-Exclusive';
    commissionAmount: number;
    sellerEarnings: number;
    amountPaid: number;
}

export default function SalesPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  const transactionsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'sales'));
  }, [user, firestore]);
  
  const { data: sales, isLoading } = useCollection<Transaction>(transactionsQuery);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Sales History</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Track ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Buyer ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Your Earnings</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-6 w-20" /></TableCell>
                </TableRow>
              ))}
              {sales?.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium truncate max-w-xs">{sale.trackId}</TableCell>
                  <TableCell>{sale.transactionDate ? format(sale.transactionDate.toDate(), 'PPP') : 'N/A'}</TableCell>
                  <TableCell className="truncate max-w-xs">{sale.buyerId}</TableCell>
                  <TableCell>
                    <Badge variant={sale.purchaseType === 'Exclusive' ? 'outline' : 'default'}>
                      {sale.purchaseType}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-destructive'>-${sale.commissionAmount?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell className='text-green-400'>+${sale.sellerEarnings?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell className="text-right font-medium">${sale.amountPaid.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
