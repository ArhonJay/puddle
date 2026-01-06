'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/hooks';

interface LoginFormProps {
  mode?: 'login' | 'signup';
  onSuccess?: () => void;
}

export function LoginForm({ mode = 'signup', onSuccess }: LoginFormProps) {
  const router = useRouter();
  const { loginWithEmail, signupWithEmail, clearError, error: authError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isSignup = mode === 'signup';

  const validateForm = (): boolean => {
    const newErrors: { name?: string; email?: string; password?: string } = {};

    // Name validation (only for signup)
    if (isSignup && !name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();
    setSuccessMessage(null);

    if (!validateForm()) return;

    setIsLoading(true);

    let result;
    if (isSignup) {
      result = await signupWithEmail(email, password, name);
      if (!result.error) {
        setSuccessMessage('Account created! Please check your email to confirm your account.');
        setIsLoading(false);
        return;
      }
    } else {
      result = await loginWithEmail(email, password);
      if (!result.error) {
        onSuccess?.();
        router.push('/');
        return;
      }
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Auth Error */}
      {authError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{authError}</p>
        </div>
      )}

      {/* Name Field (Signup only) */}
      {isSignup && (
        <div className="space-y-2">
          <Input
            id="name"
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            className="h-12 bg-white border-2 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-0 rounded-lg"
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-sm text-red-500 animate-fade-in-up">{errors.name}</p>
          )}
        </div>
      )}

      {/* Email Field */}
      <div className="space-y-2">
        <Input
          id="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors({ ...errors, email: undefined });
          }}
          className="h-12 bg-white border-2 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-0 rounded-lg"
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-red-500 animate-fade-in-up">{errors.email}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
            className="h-12 pr-12 bg-white border-2 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-0 rounded-lg"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-500 animate-fade-in-up">{errors.password}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-12 bg-[#3b9dff] hover:bg-[#2a8ae8] text-white font-[family-name:var(--font-pixel)] text-sm rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] transition-all"
        style={{ imageRendering: 'pixelated' }}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span>{isSignup ? 'Creating account...' : 'Logging in...'}</span>
          </div>
        ) : (
          isSignup ? 'Sign up for free' : 'Log in'
        )}
      </Button>

      {/* Terms (Signup only) */}
      {isSignup && (
        <p className="text-center text-xs text-gray-500 pt-2">
          By signing up, I agree to Puddle{' '}
          <Link href="/terms" className="text-gray-700 underline hover:text-gray-900">
            Terms
          </Link>
          .
        </p>
      )}
    </form>
  );
}
