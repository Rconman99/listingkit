# ListingKit — AI Marketing Kit for Real Estate Agents

## Product Overview
A web app where a real estate agent inputs property details and gets back a COMPLETE marketing kit:
1. MLS listing description (Fair Housing compliant)
2. 3 social media posts (Instagram, Facebook, LinkedIn)
3. Email blast to buyer list
4. Open house flyer text
5. Video script for walkthrough / Reels

Agent enters info ONCE, gets ALL five outputs in under 15 seconds.

## CRITICAL RULES FOR AUTONOMOUS BUILD
- NEVER ask questions. Make the best decision and move on.
- NEVER stop to request confirmation. Execute all steps sequentially.
- If a dependency install fails, try an alternative and continue.
- Test each component after building it. If a test fails, fix it and move on.
- Commit after each major feature with a descriptive message.
- Print progress to stdout: "=== Building feature X ===" etc.

## Business Model
BYOK (Bring Your Own Key) — the user provides their own Anthropic or OpenAI API key.
- $0 infrastructure cost (no AI API bills for us)
- $0 backend needed (no server to proxy API calls)
- The app is a STATIC SITE — pure frontend React, deployed free on Vercel/Netlify
- User's API key stays in their browser and is sent directly to the AI provider
- Monetization (future): 3 free generations, then $49 one-time purchase via Stripe checkout link

## Tech Stack
- React 18+ with TypeScript
- Vite for build tooling
- Tailwind CSS for styling (NO dark mode in v1)
- Direct fetch() calls to Anthropic and OpenAI REST APIs (no SDKs)
- jspdf for PDF flyer export (direct text rendering, NOT html2canvas screenshot)
- React Router (HashRouter — NOT BrowserRouter, avoids Vercel 404 on refresh)
- Zustand with persist middleware for state management
- sonner for toast notifications
- Deployed as static site on Vercel (free tier)
- NO backend. NO database. NO server. Everything runs in the browser.
- NO dark mode in v1 — ship fast, add later

## CRITICAL: Vite Project Scaffold
The project directory already contains CLAUDE.md. Scaffold INTO the current directory with --force:
```bash
npm create vite@latest . -- --template react-ts --force
```
The `--force` flag handles the non-empty directory. Do NOT use a project name — it creates a nested subfolder.

## API Key Handling
The user's API key is stored in localStorage and sent directly from the browser to the AI API.

### Provider Support
- **OpenAI (DEFAULT)** — zero CORS issues from browsers. Recommend this for first-time users.
- **Anthropic Claude** — requires `anthropic-dangerous-direct-browser-access: "true"` header. Works for most keys but may fail on enterprise/restricted keys.

### Default Provider
OpenAI is the default. Anthropic is available as an option. The ApiKeyModal should recommend OpenAI first because it has zero CORS complications.

### CORS Error Handling (Anthropic-specific)
When calling Anthropic from the browser, CORS errors produce an opaque response. The fetch() itself throws on CORS/network failures — catch it and show a helpful message pointing users to switch to OpenAI.

### Security Display
Show prominently in ApiKeyModal and Settings:
"Your API key is stored locally in your browser and sent directly to [provider]. We never see, store, or transmit your key to any server."

## Project Structure
```
listingkit/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── PropertyForm.tsx
│   │   ├── OutputCard.tsx
│   │   ├── OutputSuite.tsx
│   │   ├── ApiKeyModal.tsx
│   │   ├── ProviderToggle.tsx
│   │   ├── LoadingState.tsx
│   │   ├── CopyButton.tsx
│   │   ├── PdfExport.tsx
│   │   ├── DemoOutput.tsx
│   │   ├── StepIndicator.tsx
│   │   └── ErrorBoundary.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Generate.tsx
│   │   ├── Settings.tsx
│   │   └── History.tsx
│   ├── lib/
│   │   ├── ai.ts
│   │   ├── prompts.ts
│   │   ├── types.ts
│   │   ├── storage.ts
│   │   ├── export.ts
│   │   ├── parsers.ts
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useGenerate.ts
│   │   └── useApiKey.ts
│   ├── store/
│   │   └── appStore.ts
│   └── data/
│       └── sampleOutput.ts
└── .gitignore
```

## Type System (lib/types.ts)

Use CLEAN discriminated unions. Every output has a `status` field so components can switch on it:

