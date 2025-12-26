'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

interface Script {
  id: string;
  name: string;
  description: string | null;
  category: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    usages: number;
  };
}

interface Category {
  id: string;
  name: string;
  order: number;
  _count: {
    scripts: number;
  };
}

export default function AdminPage() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);
  const [categoryError, setCategoryError] = useState('');
  const [appUrl, setAppUrl] = useState('http://localhost:3000');
  const { t } = useLanguage();

  useEffect(() => {
    loadAppUrl();
    loadScripts();
    loadCategories();
  }, []);

  const loadAppUrl = async () => {
    try {
      const response = await fetch('/api/config');
      if (response.ok) {
        const data = await response.json();
        setAppUrl(data.appUrl);
      }
    } catch (error) {
      console.error('Error loading app URL:', error);
    }
  };

  const loadScripts = async () => {
    try {
      const response = await fetch('/api/scripts');
      if (response.ok) {
        const data = await response.json();
        setScripts(data);
      }
    } catch (error) {
      console.error('Error loading scripts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirmDelete'))) return;

    try {
      const response = await fetch(`/api/scripts?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setScripts(scripts.filter((s) => s.id !== id));
      }
    } catch (error) {
      console.error('Error deleting script:', error);
    }
  };

  const copyRunCommand = (id: string) => {
    const command = `iex (irm ${appUrl}/api/run/${id})`;
    navigator.clipboard.writeText(command);
    alert('Command copied to clipboard!');
  };

  const copyMenuCommand = () => {
    const command = `iex (irm ${appUrl}/s)`;
    navigator.clipboard.writeText(command);
    alert('Command copied to clipboard!');
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryError('');

    if (!newCategoryName.trim()) {
      setCategoryError(t('categoryNameRequired'));
      return;
    }

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName }),
      });

      if (response.ok) {
        setNewCategoryName('');
        await loadCategories();
      } else {
        const data = await response.json();
        setCategoryError(data.error || t('failedToCreateCategory'));
      }
    } catch {
      setCategoryError(t('errorOccurred'));
    }
  };

  const handleUpdateCategory = async (id: string, name: string) => {
    if (!name.trim()) {
      setCategoryError(t('categoryNameRequired'));
      return;
    }

    try {
      const response = await fetch('/api/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name }),
      });

      if (response.ok) {
        setEditingCategory(null);
        await loadCategories();
      } else {
        setCategoryError(t('failedToUpdateCategory'));
      }
    } catch {
      setCategoryError(t('errorOccurred'));
    }
  };

  const handleDeleteCategory = async (id: string, name: string, scriptCount: number) => {
    if (scriptCount > 0) {
      if (!confirm(t('confirmDeleteCategory', { name, count: scriptCount.toString() }))) {
        return;
      }
    } else {
      if (!confirm(t('confirmDeleteCategoryEmpty', { name }))) {
        return;
      }
    }

    try {
      const response = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadCategories();
        await loadScripts(); // Reload scripts to update category assignments
      } else {
        setCategoryError(t('failedToDeleteCategory'));
      }
    } catch {
      setCategoryError(t('errorOccurred'));
    }
  };

  const moveCategory = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = categories.findIndex((c) => c.id === id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const currentCategory = categories[currentIndex];
    const targetCategory = categories[targetIndex];

    try {
      await Promise.all([
        fetch('/api/categories', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: currentCategory.id, order: targetCategory.order }),
        }),
        fetch('/api/categories', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: targetCategory.id, order: currentCategory.order }),
        }),
      ]);

      await loadCategories();
    } catch {
      setCategoryError(t('failedToReorderCategories'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">{t('loading')}</div>
      </div>
    );
  }

  // 按分类分组
  const categorizedScripts = scripts.filter(script => script.category !== null);
  const uncategorizedScripts = scripts.filter(script => script.category === null);

  const groupedScripts = categorizedScripts.reduce((acc, script) => {
    const categoryName = script.category!.name;
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(script);
    return acc;
  }, {} as Record<string, Script[]>);

  const categoryNames = Object.keys(groupedScripts).sort();

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('scripts')}</h2>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
          >
            {t('categories')}
          </button>
        </div>

        {scripts.length > 0 && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-900">
                  {t('quickAccess')}
                </h3>
                <p className="mt-1 text-sm text-blue-700">
                  {t('quickAccessDesc')}
                </p>
                <code className="mt-2 block bg-white px-3 py-2 rounded border border-blue-200 text-sm font-mono text-gray-900">
                  iex (irm {appUrl})
                </code>
              </div>
              <button
                onClick={copyMenuCommand}
                className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                {t('copyCommand')}
              </button>
            </div>
          </div>
        )}

        {scripts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">{t('noScriptsYet')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Uncategorized Scripts */}
            {uncategorizedScripts.length > 0 && (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {uncategorizedScripts.map((script) => (
                    <li key={script.id}>
                      <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">
                              {script.name}
                            </h3>
                            {script.description && (
                              <p className="mt-1 text-sm text-gray-600">
                                {script.description}
                              </p>
                            )}
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <span>{t('usedTimes', { count: script._count.usages })}</span>
                              <span className="mx-2">•</span>
                              <span>
                                {t('updated')} {new Date(script.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => copyRunCommand(script.id)}
                              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              {t('copyCommand')}
                            </button>
                            <Link
                              href={`/admin/edit/${script.id}`}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              {t('edit')}
                            </Link>
                            <button
                              onClick={() => handleDelete(script.id)}
                              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              {t('delete')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Categorized Scripts */}
            {categoryNames.map((category) => (
              <div key={category}>
                <h2 className="text-xl font-semibold text-gray-900 mb-3 px-2">
                  {category}
                </h2>
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {groupedScripts[category].map((script) => (
                      <li key={script.id}>
                        <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900">
                                {script.name}
                              </h3>
                              {script.description && (
                                <p className="mt-1 text-sm text-gray-600">
                                  {script.description}
                                </p>
                              )}
                              <div className="mt-2 flex items-center text-sm text-gray-500">
                                <span>{t('usedTimes', { count: script._count.usages })}</span>
                                <span className="mx-2">•</span>
                                <span>
                                  {t('updated')} {new Date(script.updatedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => copyRunCommand(script.id)}
                                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                {t('copyCommand')}
                              </button>
                              <Link
                                href={`/admin/edit/${script.id}`}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                {t('edit')}
                              </Link>
                              <button
                                onClick={() => handleDelete(script.id)}
                                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                {t('delete')}
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Management Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">{t('categories')}</h3>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setCategoryError('');
                  setEditingCategory(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {categoryError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {categoryError}
              </div>
            )}

            {/* Create New Category */}
            <form onSubmit={handleCreateCategory} className="mb-6">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder={t('categoryName')}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {t('create')}
                </button>
              </div>
            </form>

            {/* Categories List */}
            {categories.length === 0 ? (
              <p className="text-gray-500 text-center py-8">{t('noCategoriesYet')}</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {categories.map((category, index) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    {editingCategory?.id === category.id ? (
                      <>
                        <input
                          type="text"
                          value={editingCategory.name}
                          onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                          className="flex-1 rounded-md border border-gray-300 px-3 py-1 text-sm"
                          autoFocus
                        />
                        <div className="flex space-x-2 ml-3">
                          <button
                            onClick={() => handleUpdateCategory(editingCategory.id, editingCategory.name)}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            {t('save')}
                          </button>
                          <button
                            onClick={() => setEditingCategory(null)}
                            className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                          >
                            {t('cancel')}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center space-x-3">
                          <div className="flex flex-col space-y-1">
                            <button
                              onClick={() => moveCategory(category.id, 'up')}
                              disabled={index === 0}
                              className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                              title={t('moveUp')}
                            >
                              ▲
                            </button>
                            <button
                              onClick={() => moveCategory(category.id, 'down')}
                              disabled={index === categories.length - 1}
                              className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                              title={t('moveDown')}
                            >
                              ▼
                            </button>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{category.name}</p>
                            <p className="text-sm text-gray-500">
                              {category._count.scripts === 1
                                ? t('scriptsCount', { count: category._count.scripts.toString() })
                                : t('scriptsCountPlural', { count: category._count.scripts.toString() })}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingCategory({ id: category.id, name: category.name })}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            {t('edit')}
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id, category.name, category._count.scripts)}
                            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            {t('delete')}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
