# ListingKit

AI-powered marketing kit generator for real estate agents. Enter property details once, get five marketing outputs in under 15 seconds.

## What You Get

1. **MLS Listing Description** — Fair Housing compliant, with character/word count
2. **Social Media Posts** — Instagram, Facebook, and LinkedIn, ready to copy-paste
3. **Email Blast** — Subject line + body for your buyer list
4. **Open House Flyer** — Downloadable as PDF
5. **Video Script** — 60-second walkthrough with visual cues

## How It Works

- **BYOK (Bring Your Own Key)** — uses your OpenAI or Anthropic API key
- **No backend** — 100% static site, your key stays in your browser
- **Free to host** — deploys on Vercel/Netlify at $0/month

## Quick Start

```bash
git clone https://github.com/Rconman99/listingkit.git
cd listingkit
npm install
npm run dev
```

Open `http://localhost:5173`, add your API key in Settings, and generate your first listing.

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand (state management)
- jsPDF (flyer export)
- Direct API calls to OpenAI / Anthropic (no SDKs)

## Fair Housing Compliance

All AI outputs are governed by a system prompt that enforces Fair Housing Act guidelines — no discriminatory language, no demographic descriptions, no ability-assuming phrases.

## License

MIT
