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
  property: PropertyInput;
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
  mlsCharLimit: string;
  keyFeatures: string;
  recentUpgrades: string;
  neighborhoodHighlights: string;
  tone: string;
  agentName: string;
  brokerageName: string;
}

// === Credit info from server ===
export interface CreditInfo {
  tier: 'free' | 'pro';
  used: number;
  remaining: number;
  limit: number;
  resetDate?: string;
}

// === History ===
export interface HistoryEntry {
  id: string;
  generatedAt: string;
  property: PropertyInput;
  results: GenerationResult;
}
