'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export type AuthFormMode = 'login' | 'signup' | 'forgot-password' | 'reset-password';

interface AuthFormProps {
  mode: AuthFormMode;
}

const formConfig: Record<
  AuthFormMode,
  {
    title: string;
    description: string;
    submitText: string;
    footerText?: string;
    footerLink?: { text: string; href: string };
  }
> = {
  login: {
    title: 'Welcome back',
    description: 'Enter your credentials to access your account',
    submitText: 'Sign in',
    footerText: "Don't have an account?",
    footerLink: { text: 'Sign up', href: '/signup' },
  },
  signup: {
    title: 'Create an account',
    description: 'Enter your details to get started',
    submitText: 'Create account',
    footerText: 'Already have an account?',
    footerLink: { text: 'Sign in', href: '/login' },
  },
  'forgot-password': {
    title: 'Forgot your password?',
    description: "Enter your email and we'll send you a reset link",
    submitText: 'Send reset link',
    footerText: 'Remember your password?',
    footerLink: { text: 'Sign in', href: '/login' },
  },
  'reset-password': {
    title: 'Reset your password',
    description: 'Enter your new password',
    submitText: 'Reset password',
  },
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const config = formConfig[mode];
  const redirect = searchParams.get('redirect') || '/dashboard';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    const supabase = createClient();

    try {
      switch (mode) {
        case 'login': {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          router.push(redirect as never);
          router.refresh();
          break;
        }

        case 'signup': {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              },
              emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
            },
          });
          if (error) throw error;
          setSuccess('Check your email for a confirmation link.');
          break;
        }

        case 'forgot-password': {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          });
          if (error) throw error;
          setSuccess('Check your email for a password reset link.');
          break;
        }

        case 'reset-password': {
          const { error } = await supabase.auth.updateUser({
            password,
          });
          if (error) throw error;
          setSuccess('Password updated successfully.');
          setTimeout(() => router.push('/login' as never), 2000);
          break;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">{config.title}</CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div
              className="rounded-md bg-destructive/15 px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              {error}
            </div>
          )}
          {success && (
            <output
              className="block rounded-md bg-green-500/15 px-4 py-3 text-sm text-green-600 dark:text-green-400"
            >
              {success}
            </output>
          )}

          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
                required
                disabled={isLoading}
              />
            </div>
          )}

          {mode !== 'reset-password' && (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                required
                disabled={isLoading}
              />
            </div>
          )}

          {(mode === 'login' || mode === 'signup' || mode === 'reset-password') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {mode === 'login' && (
                  <a
                    href="/forgot-password"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Forgot password?
                  </a>
                )}
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder={mode === 'reset-password' ? 'New password' : undefined}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                required
                minLength={8}
                disabled={isLoading}
              />
            </div>
          )}

          {mode === 'reset-password' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                autoComplete="new-password"
                required
                minLength={8}
                disabled={isLoading}
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Please wait...' : config.submitText}
          </Button>

          {config.footerLink && (
            <p className="text-sm text-center text-muted-foreground">
              {config.footerText}{' '}
              <a href={config.footerLink.href} className="text-primary hover:underline">
                {config.footerLink.text}
              </a>
            </p>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
