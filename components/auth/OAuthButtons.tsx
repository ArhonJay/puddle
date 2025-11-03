'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks';

interface OAuthButtonsProps {
  onSuccess?: () => void;
}

export function OAuthButtons({ onSuccess }: OAuthButtonsProps) {
  const router = useRouter();
  const { loginWithProvider } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setLoadingProvider(provider);

    // Use the authStore loginWithProvider method
    await loginWithProvider(provider);

    setLoadingProvider(null);
    onSuccess?.();
    router.push('/home');
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Google OAuth */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 bg-white hover:bg-gray-100 text-gray-900 hover:text-gray-900 border-[3px] border-black hover:border-black transition-all font-[family-name:var(--font-pixel)] text-sm rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px]"
        style={{ imageRendering: 'pixelated' }}
        onClick={() => handleOAuthLogin('google')}
        disabled={loadingProvider !== null}
      >
        {loadingProvider === 'google' ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </>
        )}
      </Button>

      {/* GitHub OAuth */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 bg-white hover:bg-gray-100 text-gray-900 hover:text-gray-900 border-[3px] border-black hover:border-black transition-all font-[family-name:var(--font-pixel)] text-sm rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px]"
        style={{ imageRendering: 'pixelated' }}
        onClick={() => handleOAuthLogin('github')}
        disabled={loadingProvider !== null}
      >
        {loadingProvider === 'github' ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <Github className="w-5 h-5 mr-2" />
            GitHub
          </>
        )}
      </Button>
    </div>
  );
}
