'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/store/userStore';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallback() {
    const setToken = useUserStore((state) => state.setToken);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const code = searchParams.get('code');
        const verifier = localStorage.getItem('spotify_code_verifier');

        if (!code || !verifier) {
            router.push('/login');
            return;
        }

        const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;
        const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`;

        const body = new URLSearchParams({
            client_id: clientId,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri,
            code_verifier: verifier,
        });

        fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body,
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.access_token) {
                    setToken(data.access_token);
                    localStorage.setItem('spotify_access_token', data.access_token);
                    router.push('/dashboard');
                } else {
                    console.error('Token exchange failed:', data);
                    router.push('/login');
                }
            });
    }, []);

    return (
        <div className="h-screen flex items-center justify-center">
            <p className="text-white">Processing login...</p>
        </div>
    );
}
