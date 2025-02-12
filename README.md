# 🎧 Spotify Playlist Organizer

An web app for organizing and managing your Spotify playlists — built with Next.js, Tailwind CSS, and the Spotify Web API.

---

## ✨ Features

- 🔐 Spotify OAuth login (PKCE flow)
- 🎵 View and search all your playlists
- 🔀 Sort playlists by name (A–Z / Z–A)
- 📦 Merge multiple playlists into one
- 🧹 Remove duplicate tracks from playlists
- 📊 Dashboard insights:
    - Total playlists & tracks
    - Top artists
    - Top genres
    - Average track duration
- 💾 Preferences (sort, search) saved to `localStorage`
- 📱 Mobile responsive layout

---

## 🚀 Demo

> _[In future](https://your-deployment-url.com)_

---

## 🧪 Tech Stack

- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Zustand** (state management)
- **Spotify Web API**

---

## 🔧 Local Development

1. Clone the repo:
```bash
git clone https://github.com/your-username/spotify-playlist-organizer.git
cd spotify-playlist-organizer
```


2. Install dependencies:
```bash
npm install
```

3. Create .env.local and set the following:
```bash
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. Run the dev server:
```bash
npm run dev
```

## 📜 Spotify API Setup

Create a Spotify Developer App: https://developer.spotify.com/dashboard

Redirect URI:
http://localhost:3000/auth/callback
(also set this in your .env.local)
