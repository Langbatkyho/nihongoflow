import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './lib/db';
import { encrypt } from './lib/encryption';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password, apiKey } = req.body;

    if (!username || !password || !apiKey) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin: username, password, apiKey' });
    }

    // 1. Kiểm tra user tồn tại
    const { data: existing } = await supabase
      .from('app_users')
      .select('id')
      .eq('username', username)
      .single();

    if (existing) {
      return res.status(409).json({ error: 'Tên đăng nhập đã tồn tại' });
    }

    // 2. Mã hóa API Key
    const { content, iv } = encrypt(apiKey);

    // 3. Tạo user mới
    const { data, error } = await supabase
      .from('app_users')
      .insert([
        { 
          username, 
          password, // Lưu ý: Trong production nên hash password (bcrypt/argon2)
          encrypted_api_key: content,
          iv: iv
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // 4. Trả về thông tin
    return res.status(200).json({ 
      user: { id: data.id, username: data.username },
      apiKey: apiKey 
    });

  } catch (err: any) {
    console.error("Register Error:", err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}