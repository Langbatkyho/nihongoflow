-- 1. Bật extension để hỗ trợ tạo UUID tự động
create extension if not exists "uuid-ossp";

-- 2. Tạo bảng Users (Lưu thông tin người dùng và API Key đã mã hóa)
create table if not exists public.app_users (
  id uuid default uuid_generate_v4() primary key,
  username text not null unique,
  password text not null,
  encrypted_api_key text not null,
  iv text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tạo bảng Study Logs (Lưu lịch sử học tập)
create table if not exists public.study_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.app_users(id) on delete cascade not null,
  module_type text not null,
  duration_sec integer not null default 0,
  accuracy_score integer not null default 0,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tạo Index để truy vấn nhanh hơn theo user_id
create index if not exists idx_study_logs_user_id on public.study_logs(user_id);