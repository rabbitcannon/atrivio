import type { Metadata } from 'next';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const metadata: Metadata = {
  title: 'Certifications',
};

interface CertificationsPageProps {
  params: Promise<{ orgId: string; staffId: string }>;
}

export default async function CertificationsPage({ params }: CertificationsPageProps) {
  const { orgId, staffId } = await params;

  // TODO: Fetch actual certifications
  const certifications = [
    { id: '1', name: 'First Aid', issuedAt: '2024-06-01', expiresAt: '2025-06-01' },
    { id: '2', name: 'CPR', issuedAt: '2024-03-15', expiresAt: '2025-03-15' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <a href={`/${orgId}/staff/${staffId}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to staff profile</span>
          </a>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Certifications</h1>
          <p className="text-muted-foreground">Manage certifications for this staff member.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Current Certifications</h2>
          {certifications.map((cert) => {
            const isExpired = new Date(cert.expiresAt) < new Date();
            const isExpiringSoon =
              !isExpired &&
              new Date(cert.expiresAt) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            return (
              <Card key={cert.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{cert.name}</CardTitle>
                    <Badge
                      variant={isExpired ? 'destructive' : isExpiringSoon ? 'secondary' : 'default'}
                    >
                      {isExpired ? 'Expired' : isExpiringSoon ? 'Expiring Soon' : 'Valid'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Expires: {new Date(cert.expiresAt).toLocaleDateString()}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add Certification</CardTitle>
            <CardDescription>Add a new certification record.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="certName">Certification Name</Label>
              <Input id="certName" placeholder="First Aid" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issuedAt">Issued Date</Label>
                <Input id="issuedAt" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expires Date</Label>
                <Input id="expiresAt" type="date" />
              </div>
            </div>
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Certification
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
