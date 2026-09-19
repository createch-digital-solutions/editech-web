'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSignIn } from '@clerk/nextjs';
import { Award, Sparkles, Trophy } from 'lucide-react';
import { AuthShell } from '@/components/auth/auth-shell';
import { TextField, Divider, SocialButtons, SubmitButton, FormError } from '@/components/auth/form-controls';

const perks = [
  { icon: Sparkles, label: 'AI-personalised learning paths' },
  { icon: Trophy, label: 'Track your XP and achievements' },
  { icon: Award, label: 'Earn verifiable certificates' },
];

export default function SignInPage() {
  const router = useRouter();
  const { signIn, fetchStatus } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loading = fetchStatus === 'fetching';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const { error: signInError } = await signIn.password({ identifier: email, password });
    if (signInError) {
      setError(signInError.longMessage ?? signInError.message);
      return;
    }

    if (signIn.status === 'complete') {
      await signIn.finalize();
      router.push('/');
    } else {
      setError('Additional verification is required to finish signing in.');
    }
  }

  async function handleOAuth(strategy: 'oauth_google' | 'oauth_apple') {
    setError(null);
    const { error: ssoError } = await signIn.sso({
      strategy,
      redirectUrl: '/sso-callback',
      redirectCallbackUrl: '/sso-callback',
    });
    if (ssoError) {
      setError(ssoError.longMessage ?? ssoError.message);
    }
  }

  return (
    <AuthShell
      leftContent={
        <div>
          <h1 className="text-4xl font-extrabold leading-tight text-white">
            Welcome back, keep elevating.
          </h1>
          <p className="mt-4 max-w-sm text-gray-300">
            Your AI coach Aria has been keeping your path warm.
          </p>

          <ul className="mt-10 space-y-4">
            {perks.map((perk) => (
              <li key={perk.label} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-orange-400">
                  <perk.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="text-sm text-gray-200">{perk.label}</span>
              </li>
            ))}
          </ul>
        </div>
      }
    >
      <h2 className="text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
      <p className="mt-2 text-sm text-gray-500">
        No account yet?{' '}
        <Link href="/sign-up" className="font-semibold text-orange-600 hover:text-orange-700">
          Sign up free &rarr;
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <FormError message={error} />}

        <TextField
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="kofi@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-gray-300 text-orange-500 focus:ring-orange-400"
            />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-orange-600 hover:text-orange-700"
          >
            Forgot password?
          </Link>
        </div>

        <SubmitButton loading={loading}>Sign In &rarr;</SubmitButton>

        <Divider />

        <SocialButtons
          disabled={loading}
          onGoogle={() => handleOAuth('oauth_google')}
          onApple={() => handleOAuth('oauth_apple')}
        />
      </form>
    </AuthShell>
  );
}
