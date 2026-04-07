# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev     # Start dev server at localhost:3000
npm run build   # Production build
npm run lint    # ESLint check
```

## Architecture

### Routes
- `/` — Public landing page (marketing, pricing, downloads) — large `'use client'` component in `app/page.tsx`
- `/app` — Protected web app entry point — `app/app/page.tsx` gates on login state
- `/cgu`, `/confidentialite`, `/support`, `/supprimer-compte` — Legal/static pages

### Web App Structure

```
app/app/page.tsx          → useUserData() → LoginScreen | AppShell
AppShell.tsx              → renders active tab + Sidebar (desktop) or BottomTabs (mobile)
tabs/VoiceTab.tsx         → Gemini Live voice UI, transcript, credits/quota gating
tabs/SubscriptionTab.tsx  → Gumroad plans, voice quota progress bar
tabs/SettingsTab.tsx      → Language, web search toggle (Pro-gated), MCP
tabs/ProfileTab.tsx       → User info, memory summary
tabs/ReferralTab.tsx      → Referral code share
```

### Gemini Live WebSocket (`hooks/useGeminiLive.ts`)
- Connects directly to `wss://generativelanguage.googleapis.com` (BidiGenerateContent protocol)
- Audio: browser mic → 16kHz PCM → WebSocket; 24kHz PCM received → Web Audio API playback
- Session state: `'idle' | 'connecting' | 'connected' | 'error'`
- API key exposed client-side via `NEXT_PUBLIC_GEMINI_API_KEY` (by design)

### Authentication & Session (`hooks/useUserData.ts`)
- Login: email/PIN or Telegram ID + PIN → Supabase REST → stored in `localStorage` as `ava_web_session`
- Permissions resolved from `ava_users.subscription_source === 'gumroad'` && `subscription_expires_at > now()`
- Voice quota reset applied client-side on mount: if `voice_quota_reset_at` is past → reset `voice_minutes_used` to 0 and persist to Supabase

### Key Constants (`components/app/constants.ts`)
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` — direct REST calls, no backend proxy
- `GEMINI_MODEL` — active model string
- `GUMROAD_URL` / `GUMROAD_QUARTERLY_URL` / `GUMROAD_BIANNUAL_URL` — product URLs for `avam1`
- `VOICE_QUOTA_FREE_MINUTES = 3`, `VOICE_QUOTA_PRO_MINUTES = 250`
- `SYSTEM_INSTRUCTION(language, webSearch, memorySummary?, userName?)` — builds full Ava persona prompt

### Types (`components/app/types.ts`)
- `UserData` — Supabase user row shape + `memorySummary?`
- `AvaPermissions { webSearch, imageUpload, unlimited }` — derived from subscription
- `AppTab` — tab identifiers
- Helpers: `isPro(user)`, `voiceQuotaMinutes(user)`, `voiceMinutesUsed(user)`, `voiceMinutesRemaining(user)`

### Monetization
- **Gumroad** overlay checkout: `data-gumroad-overlay-checkout="true"` on `<a>` tags. Gumroad script injected in `app/layout.tsx`.
- Pro detection: `subscription_source === 'gumroad'` && expiry in future
- Free users: 3 min voice/month, no web search, no image upload
- Pro users: 250 min voice/month, all features, credits not deducted

### Supabase (no Edge Functions from web)
- All calls are direct REST to `bmcvyvyjqxehwmkddtya.supabase.co` using anon key
- Tables: `ava_users` (auth + session data), `ava_user_memory` (memory summaries)
- Voice quota columns: `voice_minutes_used FLOAT`, `voice_quota_reset_at TIMESTAMPTZ`

### Styling
- Tailwind CSS v4, dark theme only (`#020617` background, rose-500 accent)
- Framer Motion for all animations; `FadeUp` pattern with `useInView` on landing page
- `cn()` from `lib/utils.ts` (clsx + tailwind-merge)
- Lucide React for icons — do not import other icon libraries in app components
