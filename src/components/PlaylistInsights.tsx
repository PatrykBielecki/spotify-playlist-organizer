'use client';

import { useEffect, useState } from 'react';
import { useSpotify } from '@/hooks/useSpotify';

type Props = {
    playlistIds: string[];
};

export default function PlaylistInsights({ playlistIds }: Props) {
    const spotifyApi = useSpotify();

    const [loading, setLoading] = useState(true);
    const [totalTracks, setTotalTracks] = useState(0);
    const [averageDuration, setAverageDuration] = useState(0);
    const [artistCounts, setArtistCounts] = useState<Record<string, number>>({});
    const [topGenres, setTopGenres] = useState<Record<string, number>>({});

    useEffect(() => {
        const fetchAllTracks = async () => {
            let allTracks: SpotifyApi.TrackObjectFull[] = [];

            for (const id of playlistIds) {
                const data = await spotifyApi.getPlaylistTracks(id);
                const tracks = data.items.map((item) => item.track as SpotifyApi.TrackObjectFull);
                allTracks.push(...tracks);
            }

            // Duration
            const durations = allTracks.map((t) => t.duration_ms);
            const totalDuration = durations.reduce((a, b) => a + b, 0);
            const avg = allTracks.length ? Math.floor(totalDuration / allTracks.length) : 0;

            // Artist count
            const artistCount: Record<string, number> = {};
            const artistIdMap: Record<string, string> = {};
            for (const track of allTracks) {
                for (const artist of track.artists) {
                    artistCount[artist.name] = (artistCount[artist.name] || 0) + 1;
                    artistIdMap[artist.id] = artist.name;
                }
            }

            // Fetch genres
            const artistIds = Object.keys(artistIdMap).filter(Boolean);
            const genreCount: Record<string, number> = {};

            for (let i = 0; i < artistIds.length; i += 50) {
                const batch = artistIds.slice(i, i + 50);
                const response = await spotifyApi.getArtists(batch);
                for (const artist of response.artists) {
                    for (const genre of artist.genres) {
                        genreCount[genre] = (genreCount[genre] || 0) + 1;
                    }
                }
            }

            setTotalTracks(allTracks.length);
            setAverageDuration(avg);
            setArtistCounts(artistCount);
            setTopGenres(genreCount);
            setLoading(false);
        };

        fetchAllTracks();
    }, [playlistIds]);

    const formatDuration = (ms: number) => {
        const min = Math.floor(ms / 60000);
        const sec = Math.floor((ms % 60000) / 1000);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const topArtists = Object.entries(artistCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    if (loading) {
        return <p className="text-gray-400 mt-8">Loading insights...</p>;
    }

    return (
        <div className="mt-10 bg-zinc-900 p-6 rounded-lg shadow-md text-white">
            <h2 className="text-2xl font-semibold mb-6">📈 Playlist Insights</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* General Stats */}
                <div>
                    <h3 className="text-lg font-medium mb-2">📊 General</h3>
                    <ul className="space-y-1 text-gray-300 list-disc list-inside">
                        <li>Total playlists: {playlistIds.length}</li>
                        <li>Total tracks: {totalTracks}</li>
                        <li>Average duration: {formatDuration(averageDuration)}</li>
                    </ul>
                </div>

                {/* Top Artists */}
                <div>
                    <h3 className="text-lg font-medium mb-2">👤 Top Artists</h3>
                    <ul className="space-y-1 text-gray-300 list-disc list-inside">
                        {Object.entries(artistCounts)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 5)
                            .map(([name, count]) => (
                                <li key={name}>
                                    {name} ({count})
                                </li>
                            ))}
                    </ul>
                </div>

                {/* Top Genres */}
                <div>
                    <h3 className="text-lg font-medium mb-2">🎼 Top Genres</h3>
                    <ul className="space-y-1 text-gray-300 list-disc list-inside">
                        {Object.entries(topGenres)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 5)
                            .map(([genre, count]) => (
                                <li key={genre}>
                                    {genre} ({count})
                                </li>
                            ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
