export const translations = {
  en: {
    // Navigation
    scriptsManager: 'Scripts Manager',
    scripts: 'Scripts',
    categories: 'Categories',
    files: 'Files',
    statistics: 'Statistics',
    newScript: 'New Script',
    logout: 'Logout',

    // Scripts page
    quickAccess: 'Quick Access - Interactive Menu',
    quickAccessDesc: 'Run this command in PowerShell to see all scripts in an interactive menu:',
    copyCommand: 'Copy Command',
    noScriptsYet: 'No scripts yet. Create your first one!',
    loading: 'Loading...',
    usedTimes: 'Used {count} times',
    updated: 'Updated',
    edit: 'Edit',
    delete: 'Delete',
    confirmDelete: 'Are you sure you want to delete this script?',

    // Script form
    createNewScript: 'Create New Script',
    editScript: 'Edit Script',
    scriptName: 'Script Name',
    category: 'Category',
    categoryOptional: 'Category (optional)',
    uncategorized: 'Uncategorized',
    description: 'Description',
    descriptionOptional: 'Description (optional)',
    powershellContent: 'PowerShell Script Content',
    scriptOptions: 'Script Options',
    bypassExecutionPolicy: 'Bypass Execution Policy (Recommended)',
    bypassExecutionPolicyDesc: 'Automatically bypass PowerShell execution policy restrictions',
    requireAdmin: 'Require Administrator Rights',
    requireAdminDesc: 'Automatically request admin privileges if not already elevated',
    availableHelpers: 'Available Helper Functions',
    helperDownload: 'Download a file from URL:',
    helperDownloadExample: 'Download-File -Url "https://example.com/file.zip" -OutputPath "C:\\file.zip"',
    helperDownloadFromFiles: 'Download from uploaded files (use Copy URL from Files page):',
    helperDomainConstant: 'Domain constant (automatically available in your script):',
    helperDomainExample: '$domain = "{domain}"',
    helperDomainUsage: 'Example usage: Download-File -Url "$domain/api/files/FILE_ID" -OutputPath "C:\\myfile.exe"',

    // Quick command templates
    quickCommands: 'Quick Commands',
    quickCommandsDesc: 'Click to insert a template into your script',
    cmdExecuteCommand: 'Execute Command',
    cmdDownloadAndRun: 'Download & Execute File',
    cmdCreateFolder: 'Create Folder',
    cmdSetEnvVariable: 'Set Environment Variable',
    cmdRegistryEdit: 'Edit Registry',
    cmdServiceControl: 'Control Service',

    cancel: 'Cancel',
    createScript: 'Create Script',
    creating: 'Creating...',
    saveChanges: 'Save Changes',
    saving: 'Saving...',

    // Categories page
    createNewCategory: 'Create New Category',
    categoryName: 'Category name',
    create: 'Create',
    noCategoriesYet: 'No categories yet. Create your first one!',
    scriptsCount: '{count} script',
    scriptsCountPlural: '{count} scripts',
    save: 'Save',
    moveUp: 'Move up',
    moveDown: 'Move down',
    confirmDeleteCategory: 'Category "{name}" has {count} script(s). These scripts will become uncategorized. Continue?',
    confirmDeleteCategoryEmpty: 'Are you sure you want to delete category "{name}"?',

    // Files page
    uploadFile: 'Upload File',
    selectFile: 'Select File',
    upload: 'Upload',
    uploading: 'Uploading...',
    uploadedFiles: 'Uploaded Files',
    noFilesYet: 'No files uploaded yet',
    fileName: 'File Name',
    type: 'Type',
    size: 'Size',
    uploaded: 'Uploaded',
    actions: 'Actions',
    copyUrl: 'Copy URL',
    download: 'Download',
    usageInScripts: 'Usage in Scripts',
    usageInScriptsDesc: 'After uploading a file, copy its URL and use it in your PowerShell scripts:',

    // Statistics page
    usageStatistics: 'Usage Statistics',
    noUsageYet: 'No usage statistics yet',
    script: 'Script',
    ipAddress: 'IP Address',
    timestamp: 'Timestamp',

    // Login page
    login: 'Login',
    password: 'Password',
    loginButton: 'Login',
    loggingIn: 'Logging in...',
    adminPasswordPrompt: 'Enter admin password to continue',
    signIn: 'Sign in',
    invalidPassword: 'Invalid password',

    // Error messages
    errorOccurred: 'An error occurred',
    categoryNameRequired: 'Category name cannot be empty',
    failedToCreateCategory: 'Failed to create category',
    failedToUpdateCategory: 'Failed to update category',
    failedToDeleteCategory: 'Failed to delete category',
    failedToReorderCategories: 'Failed to reorder categories',
    failedToLoadFiles: 'Failed to load files',
    pleaseSelectFile: 'Please select a file',
    failedToUploadFile: 'Failed to upload file',
    failedToDeleteFile: 'Failed to delete file',
    confirmDeleteFile: 'Are you sure you want to delete this file?',
    urlCopied: 'URL copied to clipboard!',
    failedToCreateScript: 'Failed to create script',
    failedToUpdateScript: 'Failed to update script',
    scriptNotFound: 'Script not found',
    failedToLoadScript: 'Failed to load script',

    // PowerShell menu
    psScriptsManager: 'PowerShell Scripts Manager',
    psSelectCategory: 'Please select a category',
    psSelectScript: 'Please select a script number',
    psBackToCategories: 'Back to Categories',
    psExit: 'Exit',
    psGoodbye: 'Goodbye!',
    psInvalidSelection: 'Invalid selection',
    psExecuting: 'Executing: {name}...',
    psErrorExecuting: 'Error executing script: {error}',
    psPressAnyKey: 'Press any key to continue...',
    psNoScriptsAvailable: 'No scripts available',
    psErrorLoading: 'Error loading scripts',
    psLoadingLanguage: 'Loading scripts manager ({lang})...',
  },
  zh: {
    // 导航
    scriptsManager: '脚本管理器',
    scripts: '脚本',
    categories: '分类',
    files: '文件',
    statistics: '统计',
    newScript: '新建脚本',
    logout: '退出登录',

    // 脚本页面
    quickAccess: '快速访问 - 交互式菜单',
    quickAccessDesc: '在 PowerShell 中运行此命令以查看交互式菜单中的所有脚本：',
    copyCommand: '复制命令',
    noScriptsYet: '还没有脚本。创建您的第一个脚本！',
    loading: '加载中...',
    usedTimes: '使用了 {count} 次',
    updated: '更新于',
    edit: '编辑',
    delete: '删除',
    confirmDelete: '确定要删除此脚本吗？',

    // 脚本表单
    createNewScript: '创建新脚本',
    editScript: '编辑脚本',
    scriptName: '脚本名称',
    category: '分类',
    categoryOptional: '分类（可选）',
    uncategorized: '未分类',
    description: '描述',
    descriptionOptional: '描述（可选）',
    powershellContent: 'PowerShell 脚本内容',
    scriptOptions: '脚本选项',
    bypassExecutionPolicy: '绕过执行策略（推荐）',
    bypassExecutionPolicyDesc: '自动绕过 PowerShell 执行策略限制',
    requireAdmin: '需要管理员权限',
    requireAdminDesc: '自动请求管理员权限（如果未提升权限）',
    availableHelpers: '可用的辅助函数',
    helperDownload: '从 URL 下载文件：',
    helperDownloadExample: 'Download-File -Url "https://example.com/file.zip" -OutputPath "C:\\file.zip"',
    helperDownloadFromFiles: '从已上传的文件下载（使用文件页面的复制 URL）：',
    helperDomainConstant: '域名常量（在脚本中自动可用）：',
    helperDomainExample: '$domain = "{domain}"',
    helperDomainUsage: '使用示例：Download-File -Url "$domain/api/files/FILE_ID" -OutputPath "C:\\myfile.exe"',

    // 快捷命令模板
    quickCommands: '快捷命令',
    quickCommandsDesc: '点击插入模板到你的脚本中',
    cmdExecuteCommand: '执行命令',
    cmdDownloadAndRun: '下载并执行文件',
    cmdCreateFolder: '创建文件夹',
    cmdSetEnvVariable: '设置环境变量',
    cmdRegistryEdit: '编辑注册表',
    cmdServiceControl: '控制服务',

    cancel: '取消',
    createScript: '创建脚本',
    creating: '创建中...',
    saveChanges: '保存更改',
    saving: '保存中...',

    // 分类页面
    createNewCategory: '创建新分类',
    categoryName: '分类名称',
    create: '创建',
    noCategoriesYet: '还没有分类。创建您的第一个分类！',
    scriptsCount: '{count} 个脚本',
    scriptsCountPlural: '{count} 个脚本',
    save: '保存',
    moveUp: '上移',
    moveDown: '下移',
    confirmDeleteCategory: '分类 "{name}" 有 {count} 个脚本。这些脚本将变为未分类。继续吗？',
    confirmDeleteCategoryEmpty: '确定要删除分类 "{name}" 吗？',

    // 文件页面
    uploadFile: '上传文件',
    selectFile: '选择文件',
    upload: '上传',
    uploading: '上传中...',
    uploadedFiles: '已上传的文件',
    noFilesYet: '还没有上传文件',
    fileName: '文件名',
    type: '类型',
    size: '大小',
    uploaded: '上传于',
    actions: '操作',
    copyUrl: '复制 URL',
    download: '下载',
    usageInScripts: '在脚本中使用',
    usageInScriptsDesc: '上传文件后，复制其 URL 并在 PowerShell 脚本中使用：',

    // 统计页面
    usageStatistics: '使用统计',
    noUsageYet: '还没有使用统计',
    script: '脚本',
    ipAddress: 'IP 地址',
    timestamp: '时间戳',

    // 登录页面
    login: '登录',
    password: '密码',
    loginButton: '登录',
    loggingIn: '登录中...',
    adminPasswordPrompt: '输入管理员密码以继续',
    signIn: '登录',
    invalidPassword: '密码无效',

    // 错误消息
    errorOccurred: '发生错误',
    categoryNameRequired: '分类名称不能为空',
    failedToCreateCategory: '创建分类失败',
    failedToUpdateCategory: '更新分类失败',
    failedToDeleteCategory: '删除分类失败',
    failedToReorderCategories: '重新排序分类失败',
    failedToLoadFiles: '加载文件失败',
    pleaseSelectFile: '请选择文件',
    failedToUploadFile: '上传文件失败',
    failedToDeleteFile: '删除文件失败',
    confirmDeleteFile: '确定要删除此文件吗？',
    urlCopied: 'URL 已复制到剪贴板！',
    failedToCreateScript: '创建脚本失败',
    failedToUpdateScript: '更新脚本失败',
    scriptNotFound: '脚本未找到',
    failedToLoadScript: '加载脚本失败',

    // PowerShell 菜单
    psScriptsManager: 'PowerShell 脚本管理器',
    psSelectCategory: '请选择一个分类',
    psSelectScript: '请选择脚本编号',
    psBackToCategories: '返回分类',
    psExit: '退出',
    psGoodbye: '再见！',
    psInvalidSelection: '无效选择',
    psExecuting: '正在执行：{name}...',
    psErrorExecuting: '执行脚本时出错：{error}',
    psPressAnyKey: '按任意键继续...',
    psNoScriptsAvailable: '没有可用的脚本',
    psErrorLoading: '加载脚本时出错',
    psLoadingLanguage: '正在加载脚本管理器 ({lang})...',
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;

export function t(lang: Language, key: TranslationKey, params?: Record<string, string | number>): string {
  let text = translations[lang][key] || translations.en[key];

  if (params) {
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, String(params[param]));
    });
  }

  return text;
}
