'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { hashPassword } from '@/lib/crypto';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. 获取服务器的 salt
      const saltResponse = await fetch('/api/auth/salt');
      if (!saltResponse.ok) {
        throw new Error('Failed to get salt');
      }
      const { salt } = await saltResponse.json();

      // 2. 对密码进行加盐哈希（PBKDF2）
      const passwordHash = await hashPassword(password, salt);

      // 3. 发送哈希值到服务器进行验证
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passwordHash }),
      });

      if (response.ok) {
        router.push('/admin');
      } else {
        setError(t('invalidPassword'));
      }
    } catch {
      setError(t('errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            {t('scriptsManager')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('adminPasswordPrompt')}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="sr-only">
              {t('password')}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder={t('password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? t('loggingIn') : t('signIn')}
          </button>
        </form>
      </div>
    </div>
  );
}
