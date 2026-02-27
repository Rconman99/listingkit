import { SAMPLE_RESULTS } from '../data/sampleOutput';
import OutputSuite from './OutputSuite';

export default function DemoOutput() {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-4 text-center">
        Sample output for 123 Maple Drive, Denver, CO
      </p>
      <OutputSuite results={SAMPLE_RESULTS} />
    </div>
  );
}
