'use client';

import { Globe, Loader2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddDomainDialogProps {
  onAddDomain: (domain: string) => Promise<{ success: boolean; error?: string }>;
}

export function AddDomainDialog({ onAddDomain }: AddDomainDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [domain, setDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    const trimmedDomain = domain.trim().toLowerCase();
    if (!trimmedDomain) {
      setError('Please enter a domain');
      return;
    }

    // Remove protocol if user added it
    const cleanDomain = trimmedDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');

    // Basic domain format validation
    const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/;
    if (!domainRegex.test(cleanDomain)) {
      setError('Please enter a valid domain (e.g., example.com or www.example.com)');
      return;
    }

    setIsLoading(true);
    try {
      const result = await onAddDomain(cleanDomain);
      if (result.success) {
        setOpen(false);
        setDomain('');
        router.refresh();
      } else {
        setError(result.error || 'Failed to add domain');
      }
    } catch {
      setError('Failed to add domain. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Domain
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Add Custom Domain
            </DialogTitle>
            <DialogDescription>
              Connect your own domain to your storefront. You&apos;ll need to configure DNS records
              after adding the domain.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                placeholder="example.com or www.example.com"
                value={domain}
                onChange={(e) => {
                  setDomain(e.target.value);
                  setError(null);
                }}
                disabled={isLoading}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <div className="text-sm text-muted-foreground space-y-2">
              <p>After adding, you&apos;ll need to:</p>
              <ol className="list-decimal list-inside space-y-1 pl-2">
                <li>Add a CNAME record pointing to our servers</li>
                <li>Verify your domain ownership</li>
                <li>Wait for SSL certificate provisioning</li>
              </ol>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Domain'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
