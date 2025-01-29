'use client';

import { useUserStore } from '@/store/userStore';
import { useSpotify } from '@/hooks/useSpotify';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Playlist = {
    id: string;
    name: string;
    images: { url: string }[];
};

export default function DashboardPage() {
    const token = useUserStore((state) => state.token);
    const router = useRouter();
    const spotifyApi = useSpotify();

    const [user, setUser] = useState<{ display_name?: string } | null>(null);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);

    useEffect(() => {
        if (!token) {
            const stored = localStorage.getItem('spotify_access_token');
            if (stored) {
                useUserStore.getState().setToken(stored);
            } else {
                router.push('/login');
                return;
            }
        }

        if (token) {
            spotifyApi.getMe().then(setUser);
            spotifyApi.getUserPlaylists().then((data) => {
                setPlaylists(data.items);
            });
        }
    }, [token]);

    return (
        <main className="p-8">
            <h1 className="text-3xl font-bold">🎧 Dashboard</h1>

            {user && (
                <p className="mt-4 text-lg">Welcome, {user.display_name}!</p>
            )}

            <button
                onClick={() => {
                    localStorage.removeItem('spotify_access_token');
                    useUserStore.getState().clearToken();
                    router.push('/login');
                }}
                className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
                Logout
            </button>

            <section className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {playlists.length === 0 ? (
                    <p className="text-gray-400">Loading playlists...</p>
                ) : (
                    playlists.map((playlist) => (
                        <div
                            key={playlist.id}
                            className="bg-zinc-800 p-4 rounded shadow hover:bg-zinc-700 cursor-pointer transition"
                        >
                            {playlist.images?.[0] && (
                                <img
                                    src={playlist.images[0].url}
                                    alt={playlist.name}
                                    className="rounded mb-4"
                                />
                            )}
                            <h2 className="text-white font-semibold text-lg">{playlist.name}</h2>
                        </div>
                    ))
                )}
            </section>
        </main>
    );
}
