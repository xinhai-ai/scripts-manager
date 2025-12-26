'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Category {
  id: string;
  name: string;
  order: number;
  _count: {
    scripts: number;
  };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newCategoryName.trim()) {
      setError(t('categoryNameRequired'));
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
        setError(data.error || t('failedToCreateCategory'));
      }
    } catch {
      setError(t('errorOccurred'));
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) {
      setError(t('categoryNameRequired'));
      return;
    }

    try {
      const response = await fetch('/api/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: editingName }),
      });

      if (response.ok) {
        setEditingId(null);
        setEditingName('');
        await loadCategories();
      } else {
        setError(t('failedToUpdateCategory'));
      }
    } catch {
      setError(t('errorOccurred'));
    }
  };

  const handleDelete = async (id: string, name: string, scriptCount: number) => {
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
      } else {
        setError(t('failedToDeleteCategory'));
      }
    } catch {
      setError(t('errorOccurred'));
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
      setError(t('failedToReorderCategories'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="bg-white shadow sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            {t('createNewCategory')}
          </h3>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="flex space-x-3">
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
          </form>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            {t('categories')}
          </h3>

          {categories.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t('noCategoriesYet')}</p>
          ) : (
            <div className="space-y-2">
              {categories.map((category, index) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  {editingId === category.id ? (
                    <>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 rounded-md border border-gray-300 px-3 py-1 text-sm"
                        autoFocus
                      />
                      <div className="flex space-x-2 ml-3">
                        <button
                          onClick={() => handleUpdate(category.id)}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          {t('save')}
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditingName('');
                          }}
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
                          onClick={() => {
                            setEditingId(category.id);
                            setEditingName(category.name);
                          }}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          {t('edit')}
                        </button>
                        <button
                          onClick={() => handleDelete(category.id, category.name, category._count.scripts)}
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
    </div>
  );
}
