'use client';

import { useUserStore } from '@/store/userStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
    const token = useUserStore((state) => state.token);
    const router = useRouter();

    useEffect(() => {
        if (!token) {
            const stored = localStorage.getItem('spotify_access_token');
            if (stored) {
                useUserStore.getState().setToken(stored);
            } else {
                router.push('/login');
            }
        }
    }, [token]);

    return (
        <main className="p-8">
            <h1 className="text-3xl font-bold">🎧 Dashboard</h1>
            <p className="mt-4 text-lg">Welcome! You're logged in.</p>
        </main>
    );
}
