import { create } from 'zustand';

const load = () => {
  const raw = localStorage.getItem('anomaly-auth');
  return raw ? JSON.parse(raw) : { token: null, user: null };
};

export const useAuthStore = create((set) => ({
  ...load(),
  setAuth: ({ token, user }) => {
    localStorage.setItem('anomaly-auth', JSON.stringify({ token, user }));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('anomaly-auth');
    set({ token: null, user: null });
  }
}));
