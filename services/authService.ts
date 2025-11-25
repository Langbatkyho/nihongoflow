import { User } from '../types';

interface AuthResponse {
  user: User;
  apiKey: string;
  error?: string;
}

// Helper để xử lý response từ server
const handleResponse = async (res: Response) => {
  const contentType = res.headers.get("content-type");
  
  // Trường hợp 1: Server trả về JSON
  if (contentType && contentType.includes("application/json")) {
    const data = await res.json();
    if (!res.ok) {
      // Ném lỗi với message từ server
      throw new Error(data.error || 'Đã có lỗi xảy ra từ máy chủ');
    }
    return data;
  } 
  
  // Trường hợp 2: Server trả về HTML/Text (Lỗi Crash 500, Timeout, v.v.)
  else {
    const text = await res.text();
    console.error("Server Error (Non-JSON):", text);
    
    if (res.status === 500) {
      throw new Error("Lỗi kết nối Server (500). Hãy kiểm tra biến môi trường SUPABASE_URL/KEY trên Vercel.");
    }
    
    throw new Error(`Lỗi kết nối (${res.status}). Vui lòng thử lại sau.`);
  }
};

export const AuthService = {
  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await handleResponse(res);
      
      // Lưu user session
      localStorage.setItem('nihongo_user', JSON.stringify(data.user));
      return data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  async register(username: string, password: string, apiKey: string): Promise<AuthResponse> {
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, apiKey }),
      });
      
      const data = await handleResponse(res);

      localStorage.setItem('nihongo_user', JSON.stringify(data.user));
      return data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  getCurrentUser(): User | null {
    const u = localStorage.getItem('nihongo_user');
    return u ? JSON.parse(u) : null;
  },

  logout() {
    localStorage.removeItem('nihongo_user');
    localStorage.removeItem('gemini_api_key');
  }
};