```typescript
// === AI Output — single type for ALL standard outputs (MLS, flyer, video) ===
export type AIOutput =
  | { status: 'success'; text: string }
  | { status: 'error'; message: string }
  | { status: 'loading' }
  | { status: 'idle' };

// === Social posts — parsed from single API call ===
export interface SocialPosts {
  instagram: string;
  facebook: string;
  linkedin: string;
}

// === Social output — success includes parsed posts ===
export type SocialOutput =
  | { status: 'success'; posts: SocialPosts }
  | { status: 'error'; message: string }
  | { status: 'loading' }
  | { status: 'idle' };

// === Parsed email ===
export interface ParsedEmail {
  subject: string;
  body: string;
}

// === Email output — success includes parsed subject/body ===
export type EmailOutput =
  | { status: 'success'; parsed: ParsedEmail; raw: string }
  | { status: 'error'; message: string }
  | { status: 'loading' }
  | { status: 'idle' };

// === Full generation result ===
export interface GenerationResult {
  mls: AIOutput;
  social: SocialOutput;
  email: EmailOutput;
  flyer: AIOutput;
  video: AIOutput;
  generatedAt: string;
  property: PropertyInput;  // Stored so regeneration works from History
}

// === Property form input — all strings from form inputs ===
export interface PropertyInput {
  address: string;
  city: string;
  state: string;
  zip: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  squareFootage: string;
  lotSize: string;
  yearBuilt: string;
  listPrice: string;
  mlsCharLimit: string;  // optional — leave empty for word-count mode
  keyFeatures: string;
  recentUpgrades: string;
  neighborhoodHighlights: string;
  tone: string;
  agentName: string;
  brokerageName: string;
}

// === AI Config ===
export interface AIConfig {
  provider: 'openai' | 'anthropic';
  apiKey: string;
  model: string;
}

// === History ===
export interface HistoryEntry {
  id: string;
  generatedAt: string;
  property: PropertyInput;
  results: GenerationResult;
}
```

## Shared Utilities (lib/utils.ts)
```typescript
export function formatPrice(value: string | number): string {
  const n = typeof value === 'string' ? parseInt(value.replace(/\D/g, ''), 10) : value;
  if (isNaN(n) || n === 0) return '';
  return '$' + n.toLocaleString('en-US');
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function charCount(text: string): number {
  return text.length;
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
```

## State Management (Zustand with persist)
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '../lib/storage';

interface AppState {
  // Settings (persisted)
  apiKey: string;
  provider: 'openai' | 'anthropic';
  model: string;
  agentName: string;
  brokerageName: string;
  defaultTone: string;

  // Generation state (NOT persisted — transient)
  step: 0 | 1 | 2;         // 0=form, 1=generating, 2=results
  isGenerating: boolean;
  progress: number;         // 0-100
  progressLabel: string;
  results: GenerationResult | null;
  currentProperty: PropertyInput | null;
  error: string | null;

  // Actions
  setApiKey: (key: string) => void;
  setProvider: (p: 'openai' | 'anthropic') => void;
  setModel: (m: string) => void;
  setAgentName: (n: string) => void;
  setBrokerageName: (n: string) => void;
  setDefaultTone: (t: string) => void;
  generate: (property: PropertyInput) => Promise<void>;
  regenerateOutput: (outputKey: 'mls' | 'social' | 'email' | 'flyer' | 'video') => Promise<void>;
  clearResults: () => void;
  resetToForm: () => void;  // Goes back to step 0
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Defaults
      apiKey: '', provider: 'openai', model: 'gpt-4o',
      agentName: '', brokerageName: '', defaultTone: 'Professional',
      step: 0, isGenerating: false, progress: 0, progressLabel: '',
      results: null, currentProperty: null, error: null,

      // Setters
      setApiKey: (apiKey) => set({ apiKey }),
      setProvider: (provider) => set({ provider }),
      setModel: (model) => set({ model }),
      setAgentName: (agentName) => set({ agentName }),
      setBrokerageName: (brokerageName) => set({ brokerageName }),
      setDefaultTone: (defaultTone) => set({ defaultTone }),
      resetToForm: () => set({ step: 0, results: null, currentProperty: null, error: null, progress: 0, progressLabel: '' }),
      clearResults: () => set({ results: null }),

      // See "Generation Flow" section for generate() and regenerateOutput()
    }),
    {
      name: 'listingkit-storage',
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        apiKey: state.apiKey,
        provider: state.provider,
        model: state.model,
        agentName: state.agentName,
        brokerageName: state.brokerageName,
        defaultTone: state.defaultTone,
      }),
    }
  )
);
```

## localStorage Safety Wrapper (lib/storage.ts)
ALL localStorage access MUST be wrapped for Safari Private Mode:
```typescript
export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

