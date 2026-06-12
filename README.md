# Sanity Country Personalization Demo

Next.js 15 App Router demo that pulls homepage content from Sanity and resolves country-specific copy using Vercel geolocation.

## Features

- Sanity schema: `Page`
- `countryContent` array with `countryCode`, `heading`, and `description`
- `/api/country` endpoint backed by the Vercel `x-vercel-ip-country` header
- Default fallback content when no country-specific entry matches
- Tailwind CSS UI
- Sanity Studio mounted at `/studio`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file and fill in your Sanity project details:

```bash
cp .env.example .env.local
```

3. Start the app:

```bash
npm run dev
```

4. Open:

- App: `http://localhost:3000`
- Studio: `http://localhost:3000/studio`

## Required Sanity document

Create one `Page` document in Sanity with:

- `title`: `Homepage`
- `slug`: `home`
- `defaultHeading`
- `defaultDescription`
- `countryContent` items for `IN`, `US`, `GB`, and `AU` as needed

## Country detection flow

1. The homepage fetches the `Page` document from Sanity.
2. The page reads the visitor country from the Vercel `x-vercel-ip-country` request header.
3. If the app is not running behind Vercel geolocation headers, it reads `process.env.MOCK_COUNTRY`.
4. If that is missing or unsupported, it falls back to `IN`.

## Local development

Vercel geolocation headers are not available on localhost, so use `MOCK_COUNTRY` in `.env.local` for local testing.

## Deployment

When deployed on Vercel, the homepage will use the visitor IP geolocation header automatically and show the matching `countryContent` item when one exists.
