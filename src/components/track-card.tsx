'use client';


import { Link } from 'react-router-dom';
import { Play, Pause, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { type Track } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { processPayoutAction } from '@/app/actions';

declare const FedaPay: any;

type TrackCardProps = {
  track: Track;
};

function CreatorName({ creatorId }: { creatorId: string }) {
  const firestore = useFirestore();
  const creatorRef = useMemoFirebase(
    () => (firestore && creatorId ? doc(firestore, 'users', creatorId) : null),
    [firestore, creatorId]
  );
  const { data: creator, isLoading } = useDoc<{ username: string }>(creatorRef);

  if (isLoading) {
    return <Skeleton className="h-4 w-24 inline-block" />;
  }

  return (
    <Link to={`/creators/${creatorId}`} className="hover:text-primary transition-colors">
      {creator?.username || 'Unknown Artist'}
    </Link>
  );
}

export function TrackCard({ track }: TrackCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePlayPause = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsPlaying(!isPlaying);
    // Add audio playback logic here
  };

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in or sign up to purchase a track.',
        action: (
          <Button onClick={() => navigate('/auth/login')}>Login</Button>
        ),
      });
      return;
    }

    if (user.uid === track.ownerId) {
      toast({
        variant: 'destructive',
        title: 'Action Not Allowed',
        description: "You can't purchase your own track.",
      });
      return;
    }

    if (typeof FedaPay === 'undefined') {
      toast({
        variant: 'destructive',
        title: 'Payment Error',
        description:
          'Payment gateway is not available. Please try again later.',
      });
      return;
    }

    setIsPurchasing(true);

    try {
      FedaPay.init({
        public_key: 'pk_live_i9VnRnxaLnJ9mwBRODBwBvKx',
        transaction: {
          amount: Math.round(track.price),
          description: `Purchase of track: ${track.title}`,
          currency: 'XOF',
        },
        customer: {
          email: user.email,
          lastname: user.displayName || '',
          firstname: user.displayName || '',
        },
        onComplete: async ({ reason, transaction }: { reason: string; transaction: any }) => {
          setIsPurchasing(false); // Stop loading indicator immediately

          if (reason === 'CHECKOUT_COMPLETED' && transaction.status === 'approved') {
            try {
              const sellerDocRef = doc(firestore, 'users', track.ownerId);
              const sellerDocSnap = await getDoc(sellerDocRef);
              const sellerProfile = sellerDocSnap.data();
              const commissionRate = sellerProfile?.commissionRate ?? 0.1;

              const commissionAmount = track.price * commissionRate;
              const sellerEarnings = track.price - commissionAmount;

              const transactionData = {
                buyerId: user.uid,
                sellerId: track.ownerId,
                trackId: track.id,
                amountPaid: track.price,
                commissionRateAtPurchase: commissionRate,
                commissionAmount,
                sellerEarnings,
                paymentMethod: 'FedaPay',
                purchaseType: track.isExclusive ? 'Exclusive' : 'Non-Exclusive',
                transactionDate: serverTimestamp(),
                status: 'completed',
                paymentGatewayTransactionId: transaction.id,
              };

              // 1. Create main transaction record
              const transactionRef = await addDoc(
                collection(firestore, 'transactions'),
                transactionData
              );

              // 2. Create denormalized record for the seller
              const sellerSalesRef = doc(
                firestore,
                'users',
                track.ownerId,
                'sales',
                transactionRef.id
              );
              await setDoc(sellerSalesRef, transactionData);

              // 3. Update track status if exclusive
              if (track.isExclusive) {
                const trackRef = doc(firestore, 'tracks', track.id);
                await updateDoc(trackRef, { status: 'sold' });
              }
              
              toast({
                title: 'Purchase Successful!',
                description: `You have successfully purchased "${track.title}".`,
              });

              // 4. Trigger backend payout processing (non-blocking)
              processPayoutAction(transactionRef.id);

            } catch (error: any) {
                console.error("Error processing purchase:", error);
                toast({
                    variant: 'destructive',
                    title: 'Post-Payment Error',
                    description: `Your payment was successful, but we failed to update our records. Please contact support. Error: ${error.message}`
                });
            }
          } else {
            toast({
              variant: 'destructive',
              title: 'Payment Failed',
              description: `The payment could not be completed. Reason: ${transaction.status || reason}. Please try again.`,
            });
          }
        },
      });
    } catch (e: any) {
        console.error("FedaPay Initialization Error: ", e);
        toast({
            variant: 'destructive',
            title: 'Payment Error',
            description: 'Could not initialize payment gateway.'
        });
        setIsPurchasing(false);
    }
  };

  return (
    <Card className="group overflow-hidden relative">
      <CardContent className="p-0">
        <div className="relative aspect-square">
          <img
            src={track.coverArt?.url || `https://picsum.photos/seed/${track.id}/400/400`}
            alt={track.title}
            width={400}
            height={400}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={track.coverArt?.hint || "music track"}
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
          <div className="absolute top-2 right-2">
            {track.status === 'sold' ? (
              <Badge variant="destructive">Sold</Badge>
            ) : track.isExclusive ? (
              <Badge variant="secondary">Exclusive</Badge>
            ) : null}
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              className="rounded-full w-14 h-14 bg-primary/80 hover:bg-primary"
              onClick={handlePlayPause}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg truncate">{track.title}</h3>
          <p className="text-sm text-muted-foreground">
            by <CreatorName creatorId={track.ownerId} />
          </p>
          <div className="flex justify-between items-center mt-4">
            <p className="font-bold text-lg text-primary">${track.price.toFixed(2)}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={handlePurchase}
              disabled={track.status === 'sold' || isPurchasing}
            >
              {isPurchasing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {track.status === 'sold' ? 'Sold' : 'Purchase'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

