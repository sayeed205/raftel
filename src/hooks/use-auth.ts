import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store.ts';

export default function useAuthCheck() {
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Only check auth if we think we might be authenticated
    // This prevents unnecessary API calls on fresh sessions
    const savedUsername = localStorage.getItem('qbittorrent-auth');
    if (savedUsername) {
      checkAuth();
    }
  }, [checkAuth]);

  return { isAuthenticated };
}
