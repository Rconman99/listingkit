import type {
  AssetBundleCompliance, BundleAsset, DistributionAssets, GenerationResult, ListingAssetBundle,
  ListingBundleAssets, PublicListingFacts,
} from './types';
import { isDistributionAssets } from './parsers';
import { GENERATOR_VERSION, GENERATION_MODEL, projectPublicFacts } from './publicFacts';

export { GENERATOR_VERSION, GENERATION_MODEL, projectPublicFacts, projectGenerationInput } from './publicFacts';

// JSON-only canonicalization, sorted recursively; preserves exact string values.
export function stableCanonicalize(value: unknown): string {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number' && Number.isFinite(value)) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableCanonicalize).join(',')}]`;
  if (typeof value === 'object' && value !== null) {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableCanonicalize((value as Record<string, unknown>)[key])}`).join(',')}}`;
  }
  throw new TypeError('Canonical facts must contain only JSON values');
}

export async function sha256(value: string): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

export function hashPublicFacts(input: PublicListingFacts): Promise<string> {
  return sha256(stableCanonicalize(projectPublicFacts(input)));
}

export const REVIEW_WARNINGS = [
  'Human factual review required. Verify every claim against seller-approved public facts.',
  'Virtual/AI imagery must be disclosed and cannot alter permanent facts.',
  'This bundle is not approval to publish/send.',
  'A clean language scan does not establish compliance; human Fair Housing and local policy review is required.',
];

const SCAN_RULES: { category: 'fair_housing' | 'banned_language'; pattern: RegExp }[] = [
  { category: 'fair_housing', pattern: /\b(?:master[\s-]+bedroom|walking[\s-]+distance|(?:perfect|ideal)\s+for\s+(?:young\s+professionals|families)|quiet[\s-]+neighborhood|safe[\s-]+area|adults[\s-]+only|no[\s-]+(?:children|kids)|(?:christian|white)[\s-]+(?:community|neighborhood)|(?:no|only)\s+(?:muslims|christians|whites|blacks)|(?:families|singles|couples)\s+only)\b/gi },
  { category: 'banned_language', pattern: /\b(?:nestled|boasts|turnkey|charming|quaint|cozy)\b/gi },
];

export function scanAssetCompliance(assets: ListingBundleAssets): AssetBundleCompliance {
  const findings: AssetBundleCompliance['findings'] = [];
  const scanned: string[] = [];
  const visit = (value: unknown, path: string) => {
    if (typeof value === 'string') {
      scanned.push(path);
      for (const { category, pattern } of SCAN_RULES) {
        for (const match of value.matchAll(new RegExp(pattern))) {
          findings.push({ asset: path, category, phrase: match[0], index: match.index! });
        }
      }
    } else if (value && typeof value === 'object') {
      for (const key of Object.keys(value).sort()) {
        visit((value as Record<string, unknown>)[key], `${path}.${key}`);
      }
    }
  };
  for (const key of Object.keys(assets).sort() as (keyof ListingBundleAssets)[]) {
    const asset = assets[key];
    if (asset.status === 'success') visit(asset.content, key);
  }
  return {
    status: findings.length ? 'findings_require_review' : 'no_scanner_hits_review_required',
    findings, scanned_text_assets: scanned, warnings: [...REVIEW_WARNINGS],
  };
}

function asset<T>(output: { status: string } | undefined, read: () => T): BundleAsset<T> {
  if (output?.status === 'success') {
    try { return { status: 'success', content: read() }; }
    catch { return { status: 'unavailable', reason: 'invalid' }; }
  }
  const reason = output === undefined ? 'missing'
    : output.status === 'loading' || output.status === 'idle' || output.status === 'error' ? output.status : 'invalid';
  return { status: 'unavailable', reason };
}

function text(value: unknown): string {
  if (typeof value !== 'string') throw new TypeError('Invalid text asset');
  return value;
}

export async function buildAssetBundle(results: GenerationResult): Promise<ListingAssetBundle> {
  // Copy all allowed data before awaiting hashes, including assets from current results.
  const facts = projectPublicFacts(results.property);
  const d = results.distribution;
  const distribution = <K extends keyof DistributionAssets>(key: K) => asset(d, () => {
    if (d?.status !== 'success' || !isDistributionAssets(d.assets)) throw new TypeError('Invalid distribution');
    // Validator rejects unknown fields; copy to avoid retaining references to mutable results.
    return JSON.parse(JSON.stringify(d.assets[key])) as DistributionAssets[K];
  });
  const assets: ListingBundleAssets = {
    mls: asset(results.mls, () => results.mls.status === 'success' ? text(results.mls.text) : ''),
    social: asset(results.social, () => {
      if (results.social.status !== 'success') throw new TypeError('Invalid social');
      return { instagram: text(results.social.posts.instagram), facebook: text(results.social.posts.facebook), linkedin: text(results.social.posts.linkedin) };
    }),
    email: asset(results.email, () => {
      if (results.email.status !== 'success') throw new TypeError('Invalid email');
      return { subject: text(results.email.parsed.subject), body: text(results.email.parsed.body) };
    }),
    flyer: {
      ...asset(results.flyer, () => results.flyer.status === 'success' ? text(results.flyer.text) : ''),
      pdf_note: 'Printable PDF is generated client-side from this flyer text and approved public facts. No PDF bytes are embedded.',
    },
    video: asset(results.video, () => results.video.status === 'success' ? text(results.video.text) : ''),
    property_page: distribution('property_page'),
    agent_email: distribution('agent_email'),
    youtube_description: distribution('youtube_description'),
    google_business_post: distribution('google_business_post'),
  };
  const provenance: ListingAssetBundle['provenance'] = {
    generator: 'listingkit', generator_version: GENERATOR_VERSION,
    model: results.generationInfo?.model === GENERATION_MODEL ? GENERATION_MODEL : 'unknown (legacy or sample)',
    source: 'approved_public_facts',
  };
  const compliance = scanAssetCompliance(assets);
  const generated_at = new Date().toISOString();
  const contentIdentity = {
    schema_version: 'listingkit.asset-bundle.v1',
    approved_public_facts: facts,
    assets, compliance, approval_status: 'review_required', provenance,
  };
  const [source_facts_hash, addressHash, bundleHash] = await Promise.all([
    hashPublicFacts(facts),
    sha256(stableCanonicalize({ address: facts.address, city: facts.city, state: facts.state, zip: facts.zip })),
    sha256(stableCanonicalize(contentIdentity)),
  ]);
  return {
    schema_version: 'listingkit.asset-bundle.v1', bundle_id: `bundle_${bundleHash}`,
    public_listing_id: `listing_${addressHash}`, source_facts_hash, generated_at,
    market: { city: facts.city, state: facts.state, zip: facts.zip },
    attribution: { agent_name: facts.agentName, brokerage_name: facts.brokerageName },
    approved_public_facts: facts, assets, compliance,
    approval_status: 'review_required', provenance,
  };
}

export async function downloadAssetBundle(results: GenerationResult): Promise<void> {
  const bundle = await buildAssetBundle(results);
  const url = URL.createObjectURL(new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${bundle.bundle_id}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
