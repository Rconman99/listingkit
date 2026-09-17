import { useEffect, useState } from 'react';
import type { GenerationResult, ListingAssetBundle } from '../lib/types';
import { buildAssetBundle, downloadAssetBundle } from '../lib/assetBundle';
import { useAppStore } from '../store/appStore';
import OutputCard from './OutputCard';

const distributionLabels = {
  property_page: 'Property Page', agent_email: 'Agent Email',
  youtube_description: 'YouTube Description', google_business_post: 'Google Business Post',
} as const;

export default function AssetBundlePanel({ results }: { results: GenerationResult }) {
  const [inspection, setInspection] = useState<{ results: GenerationResult; bundle: ListingAssetBundle } | null>(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const currentResults = useAppStore(s => s.results);
  const regenerate = useAppStore(s => s.regenerateOutput);

  useEffect(() => {
    let cancelled = false;
    setError('');
    buildAssetBundle(results).then(bundle => {
      if (!cancelled) setInspection({ results, bundle });
    }).catch(() => {
      if (!cancelled) setError('Unable to hash this bundle. Web Crypto requires a secure browser context (HTTPS or localhost).');
    });
    return () => { cancelled = true; };
  }, [results]);

  const bundle = inspection?.results === results ? inspection.bundle : null;
  const download = async () => {
    setDownloading(true);
    setError('');
    try { await downloadAssetBundle(results); }
    catch { setError('Unable to download the bundle. Please try again in a secure browser context.'); }
    finally { setDownloading(false); }
  };

  return (
    <section className="space-y-4" aria-label="Asset Bundle">
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-3">
        <h3 className="font-semibold text-navy">Asset Bundle</h3>
        <p className="text-sm text-gray-600">Draft assets from seller-approved public facts. Review required before publishing or sending.</p>
        <button onClick={download} disabled={downloading || !bundle}
          className="px-4 py-2 rounded-lg bg-navy text-white text-sm disabled:opacity-50">
          {downloading ? 'Preparing JSON…' : 'Download JSON'}
        </button>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {!bundle && !error && <p role="status" className="text-sm text-gray-500">Building current bundle…</p>}
        {bundle && <>
          <dl className="text-sm space-y-2 break-words">
            <dt className="font-semibold">Schema version</dt><dd>{bundle.schema_version}</dd>
            <dt className="font-semibold">Source facts SHA-256</dt><dd className="font-mono break-all">{bundle.source_facts_hash}</dd>
            <dt className="font-semibold">Public listing ID</dt><dd className="font-mono break-all">{bundle.public_listing_id}</dd>
            <dt className="font-semibold">Approval state</dt><dd>{bundle.approval_status}</dd>
            <dt className="font-semibold">Provenance</dt>
            <dd>{bundle.provenance.generator} v{bundle.provenance.generator_version} · Model: {bundle.provenance.model} · Source: {bundle.provenance.source}</dd>
            <dt className="font-semibold">Compliance status</dt>
            <dd>{bundle.compliance.status === 'findings_require_review' ? 'Language findings require review' : 'No scanner hits — human review still required'}</dd>
          </dl>
          <ul className="list-disc pl-5 text-sm text-amber-900 space-y-1">
            {bundle.compliance.warnings.map(warning => <li key={warning}>{warning}</li>)}
          </ul>
          {bundle.compliance.findings.length > 0 && <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
            {bundle.compliance.findings.map((finding, i) => <li key={i}>
              {finding.asset}: “{finding.phrase}” ({finding.category})
            </li>)}
          </ul>}
          <details className="text-sm">
            <summary className="cursor-pointer font-medium">Inspect approved public facts</summary>
            <pre className="whitespace-pre-wrap break-words mt-2">{JSON.stringify(bundle.approved_public_facts, null, 2)}</pre>
          </details>
          <p className="text-xs text-gray-500">{bundle.assets.flyer.pdf_note}</p>
        </>}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-navy">Distribution assets</h3>
        {currentResults === results && <button onClick={() => regenerate('distribution')}
          disabled={results.distribution?.status === 'loading'}
          className="px-3 py-1.5 rounded-lg bg-gray-100 text-sm disabled:opacity-50">
          {results.distribution?.status === 'loading' ? 'Generating distribution…' : 'Regenerate Distribution'}
        </button>}
      </div>
      {!results.distribution && <p className="text-sm text-gray-600">Distribution assets are unavailable in this older entry. The original five outputs remain available.</p>}
      {bundle && (Object.keys(distributionLabels) as (keyof typeof distributionLabels)[]).map(key => {
        const asset = bundle.assets[key];
        if (asset.status === 'unavailable') return <div key={key} className="rounded-xl bg-gray-50 p-4 text-sm">
          <h4 className="font-semibold">{distributionLabels[key]}</h4>
          <p>Unavailable ({asset.reason}).{asset.reason === 'error' || asset.reason === 'invalid' ? ' Regenerate distribution to retry.' : ''}</p>
        </div>;
        const text = typeof asset.content === 'string' ? asset.content
          : Object.entries(asset.content).map(([label, value]) => `${label.replace(/_/g, ' ')}:\n${value}`).join('\n\n');
        return <OutputCard key={key} title={distributionLabels[key]} result={{ status: 'success', text }} />;
      })}
    </section>
  );
}