export const safeStorage = {
  getItem: (name: string): string | null => {
    try { return localStorage.getItem(name); } catch { return null; }
  },
  setItem: (name: string, value: string): void => {
    try { localStorage.setItem(name, value); } catch { /* silent fail */ }
  },
  removeItem: (name: string): void => {
    try { localStorage.removeItem(name); } catch { /* silent fail */ }
  },
};

const HISTORY_KEY = 'listingkit-history';
const MAX_HISTORY = 50;

export function getHistory(): HistoryEntry[] {
  const raw = safeStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export function addToHistory(entry: HistoryEntry): void {
  const history = getHistory();
  history.unshift(entry);
  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
  safeStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function deleteFromHistory(id: string): void {
  const history = getHistory().filter(e => e.id !== id);
  safeStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  safeStorage.removeItem(HISTORY_KEY);
}
```

## Generation Flow — PARALLEL BATCHES WITH GRANULAR PROGRESS

CRITICAL: Promise.allSettled returns "fulfilled" even when generateContent() returns an error object. You MUST check the `.status` field on the AIOutput value itself, not just whether the promise fulfilled.

```typescript
async generate(property: PropertyInput) {
  const config: AIConfig = { provider: get().provider, apiKey: get().apiKey, model: get().model };

  if (!config.apiKey) {
    set({ error: 'No API key configured. Add one in Settings.' });
    return;
  }

  set({
    step: 1, isGenerating: true, progress: 0, progressLabel: 'Starting...',
    error: null, currentProperty: property, results: null,
  });

  const system = SYSTEM_PROMPT;
  let completedCount = 0;
  const totalCalls = 5;

  // Each call increments progress as it completes (granular feedback)
  const tick = (label: string) => {
    completedCount++;
    set({ progress: Math.round((completedCount / totalCalls) * 100), progressLabel: label });
  };

  // Batch 1: MLS + Social + Email in parallel
  const mlsP = generateContent(config, system, buildMlsPrompt(property)).then(r => { tick('MLS description ready...'); return r; });
  const socialP = generateContent(config, system, buildSocialPrompt(property)).then(r => { tick('Social posts ready...'); return r; });
  const emailP = generateContent(config, system, buildEmailPrompt(property)).then(r => { tick('Email blast ready...'); return r; });

  const [mlsRaw, socialRaw, emailRaw] = await Promise.allSettled([mlsP, socialP, emailP]);

  // Batch 2: Flyer + Video in parallel
  const flyerP = generateContent(config, system, buildFlyerPrompt(property)).then(r => { tick('Flyer ready...'); return r; });
  const videoP = generateContent(config, system, buildVideoPrompt(property)).then(r => { tick('Video script ready...'); return r; });

  const [flyerRaw, videoRaw] = await Promise.allSettled([flyerP, videoP]);

  // === Process results ===
  // Helper: unwrap PromiseSettledResult into AIOutput
  const unwrap = (settled: PromiseSettledResult<AIOutput>): AIOutput => {
    if (settled.status === 'rejected') {
      return { status: 'error', message: settled.reason?.message || 'Request failed' };
    }
    return settled.value; // Already { status: 'success', text } or { status: 'error', message }
  };

  // Social: unwrap then parse
  const socialUnwrapped = unwrap(socialRaw);
  const socialResult: SocialOutput = socialUnwrapped.status === 'success'
    ? { status: 'success', posts: parseSocialOutput(socialUnwrapped.text) }
    : socialUnwrapped; // pass through error/loading/idle

  // Email: unwrap then parse
  const emailUnwrapped = unwrap(emailRaw);
  const emailResult: EmailOutput = emailUnwrapped.status === 'success'
    ? { status: 'success', parsed: parseEmailOutput(emailUnwrapped.text), raw: emailUnwrapped.text }
    : emailUnwrapped;

  const results: GenerationResult = {
    mls: unwrap(mlsRaw),
    social: socialResult,
    email: emailResult,
    flyer: unwrap(flyerRaw),
    video: unwrap(videoRaw),
    generatedAt: new Date().toISOString(),
    property,
  };

  set({ results, isGenerating: false, step: 2, progress: 100, progressLabel: 'Complete!' });
  addToHistory({ id: generateId(), generatedAt: results.generatedAt, property, results });
}
```

### Regeneration
When user clicks "Regenerate" on a specific output, set that output to loading state FIRST, then re-run ONLY that prompt:
```typescript
async regenerateOutput(outputKey: 'mls' | 'social' | 'email' | 'flyer' | 'video') {
  const property = get().currentProperty;
  const results = get().results;
  if (!property || !results) return;

  // Set this specific output to loading state immediately
  const loading = { ...results };
  if (outputKey === 'social') {
    loading.social = { status: 'loading' as const };
  } else if (outputKey === 'email') {
    loading.email = { status: 'loading' as const };
  } else {
    loading[outputKey] = { status: 'loading' as const };
  }
  set({ results: loading });

  // Now make the API call
  const config: AIConfig = { provider: get().provider, apiKey: get().apiKey, model: get().model };
  const promptMap = { mls: buildMlsPrompt, social: buildSocialPrompt, email: buildEmailPrompt, flyer: buildFlyerPrompt, video: buildVideoPrompt };
  const raw = await generateContent(config, SYSTEM_PROMPT, promptMap[outputKey](property));

  // Get fresh results reference (loading state was set above)
  const updated = { ...get().results! };
  if (outputKey === 'social') {
    updated.social = raw.status === 'success'
      ? { status: 'success' as const, posts: parseSocialOutput(raw.text) }
      : { status: 'error' as const, message: raw.status === 'error' ? raw.message : 'Failed' };
  } else if (outputKey === 'email') {
    updated.email = raw.status === 'success'
      ? { status: 'success' as const, parsed: parseEmailOutput(raw.text), raw: raw.text }
      : { status: 'error' as const, message: raw.status === 'error' ? raw.message : 'Failed' };
  } else {
    updated[outputKey] = raw;
  }
  set({ results: updated });
}
```

### Rate Limit Handling
After generation completes, store `lastGeneratedAt` timestamp. If next attempt is within 10 seconds, show cooldown toast. 429 responses are caught in ai.ts and returned as `{ status: 'error', message: 'Rate limited...' }`.

## Parsers (lib/parsers.ts)

### Social Post Parser
```typescript
import { SocialPosts } from './types';

export function parseSocialOutput(raw: string): SocialPosts {
  // Primary: split on delimiter
  const parts = raw.split(/---PLATFORM_BREAK---/i).map(s => s.trim()).filter(Boolean);
  if (parts.length >= 3) {
    return { instagram: parts[0], facebook: parts[1], linkedin: parts[2] };
  }

  // Fallback: split on platform headers
  const sections = raw.split(/\n(?=(?:instagram|facebook|linkedin)\b)/i).map(s => s.trim()).filter(Boolean);
  if (sections.length >= 3) {
    const strip = (s: string) => s.replace(/^(?:instagram|facebook|linkedin)[:\s]*\n?/i, '').trim();
    return { instagram: strip(sections[0]), facebook: strip(sections[1]), linkedin: strip(sections[2]) };
  }

  // Final fallback
  return { instagram: raw.trim(), facebook: '', linkedin: '' };
}
```

### Email Parser
```typescript
import { ParsedEmail } from './types';

export function parseEmailOutput(raw: string): ParsedEmail {
  const subjectMatch = raw.match(/^SUBJECT:\s*(.+)/im);
  if (subjectMatch) {
    const subject = subjectMatch[1].trim();
    const separatorIdx = raw.indexOf('---', subjectMatch.index! + subjectMatch[0].length);
    const body = separatorIdx !== -1
      ? raw.slice(separatorIdx + 3).trim()
      : raw.slice(subjectMatch.index! + subjectMatch[0].length).trim();
    return { subject, body };
  }
  const lines = raw.trim().split('\n');
  return { subject: lines[0] || 'New Listing', body: lines.slice(1).join('\n').trim() };
}
```

## AI Call Implementation (lib/ai.ts)

CRITICAL: generateContent() ALWAYS returns AIOutput — either `{ status: 'success', text }` or `{ status: 'error', message }`. It NEVER throws. All errors are caught internally.

```typescript
import { AIOutput, AIConfig } from './types';

export async function generateContent(config: AIConfig, systemPrompt: string, userPrompt: string): Promise<AIOutput> {
  try {
    if (config.provider === 'openai') {
      return await callOpenAI(config, systemPrompt, userPrompt);
    } else {
      return await callAnthropic(config, systemPrompt, userPrompt);
    }
  } catch (err: any) {
    return { status: 'error', message: err.message || 'Unknown error occurred' };
  }
}

async function callOpenAI(config: AIConfig, system: string, user: string): Promise<AIOutput> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model, max_tokens: 1024,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 401) return { status: 'error', message: 'Invalid API key. Check your key in Settings.' };
    if (response.status === 429) return { status: 'error', message: 'Rate limited. Wait a moment and try again.' };
    return { status: 'error', message: err.error?.message || `API error ${response.status}` };
  }
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  if (!text) return { status: 'error', message: 'Empty response from API' };
  return { status: 'success', text };
}

