import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage, addToHistory } from '../lib/storage';
import { PropertyInput, GenerationResult, AIConfig, AIOutput, SocialOutput, EmailOutput } from '../lib/types';
import { generateContent } from '../lib/ai';
import { SYSTEM_PROMPT, buildMlsPrompt, buildSocialPrompt, buildEmailPrompt, buildFlyerPrompt, buildVideoPrompt } from '../lib/prompts';
import { parseSocialOutput, parseEmailOutput } from '../lib/parsers';
import { generateId } from '../lib/utils';

interface AppState {
  // Settings (persisted)
  apiKey: string;
  provider: 'openai' | 'anthropic';
  model: string;
  agentName: string;
  brokerageName: string;
  defaultTone: string;

  // Generation state (NOT persisted — transient)
  step: 0 | 1 | 2;
  isGenerating: boolean;
  progress: number;
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
  resetToForm: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Defaults
      apiKey: '', provider: 'openai', model: 'gpt-4o',
      agentName: '', brokerageName: '', defaultTone: 'Professional',
      step: 0 as const, isGenerating: false, progress: 0, progressLabel: '',
      results: null, currentProperty: null, error: null,

      // Setters
      setApiKey: (apiKey) => set({ apiKey }),
      setProvider: (provider) => set({ provider }),
      setModel: (model) => set({ model }),
      setAgentName: (agentName) => set({ agentName }),
      setBrokerageName: (brokerageName) => set({ brokerageName }),
      setDefaultTone: (defaultTone) => set({ defaultTone }),
      resetToForm: () => set({ step: 0 as const, results: null, currentProperty: null, error: null, progress: 0, progressLabel: '' }),
      clearResults: () => set({ results: null }),

      async generate(property: PropertyInput) {
        const config: AIConfig = { provider: get().provider, apiKey: get().apiKey, model: get().model };

        if (!config.apiKey) {
          set({ error: 'No API key configured. Add one in Settings.' });
          return;
        }

        set({
          step: 1 as const, isGenerating: true, progress: 0, progressLabel: 'Starting...',
          error: null, currentProperty: property, results: null,
        });

        const system = SYSTEM_PROMPT;
        let completedCount = 0;
        const totalCalls = 5;

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

        // Unwrap PromiseSettledResult into AIOutput
        const unwrap = (settled: PromiseSettledResult<AIOutput>): AIOutput => {
          if (settled.status === 'rejected') {
            return { status: 'error', message: settled.reason?.message || 'Request failed' };
          }
          return settled.value;
        };

        // Social: unwrap then parse
        const socialUnwrapped = unwrap(socialRaw);
        const socialResult: SocialOutput = socialUnwrapped.status === 'success'
          ? { status: 'success', posts: parseSocialOutput(socialUnwrapped.text) }
          : socialUnwrapped as SocialOutput;

        // Email: unwrap then parse
        const emailUnwrapped = unwrap(emailRaw);
        const emailResult: EmailOutput = emailUnwrapped.status === 'success'
          ? { status: 'success', parsed: parseEmailOutput(emailUnwrapped.text), raw: emailUnwrapped.text }
          : emailUnwrapped as EmailOutput;

        const results: GenerationResult = {
          mls: unwrap(mlsRaw),
          social: socialResult,
          email: emailResult,
          flyer: unwrap(flyerRaw),
          video: unwrap(videoRaw),
          generatedAt: new Date().toISOString(),
          property,
        };

        set({ results, isGenerating: false, step: 2 as const, progress: 100, progressLabel: 'Complete!' });
        addToHistory({ id: generateId(), generatedAt: results.generatedAt, property, results });
      },

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

        // Make the API call
        const config: AIConfig = { provider: get().provider, apiKey: get().apiKey, model: get().model };
        const promptMap = { mls: buildMlsPrompt, social: buildSocialPrompt, email: buildEmailPrompt, flyer: buildFlyerPrompt, video: buildVideoPrompt };
        const raw = await generateContent(config, SYSTEM_PROMPT, promptMap[outputKey](property));

        // Get fresh results reference
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
      },
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
