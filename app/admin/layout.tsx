'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900">
                {t('scriptsManager')}
              </h1>
              <Link
                href="/admin"
                className={
                  pathname === '/admin'
                    ? 'text-blue-600 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }
              >
                {t('scripts')}
              </Link>
              <Link
                href="/admin/files"
                className={
                  pathname === '/admin/files'
                    ? 'text-blue-600 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }
              >
                {t('files')}
              </Link>
              <Link
                href="/admin/stats"
                className={
                  pathname === '/admin/stats'
                    ? 'text-blue-600 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }
              >
                {t('statistics')}
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'zh')}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="en">English</option>
                <option value="zh">中文</option>
              </select>
              <Link
                href="/admin/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {t('newScript')}
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
