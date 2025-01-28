import { create } from 'zustand';

type UserStore = {
    token: string | null;
    setToken: (token: string) => void;
    clearToken: () => void;
};

export const useUserStore = create<UserStore>((set) => ({
    token: null,
    setToken: (token) => set({ token }),
    clearToken: () => set({ token: null }),
}));
