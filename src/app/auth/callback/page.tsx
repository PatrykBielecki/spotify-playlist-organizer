'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';

export default function AuthCallback() {
    const router = useRouter();
    const setToken = useUserStore((state) => state.setToken);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hash = window.location.hash;
            const params = new URLSearchParams(hash.replace('#', ''));
            const accessToken = params.get('access_token');

            if (accessToken) {
                setToken(accessToken);
                localStorage.setItem('spotify_access_token', accessToken);
                router.push('/dashboard');
            } else {
                router.push('/login');
            }
        }
    }, []);

    return (
        <div className="h-screen flex items-center justify-center">
            <p className="text-white">Processing login...</p>
        </div>
    );
}
