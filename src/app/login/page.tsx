'use client';

import { useEffect } from 'react';

export default function LoginPage() {
    const handleLogin = () => {
        const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;
        const redirectUri = process.env.NEXT_PUBLIC_BASE_URL + '/auth/callback';
        const scopes = [
            'user-read-private',
            'user-read-email',
            'playlist-read-private',
            'playlist-modify-public',
            'playlist-modify-private',
        ].join(' ');

        const loginUrl = `https://accounts.spotify.com/authorize?response_type=token&client_id=${clientId}&scope=${encodeURIComponent(
            scopes
        )}&redirect_uri=${encodeURIComponent(redirectUri)}&show_dialog=true`;

        window.location.href = loginUrl;
    };

    return (
        <div className="flex h-screen items-center justify-center">
            <button
                onClick={handleLogin}
                className="bg-green-500 text-white px-6 py-3 rounded shadow hover:bg-green-600 transition"
            >
                Login with Spotify
            </button>
        </div>
    );
}
