import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './lib/db';
import { decrypt } from './lib/encryption';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    // 1. Tìm user
    const { data: user, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Sai tên đăng nhập hoặc mật khẩu' });
    }

    // 2. Kiểm tra password
    if (user.password !== password) {
      return res.status(401).json({ error: 'Sai tên đăng nhập hoặc mật khẩu' });
    }

    // 3. Giải mã API Key
    let decryptedKey = '';
    try {
      decryptedKey = decrypt({ content: user.encrypted_api_key, iv: user.iv });
    } catch (e) {
      console.error("Decrypt Error", e);
      return res.status(500).json({ error: 'Không thể giải mã API Key' });
    }

    return res.status(200).json({
      user: { id: user.id, username: user.username },
      apiKey: decryptedKey
    });

  } catch (err: any) {
    console.error("Login Error:", err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}