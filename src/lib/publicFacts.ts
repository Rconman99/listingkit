import type { PropertyInput, PublicListingFacts } from './types';

export const GENERATOR_VERSION = '1.0.0';
export const GENERATION_MODEL = 'gemini-2.0-flash';

// Explicit allowlist: never spread a form, history record, or CRM object into facts.
const PUBLIC_FACT_KEYS = [
  'address', 'city', 'state', 'zip', 'propertyType', 'bedrooms', 'bathrooms',
  'squareFootage', 'lotSize', 'yearBuilt', 'listPrice', 'keyFeatures',
  'recentUpgrades', 'neighborhoodHighlights', 'agentName', 'brokerageName',
] as const satisfies readonly (keyof PublicListingFacts)[];

export function projectPublicFacts(input: PublicListingFacts): PublicListingFacts {
  return Object.fromEntries(PUBLIC_FACT_KEYS.map(key => [
    key, typeof input[key] === 'string' ? input[key] : '',
  ])) as unknown as PublicListingFacts;
}

export function projectGenerationInput(input: PropertyInput): PropertyInput {
  return {
    ...projectPublicFacts(input),
    tone: typeof input.tone === 'string' ? input.tone : '',
    mlsCharLimit: typeof input.mlsCharLimit === 'string' ? input.mlsCharLimit : '',
  };
}
