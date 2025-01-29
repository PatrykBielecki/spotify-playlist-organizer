'use client';

import pkceChallenge from 'pkce-challenge';

export default function LoginPage() {
    const handleLogin = async () => {
        const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;
        const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`;
        const scopes = [
            'user-read-private',
            'user-read-email',
            'playlist-read-private',
            'playlist-modify-public',
            'playlist-modify-private',
        ].join(' ');

        const challenge = await pkceChallenge();
        const code_challenge = challenge.code_challenge;
        const code_verifier = challenge.code_verifier;

        localStorage.setItem('spotify_code_verifier', code_verifier);

        const loginUrl = `https://accounts.spotify.com/authorize?` +
            `response_type=code&` +
            `client_id=${clientId}&` +
            `scope=${encodeURIComponent(scopes)}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `code_challenge_method=S256&` +
            `code_challenge=${code_challenge}`;

        window.location.href = loginUrl;
    };

    return (
        <main className="h-screen flex items-center justify-center bg-zinc-900 text-white">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-6">🎧 Spotify Playlist Organizer</h1>
                <button
                    onClick={handleLogin}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md transition font-medium"
                >
                    Login with Spotify
                </button>
            </div>
        </main>
    );
}
