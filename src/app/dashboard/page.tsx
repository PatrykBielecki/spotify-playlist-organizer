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
    const [removing, setRemoving] = useState(false);
    const [selectedPlaylists, setSelectedPlaylists] = useState<Set<string>>(new Set());
    const [merging, setMerging] = useState(false);

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

    const removeDuplicates = async (playlistId: string) => {
        const tracks = playlistTracks[playlistId];
        if (!tracks) return;

        const seen = new Set<string>();
        const duplicates: SpotifyApi.TrackObjectFull[] = [];

        tracks.forEach((track) => {
            if (seen.has(track.id)) {
                duplicates.push(track);
            } else {
                seen.add(track.id);
            }
        });

        if (duplicates.length === 0) {
            alert('No duplicates found!');
            return;
        }

        setRemoving(true);

        try {
            const urisToRemove = duplicates.map((track) => ({ uri: track.uri }));
            await spotifyApi.removeTracksFromPlaylist(playlistId, urisToRemove);

            const updated = await spotifyApi.getPlaylistTracks(playlistId);
            setPlaylistTracks((prev) => ({
                ...prev,
                [playlistId]: updated.items.map((item) => item.track as SpotifyApi.TrackObjectFull),
            }));

            alert(`Removed ${duplicates.length} duplicate track(s).`);
        } catch (err) {
            console.error('Error removing duplicates:', err);
            alert('Failed to remove duplicates.');
        } finally {
            setRemoving(false);
        }
    };

    const toggleSelectPlaylist = (id: string) => {
        const newSet = new Set(selectedPlaylists);
        newSet.has(id) ? newSet.delete(id) : newSet.add(id);
        setSelectedPlaylists(newSet);
    };

    const mergeSelectedPlaylists = async () => {
        if (selectedPlaylists.size < 2) {
            alert('Select at least 2 playlists to merge.');
            return;
        }

        setMerging(true);
        try {
            const allTracks: SpotifyApi.TrackObjectFull[] = [];

            for (const playlistId of selectedPlaylists) {
                const data = await spotifyApi.getPlaylistTracks(playlistId);
                const tracks = data.items.map((item) => item.track as SpotifyApi.TrackObjectFull);
                allTracks.push(...tracks);
            }

            // Deduplicate by ID
            const uniqueTracksMap = new Map<string, SpotifyApi.TrackObjectFull>();
            for (const track of allTracks) {
                if (!uniqueTracksMap.has(track.id)) {
                    uniqueTracksMap.set(track.id, track);
                }
            }

            const uniqueTracks = Array.from(uniqueTracksMap.values());

            const name = `Merged Playlist (${new Date().toLocaleDateString()})`;
            const newPlaylist = await spotifyApi.createPlaylist(user?.display_name ?? 'Me', {
                name,
                description: 'Created by Spotify Playlist Organizer',
                public: false,
            });

            const uris = uniqueTracks.map((track) => track.uri);
            for (let i = 0; i < uris.length; i += 100) {
                await spotifyApi.addTracksToPlaylist(newPlaylist.id, uris.slice(i, i + 100));
            }

            alert(`Merged ${selectedPlaylists.size} playlists into "${name}"`);
            setSelectedPlaylists(new Set());
        } catch (err) {
            console.error('Merge error:', err);
            alert('Failed to merge playlists.');
        } finally {
            setMerging(false);
        }
    };

    return (
        <main className="p-8">
            <h1 className="text-3xl font-bold">🎧 Dashboard</h1>

            {user && <p className="mt-4 text-lg">Welcome, {user.display_name}!</p>}

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

            {selectedPlaylists.size > 0 && (
                <div className="mt-4">
                    <button
                        onClick={mergeSelectedPlaylists}
                        disabled={merging}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                    >
                        {merging ? 'Merging...' : `Merge Selected (${selectedPlaylists.size})`}
                    </button>
                </div>
            )}

            <section className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredPlaylists.length === 0 ? (
                    <p className="text-gray-400">No playlists found.</p>
                ) : (
                    filteredPlaylists.map((playlist) => (
                        <div
                            key={playlist.id}
                            onClick={() => handlePlaylistClick(playlist.id)}
                            className="bg-zinc-800 p-4 rounded shadow hover:bg-zinc-700 cursor-pointer transition relative"
                        >
                            <input
                                type="checkbox"
                                checked={selectedPlaylists.has(playlist.id)}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    toggleSelectPlaylist(playlist.id);
                                }}
                                className="absolute top-2 left-2 w-4 h-4"
                            />

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
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeDuplicates(playlist.id);
                                        }}
                                        disabled={removing}
                                        className="mb-4 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                                    >
                                        {removing ? 'Removing...' : '🧹 Remove Duplicates'}
                                    </button>

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
