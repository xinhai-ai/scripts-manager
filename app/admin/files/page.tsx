'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

interface UploadedFile {
  id: string;
  originalName: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

export default function FilesPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [appUrl, setAppUrl] = useState('http://localhost:3000');
  const { t } = useLanguage();

  useEffect(() => {
    loadFiles();
    loadAppUrl();
  }, []);

  const loadAppUrl = async () => {
    try {
      const response = await fetch('/api/config');
      if (response.ok) {
        const data = await response.json();
        setAppUrl(data.appUrl);
      }
    } catch {
      // 使用默认值
    }
  };

  const loadFiles = async () => {
    try {
      const response = await fetch('/api/upload');
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch {
      setError(t('failedToLoadFiles'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;

    if (!file) {
      setError(t('pleaseSelectFile'));
      return;
    }

    setUploading(true);
    setError('');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await loadFiles();
        (e.target as HTMLFormElement).reset();
      } else {
        setError(t('failedToUploadFile'));
      }
    } catch {
      setError(t('errorOccurred'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirmDeleteFile'))) {
      return;
    }

    try {
      const response = await fetch(`/api/upload?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadFiles();
      } else {
        setError(t('failedToDeleteFile'));
      }
    } catch {
      setError(t('errorOccurred'));
    }
  };

  const copyUrl = (id: string) => {
    const url = `${window.location.origin}/api/files/${id}`;
    navigator.clipboard.writeText(url);
    alert(t('urlCopied'));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="bg-white shadow sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            {t('uploadFile')}
          </h3>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('selectFile')}
              </label>
              <input
                type="file"
                name="file"
                required
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {uploading ? t('uploading') : t('upload')}
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            {t('uploadedFiles')}
          </h3>

          {files.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t('noFilesYet')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('fileName')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('type')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('size')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('uploaded')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {files.map((file) => (
                    <tr key={file.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {file.originalName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {file.mimeType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatSize(file.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(file.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => copyUrl(file.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {t('copyUrl')}
                        </button>
                        <a
                          href={`/api/files/${file.id}`}
                          className="text-green-600 hover:text-green-900"
                          download
                        >
                          {t('download')}
                        </a>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          {t('delete')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h4 className="text-sm font-medium text-blue-900 mb-2">{t('usageInScripts')}</h4>
        <p className="text-sm text-blue-700 mb-2">
          {t('usageInScriptsDesc')}
        </p>
        <div className="bg-white p-3 rounded text-sm font-mono text-gray-700">
          <p className="text-blue-600">Download-File -Url "{appUrl}/api/files/FILE_ID" -OutputPath "C:\filename.ext"</p>
        </div>
      </div>
    </div>
  );
}
