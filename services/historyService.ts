
import { StudyLog, ModuleType } from '../types';
import { AuthService } from './authService';

export const HistoryService = {
  async getLogs(): Promise<StudyLog[]> {
    const user = AuthService.getCurrentUser();
    if (!user) return [];

    try {
      const res = await fetch(`/api/history?userId=${user.id}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data;
    } catch (e) {
      console.error("Fetch logs failed", e);
      return [];
    }
  },

  async addLog(moduleType: ModuleType, durationSec: number, score: number) {
    const user = AuthService.getCurrentUser();
    if (!user) return; // Không lưu nếu chưa đăng nhập

    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          module_type: moduleType,
          duration_sec: Math.round(durationSec),
          accuracy_score: Math.round(score)
        })
      });
    } catch (e) {
      console.error("Save log failed", e);
    }
  }
};
