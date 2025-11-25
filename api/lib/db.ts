import { createClient } from '@supabase/supabase-js';

// Các biến môi trường này cần được cấu hình trong Vercel Project Settings
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("⚠️ Cảnh báo: Thiếu biến môi trường SUPABASE_URL hoặc SUPABASE_SERVICE_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);