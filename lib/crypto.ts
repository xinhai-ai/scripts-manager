/**
 * 使用 PBKDF2 算法对密码进行加盐哈希
 * @param password 原始密码
 * @param salt 盐值
 * @param iterations 迭代次数（默认 100000）
 * @returns 十六进制格式的哈希值
 */
export async function hashPassword(
  password: string,
  salt: string,
  iterations: number = 100000
): Promise<string> {
  const encoder = new TextEncoder();

  // 将密码转换为 CryptoKey
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  // 使用 PBKDF2 派生密钥
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: iterations,
      hash: 'SHA-256',
    },
    passwordKey,
    256 // 输出 256 位
  );

  // 转换为十六进制字符串
  const hashArray = Array.from(new Uint8Array(derivedBits));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}
