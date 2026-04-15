'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

type Transaction = {
    id: string;
    trackId: string;
    sellerId: string;
    buyerId: string;
    transactionDate: { toDate: () => Date };
    purchaseType: 'Exclusive' | 'Non-Exclusive';
    commissionAmount: number;
    amountPaid: number;
}

export default function AdminTransactionsPage() {
  const firestore = useFirestore();
  const transactionsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'transactions')) : null, [firestore]);
  const { data: allTransactions, isLoading } = useCollection<Transaction>(transactionsQuery);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">All Transactions</h1>

      <Card>
        <CardHeader>
          <CardTitle>Platform-wide Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Track ID</TableHead>
                <TableHead>Seller ID</TableHead>
                <TableHead>Buyer ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({length: 5}).map((_, i) => (
                 <TableRow key={i}>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-6 w-20" /></TableCell>
                </TableRow>
              ))}
              {allTransactions?.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium truncate max-w-[200px]">{sale.trackId}</TableCell>
                  <TableCell className="truncate max-w-[200px]">{sale.sellerId}</TableCell>
                  <TableCell className="truncate max-w-[200px]">{sale.buyerId}</TableCell>
                  <TableCell>{sale.transactionDate ? format(sale.transactionDate.toDate(), 'PPP') : 'N/A'}</TableCell>
                   <TableCell>
                    <Badge variant={sale.purchaseType === 'Exclusive' ? 'outline' : 'default'}>
                      {sale.purchaseType || 'Non-Exclusive'}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-green-400'>+${sale.commissionAmount?.toFixed(2) || '0.00'}</TableCell>
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
