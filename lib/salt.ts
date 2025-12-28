import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const SALT_FILE_PATH = path.join(process.cwd(), 'data', 'auth.salt');

/**
 * 生成随机 salt
 */
function generateSalt(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * 获取或生成 salt
 * 如果 salt 文件不存在，则生成新的 salt 并保存
 */
export function getSalt(): string {
  try {
    // 确保 data 目录存在
    const dataDir = path.dirname(SALT_FILE_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // 如果 salt 文件存在，读取并返回
    if (fs.existsSync(SALT_FILE_PATH)) {
      return fs.readFileSync(SALT_FILE_PATH, 'utf-8').trim();
    }

    // 否则生成新的 salt 并保存
    const newSalt = generateSalt();
    fs.writeFileSync(SALT_FILE_PATH, newSalt, 'utf-8');
    console.log('Generated new password salt and saved to:', SALT_FILE_PATH);

    return newSalt;
  } catch (error) {
    console.error('Error managing salt:', error);
    // 如果文件操作失败，使用固定的默认 salt（不推荐，但作为后备方案）
    return 'scripts-manager-fallback-salt-2024';
  }
}
