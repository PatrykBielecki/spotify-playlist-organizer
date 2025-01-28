import { useUserStore } from '@/store/userStore';
import SpotifyWebApi from 'spotify-web-api-js';

export const useSpotify = () => {
    const token = useUserStore((state) => state.token);
    const spotifyApi = new SpotifyWebApi();

    if (token) spotifyApi.setAccessToken(token);

    return spotifyApi;
};
