# ListingKit

AI-assisted real estate marketing drafts from one seller-approved **public** property fact set. Nine output groups form an inspectable, versioned JSON asset bundle; six AI calls produce a full kit for one credit.

## What You Get

1. **MLS Listing Description** — with character/word count
2. **Social Media Posts** — Instagram, Facebook, and LinkedIn
3. **Buyer Email Blast** — subject and body
4. **Open House Flyer** — text and client-side printable PDF
5. **Video Script** — walkthrough narration and visual cues
6. **Property Page** — headline, summary, SEO title, meta description
7. **Agent Email** — agent-to-agent listing introduction, subject and body
8. **YouTube Description**
9. **Google Business Post**

The original five tabs and regeneration controls remain available. The four new assets appear in **Asset Bundle** and are generated/regenerated together through one structured `distribution` call. Malformed or incomplete distribution JSON produces an error, never a partial success. Regeneration remains free.

## Public facts and review boundary

`PropertyInput` is treated as seller-approved public input. Enter only approved address, property specifications, price, features, upgrades, neighborhood facts, and public agent/brokerage names. `tone` and `mlsCharLimit` are generation settings and are excluded from the public snapshot and facts hash.

Explicit field allowlists exclude CRM/private identifiers, seller/contact PII, ARV, rehab estimates, investor math, internal campaign state, and API keys from the bundle. The API input is projected to public facts plus generation settings. **Free-text fields must already be public and approved**: field projection is not a semantic PII detector or evidence of seller consent. Never paste confidential information into those fields. Prompts prohibit fabrication and private information, but generated claims still require human verification.

There is **no automatic publishing or sending**. Copy, PDF, and JSON download are local actions; a bundle is not authorization to publish/send. Virtual/AI imagery must be disclosed and cannot alter permanent property facts. This feature does not generate imagery.

## Asset-bundle contract

Open **Asset Bundle** to inspect the source facts hash, schema, approval state, provenance, language findings, and distribution assets. **Download JSON** rebuilds the bundle from current results at click time, so any regenerated text is included. The view also rebuilds when results change.

- Schema: `listingkit.asset-bundle.v1`.
- `approved_public_facts`: allowlisted public snapshot, including public attribution.
- `source_facts_hash`: actual SHA-256 over recursively key-sorted canonical JSON of that snapshot. Object construction order and generation settings do not affect it; exact public string changes do. Hashing uses browser Web Crypto (HTTPS or localhost required).
- `public_listing_id`: SHA-256 derived exclusively from approved public address, city, state, and ZIP. No CRM IDs. Address hashes are public identifiers, not anonymization.
- `bundle_id`: stable SHA-256 content identifier over schema, facts, assets, compliance state, approval state, and provenance. Re-inspecting or downloading identical content keeps the same ID; changing facts or generated copy changes it. `generated_at` records bundle assembly time and is intentionally excluded from the content ID.
- `market` and `attribution`: public location and agent/brokerage names.
- `assets`: nine groups with `success` content or explicit `unavailable` reasons. Social contains three posts. Flyer contains text plus a note about client-side PDF creation; JSON never embeds PDF bytes. Raw model responses and error messages are not exported.
- `approval_status`: always `review_required`.
- `provenance`: generator `listingkit`, bundle generator version, model, and source `approved_public_facts`. Old history/sample data without model metadata honestly reports an unknown model.
- `compliance`: Fair Housing and banned-language pattern hits, asset paths, matched phrases/offsets, scanned text paths, and fixed review warnings. Every successful exported text field is scanned, including subjects and SEO metadata. A clean scan **does not establish compliance or factual accuracy**; this is a limited language scanner, not legal certification.

Old history without distribution remains usable and exports four unavailable distribution assets. Existing history needs no migration. Sample assets are illustrative drafts and also require factual review.

## Local Development

```bash
npm install
npm run dev
npm run build
npm test
```

The client uses React, TypeScript, Vite, Tailwind CSS, Zustand, and jsPDF. Generation uses the existing server-side `/api/generate` and `/api/regenerate` Gemini proxy; credentials remain server-side. Full generation still deducts one credit, and any rate-limited call prevents the deduction. A Vite-only local session supports sample UI and exports; live generation requires the existing API runtime/configuration.

The dependency-free offline test harness uses Node's test runner, the installed TypeScript compiler, and Node Web Crypto. Model and credit storage calls are mocked; no external APIs are called. Run `npm test` and `git diff --check` alongside the build before review.

## License

MIT
