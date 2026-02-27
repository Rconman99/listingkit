import { useState } from 'react';
import { GenerationResult } from '../lib/types';
import { wordCount, charCount } from '../lib/utils';
import { useAppStore } from '../store/appStore';
import OutputCard from './OutputCard';
import CopyButton from './CopyButton';
import PdfExport from './PdfExport';

interface Props {
  results: GenerationResult;
  showGenerateAnother?: boolean;
}

type TabKey = 'mls' | 'social' | 'email' | 'flyer' | 'video';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'mls', label: 'MLS' },
  { key: 'social', label: 'Social' },
  { key: 'email', label: 'Email' },
  { key: 'flyer', label: 'Flyer' },
  { key: 'video', label: 'Video' },
];

export default function OutputSuite({ results, showGenerateAnother = false }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('mls');
  const regenerateOutput = useAppStore((s) => s.regenerateOutput);
  const resetToForm = useAppStore((s) => s.resetToForm);

  const allFailed =
    results.mls.status === 'error' &&
    results.social.status === 'error' &&
    results.email.status === 'error' &&
    results.flyer.status === 'error' &&
    results.video.status === 'error';

  return (
    <div>
      {/* All-failed banner */}
      {allFailed && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700 text-sm font-medium">
            All outputs failed. This usually means your API key is invalid or expired.{' '}
            <a href="/#/settings" className="underline font-semibold hover:text-red-800">
              Check your key in Settings
            </a>
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-navy text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="space-y-4">
        {activeTab === 'mls' && (
          <OutputCard
            title="MLS Listing Description"
            result={results.mls}
            onRegenerate={() => regenerateOutput('mls')}
            meta={
              results.mls.status === 'success'
                ? `${charCount(results.mls.text)} characters · ${wordCount(results.mls.text)} words`
                : undefined
            }
          />
        )}

        {activeTab === 'social' && (
          <>
            {results.social.status === 'loading' && (
              <OutputCard title="Social Posts" result={{ status: 'loading' }} />
            )}
            {results.social.status === 'error' && (
              <OutputCard
                title="Social Posts"
                result={results.social}
                onRegenerate={() => regenerateOutput('social')}
              />
            )}
            {results.social.status === 'success' && (
              <>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-navy">Instagram</h3>
                    <div className="flex items-center gap-2">
                      <CopyButton text={results.social.posts.instagram} />
                      <button
                        onClick={() => regenerateOutput('social')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200"
                      >
                        Regenerate All
                      </button>
                    </div>
                  </div>
                  <div className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                    {results.social.posts.instagram}
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-navy">Facebook</h3>
                    <CopyButton text={results.social.posts.facebook} />
                  </div>
                  <div className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                    {results.social.posts.facebook}
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-navy">LinkedIn</h3>
                    <CopyButton text={results.social.posts.linkedin} />
                  </div>
                  <div className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                    {results.social.posts.linkedin}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'email' && (
          <>
            {results.email.status === 'loading' && (
              <OutputCard title="Email Blast" result={{ status: 'loading' }} />
            )}
            {results.email.status === 'error' && (
              <OutputCard
                title="Email Blast"
                result={results.email}
                onRegenerate={() => regenerateOutput('email')}
              />
            )}
            {results.email.status === 'success' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-navy">Email Blast</h3>
                  <div className="flex items-center gap-2">
                    <CopyButton text={results.email.raw} />
                    <button
                      onClick={() => regenerateOutput('email')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Regenerate
                    </button>
                  </div>
                </div>
                <div className="mb-3 pb-3 border-b border-gray-100">
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Subject</span>
                  <p className="font-semibold text-emerald-700 mt-0.5">{results.email.parsed.subject}</p>
                </div>
                <div className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                  {results.email.parsed.body}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'flyer' && (
          <>
            <OutputCard
              title="Open House Flyer"
              result={results.flyer}
              onRegenerate={() => regenerateOutput('flyer')}
            />
            {results.flyer.status === 'success' && (
              <PdfExport flyerText={results.flyer.text} property={results.property} />
            )}
          </>
        )}

        {activeTab === 'video' && (
          <OutputCard
            title="Video Walkthrough Script"
            result={results.video}
            onRegenerate={() => regenerateOutput('video')}
            className="font-mono"
          />
        )}
      </div>

      {/* Generate Another */}
      {showGenerateAnother && (
        <div className="mt-8 text-center">
          <button
            onClick={resetToForm}
            className="px-6 py-3 bg-navy text-white rounded-lg font-semibold hover:bg-slate-800 transition-all duration-200"
          >
            Generate Another Listing
          </button>
        </div>
      )}
    </div>
  );
}
