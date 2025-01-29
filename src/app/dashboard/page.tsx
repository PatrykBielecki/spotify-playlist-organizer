'use client';

import { useUserStore } from '@/store/userStore';
import { useSpotify } from '@/hooks/useSpotify';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
    const token = useUserStore((state) => state.token);
    const router = useRouter();
    const spotifyApi = useSpotify();
    const [user, setUser] = useState<{ display_name?: string } | null>(null);

    useEffect(() => {
        if (!token) {
            const stored = localStorage.getItem('spotify_access_token');
            if (stored) {
                useUserStore.getState().setToken(stored);
            } else {
                router.push('/login');
            }
        }

        if (token) {
            spotifyApi.getMe().then((data) => setUser(data));
        }
    }, [token]);

    return (
        <main className="p-8">
            <h1 className="text-3xl font-bold">🎧 Dashboard</h1>

            {user ? (
                <p className="mt-4 text-lg">Welcome, {user.display_name}!</p>
            ) : (
                <p className="mt-4 text-gray-400">Loading user...</p>
            )}

            <button
                onClick={() => {
                    localStorage.removeItem('spotify_access_token');
                    useUserStore.getState().clearToken();
                    router.push('/login');
                }}
                className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
                Logout
            </button>
        </main>
    );
}
