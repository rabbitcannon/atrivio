import { Ghost, MapPin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AttractionCardProps {
  attraction: {
    id: string;
    name: string;
    type: string;
    status: 'active' | 'inactive';
    zones: number;
    capacity: number;
  };
  orgId: string;
}

export function AttractionCard({ attraction, orgId }: AttractionCardProps) {
  return (
    <a href={`/${orgId}/attractions/${attraction.id}`}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ghost className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">{attraction.name}</CardTitle>
            </div>
            <Badge variant={attraction.status === 'active' ? 'default' : 'secondary'}>
              {attraction.status}
            </Badge>
          </div>
          <CardDescription className="capitalize">
            {attraction.type.replace('_', ' ')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {attraction.zones} zones
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {attraction.capacity} capacity
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
