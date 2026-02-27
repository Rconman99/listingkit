import { exportFlyerPdf } from '../lib/export';
import { PropertyInput } from '../lib/types';

interface Props {
  flyerText: string;
  property: PropertyInput;
}

export default function PdfExport({ flyerText, property }: Props) {
  return (
    <button
      onClick={() => exportFlyerPdf(flyerText, property)}
      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all duration-200"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Download PDF Flyer
    </button>
  );
}
