<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Lemurs AI — Master Autonomous Protocol & Operations Guide

> **CORE DIRECTIVE: ZERO REDUNDANT TASKS & ONE-SHOT AUTONOMOUS EXECUTION**
>
> 1. **Never repeat exploratory or repetitive tasks**: Do not search from scratch, re-ask questions that are already defined, or prompt the user repetitively for steps within an approved workflow.
> 2. **One-Permission Immediate Action**: When the user requests an upgrade, build, refactor, or feature, accept the command immediately and execute the end-to-end pipeline to completion smoothly without unnecessary back-and-forth friction.
> 3. **Smooth & Resilient Execution**: Always auto-verify changes (lint -> typecheck -> build). If an issue or vulnerability arises, fix it automatically and deliver clean results.

---

## 1. Project Technology Stack

| Component | Specification | Notes |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router + Turbopack) | Dynamic route params are Promises (`await params`). |
| **UI Library** | React 19 / React DOM 19 | Uses modern hooks; avoid deprecated lifecycle APIs. |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/postcss`) | Modern theme directives; `@import "tailwindcss";`. |
| **Icons** | Lucide React (`lucide-react`) | Standard UI iconography. |
| **Language** | TypeScript 5 (Strict Mode) | No implicit `any`; all props/state must be typed. |
| **Security** | Strict Content Security Policy (CSP) | Configured in `next.config.ts`. Whitelists Gemini & OpenRouter APIs. |
| **Deployment** | Netlify & Vercel compatible | Postbuild hook automatically syncs `.next` to `dist`. |

---

## 2. Standard Command Reference

Use these standard commands for all build and maintenance tasks:

```bash
# 1. Dev Server (Turbopack enabled)
npm run dev

# 2. Complete Upgrade & Build (Single Command)
npm run upgrade:build

# 3. Code Quality & Linting
npm run lint

# 4. TypeScript Typecheck
npm run typecheck

# 5. Production Build & Dist Sync
npm run build

# 6. Production Server Start
npm run start
```

---

## 3. Mandatory Recurring Workflow (Playbook)

Whenever an upgrade, build, or modification command is received, execute the following steps in sequence:

### Step 1: Upgrading Dependencies (When requested or needed)
```bash
npm update
npm audit fix --force # Only if vulnerabilities require major version bumps within safe compatibility
```
- Keep `next` and `eslint-config-next` synchronized on matching versions.
- Ensure `react` and `react-dom` remain on compatible releases (19.x).

### Step 2: Quality & Type Verification
```bash
npm run lint
npm run typecheck
```
- Must produce **0 errors** and **0 warnings**.
- If any TypeScript error or ESLint violation occurs, resolve it in the relevant file immediately.

### Step 3: Production Build Verification
```bash
npm run build
```
- Verifies full compilation, Turbopack bundling, static page generation, and API route dynamic compilation.
- Executes `postbuild` to mirror `.next` to `dist/`.

---

## 4. Architecture & Code Conventions

### Project Layout
- `src/app/page.tsx`: Core AI chat interface, state machine, message history, settings modal, model picker.
- `src/app/layout.tsx`: Root layout with font configuration, global metadata, theme wrappers.
- `src/app/api/chat/route.ts`: Streaming and standard AI chat completion endpoint (Gemini / OpenRouter).
- `src/components/`:
  - `ChatMessage.tsx`: Markdown rendering, syntax highlighter, copy code, edit resubmission.
  - `Sidebar.tsx`: Chat history management, search, language switcher, theme toggle.
  - `Toast.tsx`: Non-blocking, smooth toast notification system.
  - `ConfirmDialog.tsx`: Modal-based confirmation (replaces native `window.confirm`).
  - `LemurLogo.tsx`: SVG brand icon with squircle container and aurora gradient.
- `src/utils/`:
  - `translations.ts`: Multi-language dictionary and localized UI text strings.
  - `confetti.ts`: Interactive visual effects.
  - `highlighter.ts`: Code syntax styling utilities.

### Design Standards
- **Theme**: Premium dark aesthetic (`#0b0f19` background), aurora neon accents (cyan/purple/emerald gradients).
- **Glassmorphism**: Subtle borders (`border-white/10`), frosted glass backdrops (`backdrop-blur-md`).
- **User Alerts**: NEVER use native `alert()`, `confirm()`, or `prompt()`. Always use `Toast` or `ConfirmDialog`.
- **API Resilience**: Graceful error handling for missing API keys, rate limits, and network dropouts.

---

## 5. Security & CSP Rules
- Any new remote service, model endpoint, or CDN added to the project must be registered in the CSP header in `next.config.ts` under `connect-src` or `img-src`.
- Current allowed connections:
  - `https://generativelanguage.googleapis.com`
  - `https://openrouter.ai`
  - `https://*.profitableratecpmnetwork.com` (CPM ad network)
