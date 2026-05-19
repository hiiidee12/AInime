# AInime - AI Anime Companion

Your all-in-one AI-powered anime platform. Ask anything about anime, explore characters, track your watchlist, test your knowledge, and stay updated with the latest anime.

## Live

**https://ainime-topaz.vercel.app**

## Features

### Ask AI
Ask anything about anime powered by **MiMo V2.5** (Xiaomi LLM). The AI fetches **real-time data** from MyAnimeList (Jikan API) before answering, so it always has up-to-date information about:
- Current seasonal anime
- Upcoming anime next season
- Top airing anime right now
- Search results for any anime title

Quick prompts available: Recommendations, Power Systems, Beginner Guide, Top 10.

### Anime Character Explorer
Search thousands of anime characters from MyAnimeList. View detailed info including name, anime, and character description.

### Seasonal Anime
Browse anime by season (Spring/Summer/Fall/Winter) from 2024 to 2026. Shows title, score, type, and episode count.

### Anime Quiz
Test your anime knowledge with trivia questions across 6 categories:
- General Anime
- Naruto
- One Piece
- Attack on Titan
- Genshin Impact
- Studio Ghibli

5 questions per quiz with score tracking.

### Anime Quotes
Get inspired by iconic quotes from anime characters like Luffy, Itachi, Gojo, Levi, Edward Elric, and more.

### Watchlist Tracker
Track your anime watchlist with status filters:
- Watching
- Completed
- Plan to Watch

Search anime from MyAnimeList, add to watchlist, change status, and persist data in localStorage.

### Anime News
Stay updated with the latest anime promos and news from MyAnimeList.

## Tech Stack

- **HTML / CSS / JavaScript** (zero dependencies, no frameworks)
- **Jikan API** (MyAnimeList unofficial API, no key required)
- **MiMo V2.5** (Xiaomi LLM via OpenAI-compatible API)
- **localStorage** for watchlist persistence

## Project Structure

```
AInime/
  index.html    # Main HTML with all sections
  style.css     # Dark neon theme with responsive design
  app.js        # All JavaScript logic (AI, quiz, watchlist, etc.)
  logo.svg      # AInime logo (neural network icon + text)
  README.md
```

## Setup

1. Clone the repo
2. Open `index.html` in your browser
3. Done! AI is pre-configured with MiMo V2.5

No API keys needed for Jikan API. AI backend is pre-configured.

## Features Summary

| Feature | Data Source | AI Powered |
|---------|-----------|------------|
| Ask AI | Jikan API (real-time) + MiMo V2.5 | Yes |
| Character Explorer | Jikan API | No |
| Seasonal Anime | Jikan API | No |
| Anime Quiz | Local question banks | No |
| Anime Quotes | Local quote database | No |
| Watchlist | Jikan API + localStorage | No |
| Anime News | Jikan API | No |

## License

MIT
