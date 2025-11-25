import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // GET: Lấy lịch sử
    if (req.method === 'GET') {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      const { data, error } = await supabase
        .from('study_logs')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return res.status(200).json(data);
    }

    // POST: Ghi log mới
    if (req.method === 'POST') {
      const { user_id, module_type, duration_sec, accuracy_score } = req.body;

      if (!user_id || !module_type) {
         return res.status(400).json({ error: 'Missing required fields' });
      }

      const { error } = await supabase
        .from('study_logs')
        .insert([{ 
          user_id, 
          module_type, 
          duration_sec, 
          accuracy_score 
        }]);

      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err: any) {
    console.error("History API Error:", err);
    return res.status(500).json({ error: err.message });
  }
}