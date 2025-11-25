
import { User } from '../types';

interface AuthResponse {
  user: User;
  apiKey: string;
  error?: string;
}

export const AuthService = {
  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      // Lưu thông tin phiên làm việc vào localStorage (trừ API Key nếu muốn bảo mật cao hơn, 
      // nhưng app hiện tại cần Key ở client để gọi Gemini)
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

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
    localStorage.removeItem('gemini_api_key'); // Xóa key cached
  }
};
