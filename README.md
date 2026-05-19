# AInime — AI Anime Companion

Your all-in-one AI-powered anime platform! Chat with characters, get recommendations, test your knowledge, track your watchlist, and explore the anime universe.

## Features

-  **AI Character Chat** — Talk to 10 anime characters (Gojo, Zero Two, Levi, Makima, Furina, Eren, Killua, Rem, Luffy, Nezuko) powered by any OpenAI-compatible LLM
-  **Smart Recommender** — Describe your mood and get personalized anime suggestions
-  **Character Explorer** — Search thousands of anime characters from MyAnimeList
-  **Seasonal Calendar** — Browse anime by season (Spring/Summer/Fall/Winter)
-  **Anime Quiz** — Test your knowledge across 6 categories (General, Naruto, One Piece, AoT, Genshin, Studio Ghibli)
-  **Anime Quotes** — Get inspired by iconic anime quotes
-  **Watchlist Tracker** — Track anime with status (Watching, Completed, Plan to Watch, Dropped)
-  **Anime News** — Stay updated with latest anime promos
-  **Dark Neon Aesthetic** — Beautiful UI with particle effects and smooth animations
-  **Bring Your Own API** — Works with OpenAI, OpenRouter, Together AI, Ollama, vLLM, etc.
-  **Mobile Responsive** — Works on all devices

## Tech Stack

- HTML / CSS / Vanilla JavaScript (zero dependencies)
- Jikan API (MyAnimeList unofficial API, no key needed)
- OpenAI-compatible API for AI features
- localStorage for watchlist & API config persistence

## Setup

1. Clone the repo
2. Open `index.html` in your browser
3. Go to **AI Chat** tab
4. Enter your API settings:
   - **API URL**: e.g. `https://api.openai.com/v1` or your custom endpoint
   - **API Key**: Your API key
   - **Model**: Choose or use custom

## Supported APIs

Any OpenAI-compatible API works:
- OpenAI (GPT-4o, GPT-4o Mini)
- OpenRouter
- Together AI
- DeepSeek
- Local LLMs (Ollama, LM Studio, vLLM)
- Custom endpoints

## License

MIT
