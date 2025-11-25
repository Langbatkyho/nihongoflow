import crypto from 'crypto';
import { Buffer } from 'buffer';

const ALGORITHM = 'aes-256-cbc';
// Sử dụng key 32 ký tự. Trong produciton, BẮT BUỘC lấy từ process.env.ENCRYPTION_SECRET
const SECRET_KEY = process.env.ENCRYPTION_SECRET || '12345678901234567890123456789012'; 

export const encrypt = (text: string) => {
  // Tạo IV ngẫu nhiên 16 bytes
  const iv = crypto.randomBytes(16);
  // Tạo Cipher
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
  // Mã hóa
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  return { 
    content: encrypted.toString('hex'), 
    iv: iv.toString('hex') 
  };
};

export const decrypt = (hash: { content: string, iv: string }) => {
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY), Buffer.from(hash.iv, 'hex'));
  let decrpyted = decipher.update(Buffer.from(hash.content, 'hex'));
  decrpyted = Buffer.concat([decrpyted, decipher.final()]);
  return decrpyted.toString();
};