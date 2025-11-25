import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

// --- CONFIGURATION & UTILS (Self-contained) ---

// 1. Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const encryptionSecret = process.env.ENCRYPTION_SECRET || 'default-secret-must-be-changed';

const getSupabase = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY");
  }
  return createClient(supabaseUrl, supabaseServiceKey);
};

// 2. Decryption Setup
const ALGORITHM = 'aes-256-cbc';
const getKey = () => crypto.createHash('sha256').update(String(encryptionSecret)).digest();

const decryptApiKey = (hash: { content: string, iv: string }) => {
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(hash.iv, 'hex'));
  let decrpyted = decipher.update(Buffer.from(hash.content, 'hex'));
  decrpyted = Buffer.concat([decrpyted, decipher.final()]);
  return decrpyted.toString();
};

// --- HANDLER ---

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;
    const supabase = getSupabase();

    // 1. Find User
    const { data: user, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Sai tên đăng nhập hoặc mật khẩu' });
    }

    // 2. Check Password
    if (user.password !== password) {
      return res.status(401).json({ error: 'Sai tên đăng nhập hoặc mật khẩu' });
    }

    // 3. Decrypt Key
    let decryptedKey = '';
    try {
      decryptedKey = decryptApiKey({ content: user.encrypted_api_key, iv: user.iv });
    } catch (e) {
      console.error("Decryption Failed:", e);
      return res.status(500).json({ error: 'Không thể giải mã API Key. Kiểm tra ENCRYPTION_SECRET.' });
    }

    return res.status(200).json({
      user: { id: user.id, username: user.username },
      apiKey: decryptedKey
    });

  } catch (err: any) {
    console.error("Login API Error:", err);
    return res.status(500).json({ 
      error: err.message || 'Lỗi Server nội bộ'
    });
  }
}