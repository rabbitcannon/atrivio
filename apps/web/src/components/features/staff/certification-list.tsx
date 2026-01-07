import { Badge } from '@/components/ui/badge';

interface Certification {
  name: string;
  expiresAt: string;
}

interface CertificationListProps {
  certifications: Certification[];
}

export function CertificationList({ certifications }: CertificationListProps) {
  if (certifications.length === 0) {
    return <p className="text-sm text-muted-foreground">No certifications recorded.</p>;
  }

  return (
    <div className="space-y-2">
      {certifications.map((cert) => {
        const isExpired = new Date(cert.expiresAt) < new Date();
        const isExpiringSoon =
          !isExpired && new Date(cert.expiresAt) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        return (
          <div key={cert.name} className="flex items-center justify-between">
            <span className="text-sm">{cert.name}</span>
            <Badge
              variant={isExpired ? 'destructive' : isExpiringSoon ? 'secondary' : 'outline'}
              className="text-xs"
            >
              {isExpired
                ? 'Expired'
                : isExpiringSoon
                  ? 'Expiring Soon'
                  : new Date(cert.expiresAt).toLocaleDateString()}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}
