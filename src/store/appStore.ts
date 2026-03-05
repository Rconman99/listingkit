import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage, addToHistory } from '../lib/storage';
import { PropertyInput, GenerationResult, CreditInfo, SocialOutput, EmailOutput } from '../lib/types';
import { generateViaProxy, regenerateViaProxy, getCredits } from '../lib/ai';
import { generateId } from '../lib/utils';

interface AppState {
  // Settings (persisted)
  sessionId: string;
  agentName: string;
  brokerageName: string;
  defaultTone: string;

  // Credits
  credits: CreditInfo | null;

  // Generation state (NOT persisted — transient)
  step: 0 | 1 | 2;
  isGenerating: boolean;
  progress: number;
  progressLabel: string;
  results: GenerationResult | null;
  currentProperty: PropertyInput | null;
  error: string | null;

  // Actions
  setAgentName: (n: string) => void;
  setBrokerageName: (n: string) => void;
  setDefaultTone: (t: string) => void;
  fetchCredits: () => Promise<void>;
  generate: (property: PropertyInput) => Promise<void>;
  regenerateOutput: (outputKey: 'mls' | 'social' | 'email' | 'flyer' | 'video') => Promise<void>;
  clearResults: () => void;
  resetToForm: () => void;
}

function ensureSessionId(): string {
  return generateId();
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Defaults
      sessionId: ensureSessionId(),
      agentName: '', brokerageName: '', defaultTone: 'Professional',
      credits: null,
      step: 0 as const, isGenerating: false, progress: 0, progressLabel: '',
      results: null, currentProperty: null, error: null,

      // Setters
      setAgentName: (agentName) => set({ agentName }),
      setBrokerageName: (brokerageName) => set({ brokerageName }),
      setDefaultTone: (defaultTone) => set({ defaultTone }),
      resetToForm: () => set({ step: 0 as const, results: null, currentProperty: null, error: null, progress: 0, progressLabel: '' }),
      clearResults: () => set({ results: null }),

      async fetchCredits() {
        const credits = await getCredits(get().sessionId);
        set({ credits });
      },

      async generate(property: PropertyInput) {
        set({
          step: 1 as const, isGenerating: true, progress: 10, progressLabel: 'Sending to AI...',
          error: null, currentProperty: property, results: null,
        });

        try {
          // Animate progress while waiting
          const progressInterval = setInterval(() => {
            const current = get().progress;
            if (current < 85) {
              set({ progress: current + Math.random() * 8, progressLabel: 'Generating your marketing kit...' });
            }
          }, 800);

          const { results, credits } = await generateViaProxy(property, get().sessionId);

          clearInterval(progressInterval);

          set({
            results,
            credits,
            isGenerating: false,
            step: 2 as const,
            progress: 100,
            progressLabel: 'Complete!',
          });
          addToHistory({ id: generateId(), generatedAt: results.generatedAt, property, results });
        } catch (err) {
          set({ isGenerating: false, step: 0 as const, progress: 0, progressLabel: '' });
          if (err instanceof Error && err.message === 'NO_CREDITS') {
            set({ error: 'NO_CREDITS' });
          } else {
            set({ error: err instanceof Error ? err.message : 'Generation failed' });
          }
        }
      },

      async regenerateOutput(outputKey: 'mls' | 'social' | 'email' | 'flyer' | 'video') {
        const property = get().currentProperty;
        const results = get().results;
        if (!property || !results) return;

        // Set this specific output to loading state
        const loading = { ...results };
        if (outputKey === 'social') {
          loading.social = { status: 'loading' as const };
        } else if (outputKey === 'email') {
          loading.email = { status: 'loading' as const };
        } else {
          loading[outputKey] = { status: 'loading' as const };
        }
        set({ results: loading });

        try {
          const output = await regenerateViaProxy(property, outputKey, get().sessionId);

          const updated = { ...get().results! };
          if (outputKey === 'social') {
            updated.social = output as SocialOutput;
          } else if (outputKey === 'email') {
            updated.email = output as EmailOutput;
          } else {
            updated[outputKey] = output as typeof updated.mls;
          }
          set({ results: updated });
        } catch (err) {
          const updated = { ...get().results! };
          const message = err instanceof Error ? err.message : 'Regeneration failed';
          if (outputKey === 'social') {
            updated.social = { status: 'error' as const, message };
          } else if (outputKey === 'email') {
            updated.email = { status: 'error' as const, message };
          } else {
            updated[outputKey] = { status: 'error' as const, message };
          }
          set({ results: updated });
        }
      },
    }),
    {
      name: 'listingkit-storage',
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        sessionId: state.sessionId,
        agentName: state.agentName,
        brokerageName: state.brokerageName,
        defaultTone: state.defaultTone,
      }),
    }
  )
);