async function callAnthropic(config: AIConfig, system: string, user: string): Promise<AIOutput> {
  let response: Response;
  try {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model, max_tokens: 1024,
        system: system,
        messages: [{ role: 'user', content: user }],
      }),
    });
  } catch (networkErr) {
    return { status: 'error', message: 'Connection failed — likely a CORS issue with Anthropic. Try switching to OpenAI in Settings.' };
  }
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    if (!err) return { status: 'error', message: 'CORS error — switch to OpenAI in Settings, or check Anthropic docs for browser access.' };
    if (response.status === 401) return { status: 'error', message: 'Invalid API key. Check your key in Settings.' };
    if (response.status === 429) return { status: 'error', message: 'Rate limited. Wait a moment and try again.' };
    return { status: 'error', message: err.error?.message || `API error ${response.status}` };
  }
  const data = await response.json();
  const text = data.content?.[0]?.text || '';
  if (!text) return { status: 'error', message: 'Empty response from API' };
  return { status: 'success', text };
}

export async function testConnection(config: AIConfig): Promise<{ success: boolean; message: string }> {
  // Use cheapest model for connection test to save user money
  const testConfig = { ...config };
  if (config.provider === 'openai') testConfig.model = 'gpt-4o-mini';
  if (config.provider === 'anthropic') testConfig.model = 'claude-haiku-4-5-20251001';
  const result = await generateContent(testConfig, 'You are a test assistant.', 'Reply with the single word OK');
  if (result.status === 'success') return { success: true, message: 'Connected successfully!' };
  return { success: false, message: result.message };
}
```

## PDF Export (lib/export.ts) — Direct Text Rendering
Use jspdf to write text directly. Do NOT use html2canvas (not installed, produces blurry screenshots).

```typescript
import { jsPDF } from 'jspdf';
import { PropertyInput } from './types';
import { formatPrice } from './utils';

