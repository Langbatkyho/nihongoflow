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

// 2. Encryption Setup
const ALGORITHM = 'aes-256-cbc';
// Hash key to ensure it is exactly 32 bytes
const getKey = () => crypto.createHash('sha256').update(String(encryptionSecret)).digest();

const encryptApiKey = (text: string) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { 
    content: encrypted.toString('hex'), 
    iv: iv.toString('hex') 
  };
};

// --- HANDLER ---

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Support (Optional if frontend and backend on same domain, but good for safety)
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
    const { username, password, apiKey } = req.body;

    if (!username || !password || !apiKey) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
    }

    const supabase = getSupabase();

    // 1. Check existing user
    const { data: existing } = await supabase
      .from('app_users')
      .select('id')
      .eq('username', username)
      .single();

    if (existing) {
      return res.status(409).json({ error: 'Tên đăng nhập đã tồn tại' });
    }

    // 2. Encrypt Key
    const { content, iv } = encryptApiKey(apiKey);

    // 3. Create User
    const { data, error } = await supabase
      .from('app_users')
      .insert([
        { 
          username, 
          password, // Note: Password should be hashed in production
          encrypted_api_key: content,
          iv: iv
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase Write Error:", error);
      throw new Error("Lỗi khi tạo tài khoản database: " + error.message);
    }

    return res.status(200).json({ 
      user: { id: data.id, username: data.username },
      apiKey: apiKey 
    });

  } catch (err: any) {
    console.error("Register API Error:", err);
    return res.status(500).json({ 
      error: err.message || 'Lỗi Server nội bộ' 
    });
  }
}