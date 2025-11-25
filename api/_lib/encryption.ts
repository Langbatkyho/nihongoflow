import crypto from 'crypto';
import { Buffer } from 'buffer';

const ALGORITHM = 'aes-256-cbc';

// Hàm helper để tạo key 32 bytes từ chuỗi bất kỳ (tránh lỗi độ dài key)
const getKey = () => {
  const secret = process.env.ENCRYPTION_SECRET || '12345678901234567890123456789012';
  // Dùng SHA-256 để đảm bảo key luôn là 32 bytes buffer
  return crypto.createHash('sha256').update(String(secret)).digest();
};

export const encrypt = (text: string) => {
  // Tạo IV ngẫu nhiên 16 bytes
  const iv = crypto.randomBytes(16);
  // Tạo Cipher với key đã hash
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  return { 
    content: encrypted.toString('hex'), 
    iv: iv.toString('hex') 
  };
};

export const decrypt = (hash: { content: string, iv: string }) => {
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(hash.iv, 'hex'));
  
  let decrpyted = decipher.update(Buffer.from(hash.content, 'hex'));
  decrpyted = Buffer.concat([decrpyted, decipher.final()]);
  
  return decrpyted.toString();
};