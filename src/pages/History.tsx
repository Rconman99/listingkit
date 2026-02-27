import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHistory, deleteFromHistory, clearHistory } from '../lib/storage';
import { HistoryEntry } from '../lib/types';
import { formatPrice } from '../lib/utils';
import { toast } from 'sonner';
import OutputSuite from '../components/OutputSuite';

export default function History() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleDelete = (id: string) => {
    if (!confirm('Delete this entry?')) return;
    deleteFromHistory(id);
    setHistory(getHistory());
    if (expandedId === id) setExpandedId(null);
    toast.success('Entry deleted');
  };

  const handleClearAll = () => {
    if (!confirm('Clear all generation history? This cannot be undone.')) return;
    clearHistory();
    setHistory([]);
    setExpandedId(null);
    toast.success('History cleared');
  };

  if (history.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">📋</div>
        <h2 className="text-xl font-bold text-navy mb-2">No history yet</h2>
        <p className="text-gray-500 mb-6">Your generated marketing kits will appear here.</p>
        <Link
          to="/generate"
          className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all duration-200"
        >
          Generate Your First Kit
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">History</h1>
        <button
          onClick={handleClearAll}
          className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-all duration-200"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-3">
        {history.map((entry) => (
          <div key={entry.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div
              className="p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200"
              onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-navy">{entry.property.address}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
                    <span>{entry.property.city}, {entry.property.state}</span>
                    {entry.property.propertyType && (
                      <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">{entry.property.propertyType}</span>
                    )}
                    <span className="text-emerald-600 font-medium">{formatPrice(entry.property.listPrice)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(entry.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-all duration-200"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedId === entry.id ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {expandedId === entry.id && (
              <div className="border-t border-gray-100 p-4">
                <OutputSuite results={entry.results} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
