'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

interface Category {
  id: string;
  name: string;
}

export default function EditScriptPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [requireAdmin, setRequireAdmin] = useState(false);
  const [bypassExecutionPolicy, setBypassExecutionPolicy] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [appUrl, setAppUrl] = useState('http://localhost:3000');
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { t } = useLanguage();

  useEffect(() => {
    loadAppUrl();
  }, []);

  useEffect(() => {
    if (id) {
      loadScript();
      loadCategories();
    }
  }, [id]);

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

  const loadScript = async () => {
    try {
      const response = await fetch(`/api/scripts?id=${id}`);
      if (response.ok) {
        const script = await response.json();
        setName(script.name);
        setDescription(script.description || '');
        setContent(script.content);
        setCategoryId(script.categoryId || '');
        setRequireAdmin(script.requireAdmin || false);
        setBypassExecutionPolicy(script.bypassExecutionPolicy !== false);
      } else {
        setError(t('scriptNotFound'));
      }
    } catch {
      setError(t('failedToLoadScript'));
    } finally {
      setLoading(false);
    }
  };

  const insertTemplate = (template: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const beforeText = content.substring(0, startPos);
    const afterText = content.substring(endPos);

    // Insert template at cursor position or append if at end
    const newContent = beforeText + template + afterText;
    setContent(newContent);

    // Set cursor position after inserted template
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(startPos + template.length, startPos + template.length);
    }, 0);
  };

  const templates = {
    executeCommand: `# Execute a command
\$result = Invoke-Expression "your-command-here"
Write-Host "Result: \$result"
`,
    downloadAndRun: `# Download and execute a file
\$url = "https://example.com/file.exe"
\$outputPath = "\$env:TEMP\\downloaded-file.exe"

Download-File -Url \$url -OutputPath \$outputPath

if (Test-Path \$outputPath) {
    Write-Host "Executing downloaded file..." -ForegroundColor Green
    Start-Process -FilePath \$outputPath -Wait
    Remove-Item \$outputPath -Force
} else {
    Write-Host "Download failed!" -ForegroundColor Red
}
`,
    createFolder: `# Create a folder
\$folderPath = "C:\\MyFolder"

if (-not (Test-Path \$folderPath)) {
    New-Item -ItemType Directory -Path \$folderPath
    Write-Host "Folder created: \$folderPath" -ForegroundColor Green
} else {
    Write-Host "Folder already exists: \$folderPath" -ForegroundColor Yellow
}
`,
    setEnvVariable: `# Set an environment variable
\$varName = "MY_VARIABLE"
\$varValue = "MyValue"

[System.Environment]::SetEnvironmentVariable(\$varName, \$varValue, [System.EnvironmentVariableTarget]::User)
Write-Host "Environment variable set: \$varName = \$varValue" -ForegroundColor Green
`,
    registryEdit: `# Edit registry (requires admin rights)
\$regPath = "HKCU:\\Software\\MyApp"
\$regName = "Setting"
\$regValue = "Value"

if (-not (Test-Path \$regPath)) {
    New-Item -Path \$regPath -Force | Out-Null
}

Set-ItemProperty -Path \$regPath -Name \$regName -Value \$regValue
Write-Host "Registry value set: \$regPath\\\$regName = \$regValue" -ForegroundColor Green
`,
    serviceControl: `# Control a Windows service
\$serviceName = "YourServiceName"

\$service = Get-Service -Name \$serviceName -ErrorAction SilentlyContinue

if (\$service) {
    if (\$service.Status -eq "Running") {
        Write-Host "Stopping service: \$serviceName" -ForegroundColor Yellow
        Stop-Service -Name \$serviceName -Force
    } else {
        Write-Host "Starting service: \$serviceName" -ForegroundColor Green
        Start-Service -Name \$serviceName
    }
} else {
    Write-Host "Service not found: \$serviceName" -ForegroundColor Red
}
`,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const response = await fetch('/api/scripts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name,
          description,
          content,
          categoryId: categoryId || null,
          requireAdmin,
          bypassExecutionPolicy
        }),
      });

      if (response.ok) {
        router.push('/admin');
      } else {
        setError(t('failedToUpdateScript'));
      }
    } catch {
      setError(t('errorOccurred'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              {t('editScript')}
            </h3>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('scriptName')}
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('categoryOptional')}
                </label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                >
                  <option value="">{t('uncategorized')}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('descriptionOptional')}
                </label>
                <input
                  type="text"
                  id="description"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('powershellContent')}
                </label>

                {/* Quick Commands */}
                <div className="mt-2 mb-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">{t('quickCommands')}</h4>
                    <span className="text-xs text-gray-500">{t('quickCommandsDesc')}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => insertTemplate(templates.executeCommand)}
                      className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-700"
                    >
                      {t('cmdExecuteCommand')}
                    </button>
                    <button
                      type="button"
                      onClick={() => insertTemplate(templates.downloadAndRun)}
                      className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-700"
                    >
                      {t('cmdDownloadAndRun')}
                    </button>
                    <button
                      type="button"
                      onClick={() => insertTemplate(templates.createFolder)}
                      className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-700"
                    >
                      {t('cmdCreateFolder')}
                    </button>
                    <button
                      type="button"
                      onClick={() => insertTemplate(templates.setEnvVariable)}
                      className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-700"
                    >
                      {t('cmdSetEnvVariable')}
                    </button>
                    <button
                      type="button"
                      onClick={() => insertTemplate(templates.registryEdit)}
                      className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-700"
                    >
                      {t('cmdRegistryEdit')}
                    </button>
                    <button
                      type="button"
                      onClick={() => insertTemplate(templates.serviceControl)}
                      className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-700"
                    >
                      {t('cmdServiceControl')}
                    </button>
                  </div>
                </div>

                <textarea
                  id="content"
                  required
                  rows={15}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">{t('scriptOptions')}</h4>

                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="bypassExecutionPolicy"
                        type="checkbox"
                        checked={bypassExecutionPolicy}
                        onChange={(e) => setBypassExecutionPolicy(e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="bypassExecutionPolicy" className="font-medium text-gray-700">
                        {t('bypassExecutionPolicy')}
                      </label>
                      <p className="text-gray-500">
                        {t('bypassExecutionPolicyDesc')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="requireAdmin"
                        type="checkbox"
                        checked={requireAdmin}
                        onChange={(e) => setRequireAdmin(e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="requireAdmin" className="font-medium text-gray-700">
                        {t('requireAdmin')}
                      </label>
                      <p className="text-gray-500">
                        {t('requireAdminDesc')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">{t('availableHelpers')}</h4>
                <div className="bg-gray-50 p-3 rounded text-sm space-y-3">
                  <div>
                    <p className="text-gray-600 mb-1">{t('helperDomainConstant')}</p>
                    <p className="font-mono text-blue-600 mb-1">{t('helperDomainExample', { domain: appUrl })}</p>
                    <p className="text-xs text-gray-500 italic">{t('helperDomainUsage')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">{t('helperDownload')}</p>
                    <p className="font-mono text-blue-600">{t('helperDownloadExample')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">{t('helperDownloadFromFiles')}</p>
                    <p className="font-mono text-blue-600">Download-File -Url "$domain/api/files/FILE_ID" -OutputPath "C:\myfile.exe"</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Link
                  href="/admin"
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {t('cancel')}
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {saving ? t('saving') : t('saveChanges')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
}