export function exportFlyerPdf(flyerText: string, property: PropertyInput): void {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const margin = 60;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  const titleLines = doc.splitTextToSize(property.address || 'Property Listing', contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 34 + 10;

  // Price
  doc.setFontSize(22);
  doc.setTextColor(16, 185, 129);
  const price = formatPrice(property.listPrice);
  if (price) { doc.text(price, margin, y); y += 30; }
  doc.setTextColor(0, 0, 0);

  // Specs
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  const specs = [
    property.bedrooms && `${property.bedrooms} BD`,
    property.bathrooms && `${property.bathrooms} BA`,
    property.squareFootage && `${property.squareFootage} SF`
  ].filter(Boolean).join('  |  ');
  if (specs) { doc.text(specs, margin, y); y += 30; }

  // Divider
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 20;

  // Body
  doc.setFontSize(12);
  const bodyLines = doc.splitTextToSize(flyerText, contentWidth);
  doc.text(bodyLines, margin, y);

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - margin - 30;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(11);
  const agentLine = [property.agentName, property.brokerageName].filter(Boolean).join(' | ');
  if (agentLine) doc.text(agentLine, margin, footerY);

  const filename = `${(property.address || 'listing').replace(/[^a-zA-Z0-9]/g, '_')}_flyer.pdf`;
  doc.save(filename);
}
```

## Routing (App.tsx)
Use HashRouter, NOT BrowserRouter:
```typescript
import { HashRouter, Routes, Route } from 'react-router-dom';
// Routes: /#/ (Home), /#/generate, /#/settings, /#/history
```

## Error Boundary (components/ErrorBoundary.tsx)
Wrap the entire app. Show a friendly "Something went wrong. Please refresh the page." instead of white screen.

## Design System
- Primary: Dark navy #0f172a (slate-900)
- Accent: Emerald #059669 (emerald-600), Light: #d1fae5 (emerald-100)
- Background: #fefdfb (warm white), #f8faf9 (cards)
- Error: #ef4444 (red-500)
- Font: **DM Sans** from Google Fonts
- Google Fonts: `<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">`
- NO dark mode in v1
- Rounded corners: rounded-xl on cards, rounded-lg on buttons
- Shadows: shadow-sm on cards, shadow-md on modals
- Mobile-first responsive
- Transitions: transition-all duration-200 on interactive elements
- Toast: sonner with position="bottom-right"

## Page Specifications

### CRITICAL: Generate.tsx is a STEP FLOW, not a two-column layout

The Generate page is a SINGLE-PAGE STEP FLOW. No side-by-side layout. State-based navigation:

```
Step 0 → PropertyForm (centered, max-w-xl)
Step 1 → LoadingState with animated progress (centered, max-w-md)
Step 2 → OutputSuite with results (centered, max-w-2xl) + "Generate Another" button
```

```typescript
// Generate.tsx
const { step, apiKey } = useAppStore();
const [showApiModal, setShowApiModal] = useState(!apiKey);

return (
  <div className="max-w-2xl mx-auto px-4 py-8">
    {showApiModal && <ApiKeyModal onClose={() => setShowApiModal(false)} />}
    <StepIndicator current={step} />
    {step === 0 && <PropertyForm />}
    {step === 1 && <LoadingState />}
    {step === 2 && <OutputSuite />}
  </div>
);
```

### StepIndicator.tsx
Three connected circles:
1. "Property Details" — emerald when active (step 0), checkmark when complete
2. "Generating" — emerald when active (step 1), checkmark when complete
3. "Marketing Kit" — emerald when active (step 2)

Horizontal layout. Connector lines between circles fill emerald as you progress.

### Home.tsx (Landing Page)
- Hero: "Your Listing, Fully Marketed in 30 Seconds"
- Subhead: "MLS description, social posts, email, flyer, and video script — one form, five outputs."
- CTA: "Start Generating Free" → /#/generate
- **DEMO SECTION**: sample property card + tabbed preview of all 5 outputs (from src/data/sampleOutput.ts)
- Feature cards: "Fair Housing Compliant", "5 Outputs, 1 Form", "Your Key, Your Data"
- How It Works: 3 steps
- Social proof: "Built by licensed real estate agents"

### PropertyForm.tsx
Organized into VISUAL SECTIONS with emerald section labels:

**"The Property"**
- Address (text, required)
- City (text, required)
- State (dropdown 50 + DC, required) | ZIP (text, required)

**"The Numbers"**
- Beds (number) | Baths (number, step 0.5) | Sq Ft (number)
- List Price (number, required) | Year Built (number) | Lot Size (text)

**"The Story"** (subtitle: "This is where your listing stands out")
- Key Features (textarea, placeholder: "granite counters, hardwood floors, mountain views")
- Recent Upgrades (textarea, placeholder: "new roof 2024, remodeled kitchen")
- Neighborhood (textarea, placeholder: "close to downtown, top-rated schools")

**"Your Brand"**
- Agent Name (pre-filled from store) | Brokerage (pre-filled from store)
- Tone (dropdown: Professional, Luxury, Warm & Inviting, Modern & Sleek, Welcoming)

NOTE: "Family-Friendly" tone is REMOVED — replaced with "Welcoming" to avoid Fair Housing conflict with system prompt rule about familial status.

**Advanced (collapsible)**
- MLS Character Limit (number, helper: "Leave blank for 150-250 words, or enter your MLS system's character limit")

- Form uses local React useState (NOT Zustand)
- On submit: validate → pass PropertyInput to store.generate()
- Validation: address, city, state, zip, listPrice required
- Large emerald "Generate Marketing Kit →" button
- Price field shows formatted preview below: "$625,000"
- Centered max-w-xl

### OutputSuite.tsx
Dark pill-style tabs (better mobile tap targets than underlines):
- 📋 MLS | 📱 Social | 📧 Email | 📄 Flyer | 🎬 Video

**ALL-FAILED BANNER:** Before rendering tabs, check if ALL 5 outputs have `status: 'error'`. If so, show a prominent red banner at the top: "All outputs failed. This usually means your API key is invalid or expired. Check your key in Settings." with a link to /#/settings. Don't hide the tabs — the user can still see individual errors — but the banner immediately explains the problem.

```typescript
const allFailed = results.mls.status === 'error' && results.social.status === 'error'
  && results.email.status === 'error' && results.flyer.status === 'error'
  && results.video.status === 'error';
```

**MLS tab:** OutputCard with description. Footer shows character count + word count.

**Social tab:** 3 stacked OutputCards — Instagram 📸, Facebook 👍, LinkedIn 💼. Each has own CopyButton.

**Email tab:** OutputCard with subject line rendered bold/emerald at top, body below. Uses parseEmailOutput().

**Flyer tab:** OutputCard + "📥 Download PDF Flyer" button.

**Video tab:** OutputCard with `font-mono` so `[VISUAL: ...]` cues are distinct from narration.

Each OutputCard checks `result.status`:
- `'success'` → text + copy + regenerate
- `'error'` → red message + retry button
- `'loading'` → skeleton shimmer
- `'idle'` → nothing

Bottom of OutputSuite (step 2): "Generate Another Listing" button → calls store.resetToForm()

### LoadingState.tsx
Centered animation:
- Pulsing emerald house icon
- Progress bar (0-100%)
- progressLabel text updating as each call completes
- Smooth transitions on progress bar width

### ApiKeyModal.tsx
Full-screen overlay. Centered card. Recommend OpenAI first. Provider tabs. Key input with eye toggle. Test Connection button. Security message. Save & Start. Skip link.

### Settings.tsx
Cards: AI Provider section (toggle, model dropdown, key, test), Default Info section (agent, brokerage, tone), Data Management (clear history, reset all).

Model dropdown options:
- OpenAI: gpt-4o (recommended), gpt-4o-mini (faster/cheaper)
- Anthropic: claude-sonnet-4-20250514 (recommended), claude-haiku-4-5-20251001 (faster/cheaper)

### History.tsx
Cards newest first. Click to expand → shows OutputSuite. Only ONE expanded at a time (expandedId state). Delete per entry. Clear all. Empty state with link to /#/generate.

## AI Prompt Specifications (lib/prompts.ts)

### SYSTEM_PROMPT
```
You are a licensed real estate marketing expert. You create compelling, accurate property marketing materials.

FAIR HOUSING COMPLIANCE (MANDATORY):
- NEVER use language that could discriminate based on race, color, religion, sex, disability, familial status, national origin, sexual orientation, or gender identity.
- NEVER describe a neighborhood's demographic composition or religious institutions.
- Use "primary bedroom" — NEVER "master bedroom".
- NEVER use "walking distance" (implies ability requirement). Use "close to" or "minutes from" instead.
- NEVER use "perfect for young professionals" or "ideal for families" — these reference age and familial status.
- NEVER use "quiet neighborhood" or "safe area" as these can be coded discriminatory language.
- When in doubt, describe the PROPERTY and its FEATURES, not the people who should live there.

WRITING RULES:
- NEVER fabricate features not provided in the input.
- NEVER state square footage, lot size, year built, bedrooms, or bathrooms unless explicitly provided.
- Match the requested tone exactly.
- Use active, compelling language.
- BANNED WORDS: "nestled", "boasts", "turnkey", "charming", "quaint", "cozy" (overused in real estate).
- REPLACEMENT OPTIONS: "features", "offers", "presents", "showcases", "includes", "highlights"
```

### formatPropertyDetails helper (shared by all prompts)
```typescript
function formatPropertyDetails(p: PropertyInput): string {
  const lines: string[] = [];
  lines.push(`Address: ${p.address}, ${p.city}, ${p.state} ${p.zip}`);
  if (p.propertyType) lines.push(`Type: ${p.propertyType}`);
  if (p.bedrooms) lines.push(`Bedrooms: ${p.bedrooms}`);
  if (p.bathrooms) lines.push(`Bathrooms: ${p.bathrooms}`);
  if (p.squareFootage) lines.push(`Square Footage: ${p.squareFootage}`);
  if (p.lotSize) lines.push(`Lot Size: ${p.lotSize}`);
  if (p.yearBuilt) lines.push(`Year Built: ${p.yearBuilt}`);
  if (p.listPrice) lines.push(`List Price: ${formatPrice(p.listPrice)}`);
  lines.push(`Key Features: ${p.keyFeatures || 'Not specified'}`);
  lines.push(`Recent Upgrades: ${p.recentUpgrades || 'None specified'}`);
  lines.push(`Neighborhood: ${p.neighborhoodHighlights || 'Not specified'}`);
  lines.push(`Tone: ${p.tone || 'Professional'}`);
  return lines.join('\n');
}
```

### buildMlsPrompt — character vs word count FIXED
```typescript
export function buildMlsPrompt(property: PropertyInput): string {
  // CRITICAL: Send EITHER character limit OR word count, NEVER both
  const lengthInstruction = property.mlsCharLimit
    ? `Keep the description under ${property.mlsCharLimit} characters (including spaces).`
    : 'Keep between 150-250 words.';

  return `Write an MLS listing description for this property.
${lengthInstruction}

Structure: Opening hook (1 compelling sentence) → Key features → Upgrades → Neighborhood context → Call to action.
End with: "Listed by ${property.agentName || '[Agent]'}, ${property.brokerageName || '[Brokerage]'}"

Property Details:
${formatPropertyDetails(property)}`;
}
```

### buildSocialPrompt — clean separation of instructions from output format
All section descriptions come FIRST, then the output format instruction with delimiter. No interleaving descriptions with delimiters.
```typescript
export function buildSocialPrompt(property: PropertyInput): string {
  return `Create three social media posts for this property listing.

Here is what each post should contain:

1. INSTAGRAM POST: Attention-grabbing first line (shows before "...more"), 2-3 emojis per line (not excessive), 5 property hashtags + 5 local area hashtags at the end, CTA like "DM for details" or "Link in bio", under 2200 characters.

2. FACEBOOK POST: Conversational and engaging, include price/beds/baths/location, ask a question to drive engagement, no hashtags, under 500 words.

3. LINKEDIN POST: Professional tone, position the agent as a market expert, include 1-2 brief market insights, end with "Reach out if you or anyone in your network is looking in ${property.city}", under 300 words.

OUTPUT FORMAT: Write ONLY the three posts, separated by ---PLATFORM_BREAK--- on its own line. Do NOT include any labels, headers, platform names, or section titles. Just the raw post content for each platform, in order: Instagram, Facebook, LinkedIn.

Example structure (do NOT copy this content):
[Instagram post content here]
---PLATFORM_BREAK---
[Facebook post content here]
---PLATFORM_BREAK---
[LinkedIn post content here]

Property Details:
${formatPropertyDetails(property)}`;
}
```

### buildEmailPrompt
```typescript
export function buildEmailPrompt(property: PropertyInput): string {
  return `Write a buyer email blast for this new listing.

Format:
SUBJECT: [subject line under 60 characters]
---
[email body]

Requirements:
- Opening: personal and urgent tone
- Highlight top 3 features
- Include a "Property Snapshot" section:
  📍 ${property.address}, ${property.city}, ${property.state}
  💰 ${formatPrice(property.listPrice)}
  🏠 ${property.bedrooms ? property.bedrooms + ' BD' : ''}${property.bathrooms ? ' | ' + property.bathrooms + ' BA' : ''}${property.squareFootage ? ' | ' + property.squareFootage + ' SF' : ''}
- CTA: "Reply to schedule a showing"
- Sign off: ${property.agentName || '[Agent]'}, ${property.brokerageName || '[Brokerage]'}
- Body under 200 words
- Plain text only (no HTML)

Property Details:
${formatPropertyDetails(property)}`;
}
```

### buildFlyerPrompt
```typescript
export function buildFlyerPrompt(property: PropertyInput): string {
  return `Write text for a one-page open house flyer for printing.

Format:
HEADLINE: [attention-grabbing headline]
ADDRESS: ${property.address}, ${property.city}, ${property.state} ${property.zip}
PRICE: ${formatPrice(property.listPrice)}
SPECS: ${[property.bedrooms && property.bedrooms + ' BD', property.bathrooms && property.bathrooms + ' BA', property.squareFootage && property.squareFootage + ' SF'].filter(Boolean).join(' | ')}
---
[6-8 bullet points — short and punchy, one line each]
---
OPEN HOUSE: [DATE] | [TIME]
CONTACT: ${property.agentName || '[Agent]'} | ${property.brokerageName || '[Brokerage]'} | [PHONE]

Keep it scannable. Short lines. Punchy language.

Property Details:
${formatPropertyDetails(property)}`;
}
```

### buildVideoPrompt
```typescript
export function buildVideoPrompt(property: PropertyInput): string {
  return `Write a 60-second property walkthrough video script.

Format with visual cues in [BRACKETS]:

[VISUAL: description of what to show]
NARRATION: "what to say"

Structure:
- Hook (0-5 sec): teaser of best feature
- Exterior (5-10 sec): approach and curb appeal
- Main living areas (10-30 sec): flow through key rooms
- Kitchen/primary suite (30-45 sec): highlight upgrades
- Outdoor/special features (45-55 sec)
- Closing CTA (55-60 sec): "${property.agentName || '[Agent]'} — call me for a private showing"

Conversational tone — spoken to camera or as voiceover.

Property Details:
${formatPropertyDetails(property)}`;
}
```

## Deployment
- Build: `npm run build` → produces dist/
- Deploy: push to GitHub → connect to Vercel → auto-deploys
- Framework preset: Vite
- No environment variables needed
- No vercel.json needed (HashRouter)
- Cost: $0/month forever

## Favicon
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path d="M50 15L10 50h15v30h20V60h10v20h20V50h15L50 15z" fill="#059669"/>
</svg>
```

## Dependencies (package.json)
```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.26.0",
    "zustand": "^4.5.0",
    "jspdf": "^2.5.1",
    "sonner": "^1.7.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0"
  }
}
```
html2canvas is NOT installed. PDF uses jspdf direct text rendering.

## Git Workflow
- .gitignore: node_modules/, dist/, .env*, .DS_Store
- Commit after each major feature
- Final commit: "feat: complete ListingKit v1.0"

## Active Skills
<!-- Auto-detected by ~/.claude/scripts/select-skills.py — update as the project evolves -->
- react-patterns — component architecture
- stripe-integration — payment flows
- frontend-dev-guidelines — UI patterns
