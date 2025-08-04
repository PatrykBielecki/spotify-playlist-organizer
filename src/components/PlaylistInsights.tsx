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

    useEffect(() => {
        const fetchAllTracks = async () => {
            let allTracks: SpotifyApi.TrackObjectFull[] = [];

            for (const id of playlistIds) {
                const data = await spotifyApi.getPlaylistTracks(id);
                const tracks = data.items.map((item) => item.track as SpotifyApi.TrackObjectFull);
                allTracks.push(...tracks);
            }

            // Total + average duration
            const durations = allTracks.map((t) => t.duration_ms);
            const totalDuration = durations.reduce((a, b) => a + b, 0);
            const avg = allTracks.length ? Math.floor(totalDuration / allTracks.length) : 0;

            // Top artists
            const counts: Record<string, number> = {};
            for (const track of allTracks) {
                track.artists.forEach((artist) => {
                    counts[artist.name] = (counts[artist.name] || 0) + 1;
                });
            }

            setTotalTracks(allTracks.length);
            setAverageDuration(avg);
            setArtistCounts(counts);
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
            <h2 className="text-2xl font-semibold mb-4">📈 Playlist Insights</h2>

            <p>Total playlists: {playlistIds.length}</p>
            <p>Total tracks: {totalTracks}</p>
            <p>Average track duration: {formatDuration(averageDuration)}</p>

            <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Top Artists</h3>
                <ul className="list-disc list-inside text-gray-300">
                    {topArtists.map(([name, count]) => (
                        <li key={name}>
                            {name} ({count} track{count > 1 ? 's' : ''})
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
