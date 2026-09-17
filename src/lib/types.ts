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

// Four distribution assets produced by one structured call.
export interface DistributionAssets {
  property_page: { headline: string; summary: string; seo_title: string; meta_description: string };
  agent_email: ParsedEmail;
  youtube_description: string;
  google_business_post: string;
}

export type DistributionOutput =
  | { status: 'success'; assets: DistributionAssets }
  | { status: 'error'; message: string }
  | { status: 'loading' }
  | { status: 'idle' };

export type OutputKey = 'mls' | 'social' | 'email' | 'flyer' | 'video' | 'distribution';

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
  // Optional so previously saved history remains readable.
  distribution?: DistributionOutput;
  generationInfo?: { generator_version: string; model: string };
  generatedAt: string;
  property: PropertyInput;
}

// === Property form input — all strings from form inputs ===
export interface PublicListingFacts {
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
  keyFeatures: string;
  recentUpgrades: string;
  neighborhoodHighlights: string;
  agentName: string;
  brokerageName: string;
}

// The form is seller-approved PUBLIC input, with generation settings kept separate.
export interface PropertyInput extends PublicListingFacts {
  mlsCharLimit: string;
  tone: string;
}

export type BundleAsset<T> =
  | { status: 'success'; content: T }
  | { status: 'unavailable'; reason: 'missing' | 'idle' | 'loading' | 'error' | 'invalid' };

export interface ListingBundleAssets {
  mls: BundleAsset<string>;
  social: BundleAsset<SocialPosts>;
  email: BundleAsset<ParsedEmail>;
  flyer: BundleAsset<string> & { pdf_note: string };
  video: BundleAsset<string>;
  property_page: BundleAsset<DistributionAssets['property_page']>;
  agent_email: BundleAsset<ParsedEmail>;
  youtube_description: BundleAsset<string>;
  google_business_post: BundleAsset<string>;
}

export interface AssetBundleCompliance {
  status: 'findings_require_review' | 'no_scanner_hits_review_required';
  findings: { asset: string; category: 'fair_housing' | 'banned_language'; phrase: string; index: number }[];
  scanned_text_assets: string[];
  warnings: string[];
}

export interface ListingAssetBundle {
  schema_version: 'listingkit.asset-bundle.v1';
  bundle_id: string;
  public_listing_id: string;
  source_facts_hash: string;
  generated_at: string;
  market: { city: string; state: string; zip: string };
  attribution: { agent_name: string; brokerage_name: string };
  approved_public_facts: PublicListingFacts;
  assets: ListingBundleAssets;
  compliance: AssetBundleCompliance;
  approval_status: 'review_required';
  provenance: {
    generator: 'listingkit';
    generator_version: string;
    model: string;
    source: 'approved_public_facts';
  };
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
