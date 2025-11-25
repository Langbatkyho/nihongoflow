import { createClient } from '@supabase/supabase-js';

// Các biến môi trường này cần được cấu hình trong Vercel Project Settings
// QUAN TRỌNG: Sử dụng giá trị placeholder để tránh crash ứng dụng ngay khi khởi động nếu thiếu biến môi trường.
// Lỗi thực sự sẽ được bắt khi thực hiện truy vấn trong API handler.
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'placeholder-key';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.warn("⚠️ Cảnh báo: Thiếu biến môi trường SUPABASE_URL hoặc SUPABASE_SERVICE_KEY. API sẽ không hoạt động chính xác.");
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);