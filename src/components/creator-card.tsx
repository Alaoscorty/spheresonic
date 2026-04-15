
import { Link } from 'react-router-dom';
import { type UserProfile } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';

type CreatorCardProps = {
  creator: UserProfile;
};

export function CreatorCard({ creator }: CreatorCardProps) {
  return (
    <Link to={`/creators/${creator.id}`}>
      <Card className="group text-center transition-all hover:bg-card/60 hover:scale-105">
        <CardContent className="p-4">
          <div className="relative aspect-square w-24 h-24 mx-auto mb-4">
            <img
              src={`https://avatar.vercel.sh/${creator.id}.png`}
              alt={creator.username}
              width={200}
              height={200}
              className="rounded-full object-cover border-2 border-primary/50 group-hover:border-primary transition-colors"
              data-ai-hint="person portrait"
            />
          </div>
          <h3 className="font-semibold truncate">{creator.username}</h3>
           <p className="text-sm text-muted-foreground">{creator.tracksCount || 0} tracks</p>
        </CardContent>
      </Card>
    </Link>
  );
}

