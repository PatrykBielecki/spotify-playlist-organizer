'use client';

import { useUserStore } from '@/store/userStore';
import { useSpotify } from '@/hooks/useSpotify';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Playlist = {
    id: string;
    name: string;
    images: { url: string }[];
    tracks: { total: number };
};

export default function DashboardPage() {
    const token = useUserStore((state) => state.token);
    const router = useRouter();
    const spotifyApi = useSpotify();

    const [user, setUser] = useState<{ display_name?: string } | null>(null);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [filteredPlaylists, setFilteredPlaylists] = useState<Playlist[]>([]);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [playlistTracks, setPlaylistTracks] = useState<Record<string, SpotifyApi.TrackObjectFull[]>>({});

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
                const sorted = [...data.items].sort((a, b) => {
                    return sortOrder === 'asc'
                        ? a.name.localeCompare(b.name)
                        : b.name.localeCompare(a.name);
                });
                setPlaylists(sorted);
            });
        }
    }, [token, sortOrder]);

    useEffect(() => {
        const filtered = playlists.filter((playlist) =>
            playlist.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredPlaylists(filtered);
    }, [playlists, searchQuery]);

    const handleLogout = () => {
        localStorage.removeItem('spotify_access_token');
        useUserStore.getState().clearToken();
        router.push('/login');
    };

    const toggleSortOrder = () => {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    };

    const handlePlaylistClick = async (playlistId: string) => {
        if (expandedId === playlistId) {
            setExpandedId(null);
            return;
        }

        setExpandedId(playlistId);

        if (!playlistTracks[playlistId]) {
            const data = await spotifyApi.getPlaylistTracks(playlistId);
            setPlaylistTracks((prev) => ({
                ...prev,
                [playlistId]: data.items.map((item) => item.track as SpotifyApi.TrackObjectFull),
            }));
        }
    };

    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <main className="p-8">
            <h1 className="text-3xl font-bold">🎧 Dashboard</h1>

            {user && (
                <p className="mt-4 text-lg">Welcome, {user.display_name}!</p>
            )}

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex gap-4">
                    <button
                        onClick={toggleSortOrder}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Sort: {sortOrder === 'asc' ? 'A → Z' : 'Z → A'}
                    </button>

                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Logout
                    </button>
                </div>

                <input
                    type="text"
                    placeholder="Search playlists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2 rounded bg-zinc-800 text-white border border-zinc-700 placeholder-gray-400"
                />
            </div>

            <section className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredPlaylists.length === 0 ? (
                    <p className="text-gray-400">No playlists found.</p>
                ) : (
                    filteredPlaylists.map((playlist) => (
                        <div
                            key={playlist.id}
                            onClick={() => handlePlaylistClick(playlist.id)}
                            className="bg-zinc-800 p-4 rounded shadow hover:bg-zinc-700 cursor-pointer transition"
                        >
                            {playlist.images?.[0] && (
                                <img
                                    src={playlist.images[0].url}
                                    alt={playlist.name}
                                    className="rounded mb-4"
                                />
                            )}
                            <h2 className="text-white font-semibold text-lg">
                                {playlist.name}
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">
                                {playlist.tracks.total} track{playlist.tracks.total !== 1 ? 's' : ''}
                            </p>

                            {expandedId === playlist.id && playlistTracks[playlist.id] && (
                                <div className="mt-4 space-y-2 max-h-64 overflow-y-auto border-t border-zinc-700 pt-2">
                                    {playlistTracks[playlist.id].map((track, index) => (
                                        <div key={`${track.id}-${index}`} className="text-sm text-gray-300">
                                            <p className="font-medium">{track.name}</p>
                                            <p className="text-xs text-gray-400">
                                                {track.artists.map((a) => a.name).join(', ')} • {track.album.name} • {formatDuration(track.duration_ms)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </section>
        </main>
    );
}
