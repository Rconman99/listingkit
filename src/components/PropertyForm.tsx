import { useState, FormEvent } from 'react';
import { useAppStore } from '../store/appStore';
import { PropertyInput } from '../lib/types';
import { formatPrice } from '../lib/utils';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM',
  'NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA',
  'WV','WI','WY',
];

const TONES = ['Professional', 'Luxury', 'Warm & Inviting', 'Modern & Sleek', 'Welcoming'];
const PROPERTY_TYPES = ['Single Family', 'Condo/Co-op', 'Townhouse', 'Multi-Family', 'Land', 'Commercial'];

export default function PropertyForm() {
  const store = useAppStore();

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [propertyType, setPropertyType] = useState('Single Family');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [squareFootage, setSquareFootage] = useState('');
  const [lotSize, setLotSize] = useState('');
  const [yearBuilt, setYearBuilt] = useState('');
  const [listPrice, setListPrice] = useState('');
  const [mlsCharLimit, setMlsCharLimit] = useState('');
  const [keyFeatures, setKeyFeatures] = useState('');
  const [recentUpgrades, setRecentUpgrades] = useState('');
  const [neighborhoodHighlights, setNeighborhoodHighlights] = useState('');
  const [tone, setTone] = useState(store.defaultTone || 'Professional');
  const [agentName, setAgentName] = useState(store.agentName);
  const [brokerageName, setBrokerageName] = useState(store.brokerageName);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!address.trim()) errs.address = 'Address is required';
    if (!city.trim()) errs.city = 'City is required';
    if (!state.trim()) errs.state = 'State is required';
    if (!zip.trim()) errs.zip = 'ZIP code is required';
    if (!listPrice.trim()) errs.listPrice = 'List price is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const property: PropertyInput = {
      address: address.trim(),
      city: city.trim(),
      state,
      zip: zip.trim(),
      propertyType,
      bedrooms: bedrooms.trim(),
      bathrooms: bathrooms.trim(),
      squareFootage: squareFootage.trim(),
      lotSize: lotSize.trim(),
      yearBuilt: yearBuilt.trim(),
      listPrice: listPrice.trim(),
      mlsCharLimit: mlsCharLimit.trim(),
      keyFeatures: keyFeatures.trim(),
      recentUpgrades: recentUpgrades.trim(),
      neighborhoodHighlights: neighborhoodHighlights.trim(),
      tone,
      agentName: agentName.trim(),
      brokerageName: brokerageName.trim(),
    };

    store.generate(property);
  };

  const inputClass = (field: string) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
      errors[field] ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-300'
    }`;

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-8">
      {/* The Property */}
      <section>
        <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-4">The Property</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass('address')} placeholder="123 Main Street" />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass('city')} placeholder="Denver" />
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <select value={state} onChange={(e) => setState(e.target.value)} className={inputClass('state')}>
                <option value="">Select</option>
                {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ZIP *</label>
              <input type="text" value={zip} onChange={(e) => setZip(e.target.value)} className={inputClass('zip')} placeholder="80220" />
              {errors.zip && <p className="text-red-500 text-xs mt-1">{errors.zip}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
            <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className={inputClass('')}>
              {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* The Numbers */}
      <section>
        <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-4">The Numbers</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beds</label>
              <input type="number" min="0" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className={inputClass('')} placeholder="4" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Baths</label>
              <input type="number" min="0" step="0.5" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} className={inputClass('')} placeholder="3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sq Ft</label>
              <input type="text" value={squareFootage} onChange={(e) => setSquareFootage(e.target.value)} className={inputClass('')} placeholder="2,450" />
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">List Price *</label>
              <input type="text" value={listPrice} onChange={(e) => setListPrice(e.target.value)} className={inputClass('listPrice')} placeholder="625000" />
              {errors.listPrice && <p className="text-red-500 text-xs mt-1">{errors.listPrice}</p>}
              {listPrice && <p className="text-emerald-600 text-xs mt-1 font-medium">{formatPrice(listPrice)}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
              <input type="number" value={yearBuilt} onChange={(e) => setYearBuilt(e.target.value)} className={inputClass('')} placeholder="2018" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lot Size</label>
              <input type="text" value={lotSize} onChange={(e) => setLotSize(e.target.value)} className={inputClass('')} placeholder="0.18 acres" />
            </div>
          </div>
        </div>
      </section>

      {/* The Story */}
      <section>
        <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-1">The Story</h3>
        <p className="text-xs text-gray-400 mb-4">This is where your listing stands out</p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Key Features</label>
            <textarea value={keyFeatures} onChange={(e) => setKeyFeatures(e.target.value)} className={inputClass('')} rows={3} placeholder="granite counters, hardwood floors, mountain views" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recent Upgrades</label>
            <textarea value={recentUpgrades} onChange={(e) => setRecentUpgrades(e.target.value)} className={inputClass('')} rows={2} placeholder="new roof 2024, remodeled kitchen" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Neighborhood</label>
            <textarea value={neighborhoodHighlights} onChange={(e) => setNeighborhoodHighlights(e.target.value)} className={inputClass('')} rows={2} placeholder="close to downtown, top-rated schools" />
          </div>
        </div>
      </section>

      {/* Your Brand */}
      <section>
        <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-4">Your Brand</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
              <input type="text" value={agentName} onChange={(e) => setAgentName(e.target.value)} className={inputClass('')} placeholder="Jane Smith" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brokerage</label>
              <input type="text" value={brokerageName} onChange={(e) => setBrokerageName(e.target.value)} className={inputClass('')} placeholder="ABC Realty" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tone</label>
            <select value={tone} onChange={(e) => setTone(e.target.value)} className={inputClass('')}>
              {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Advanced */}
      <section>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-all duration-200"
        >
          <svg className={`w-4 h-4 transition-transform duration-200 ${showAdvanced ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Advanced
        </button>
        {showAdvanced && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">MLS Character Limit</label>
            <input type="number" value={mlsCharLimit} onChange={(e) => setMlsCharLimit(e.target.value)} className={inputClass('')} placeholder="1500" />
            <p className="text-xs text-gray-400 mt-1">Leave blank for 150-250 words, or enter your MLS system's character limit</p>
          </div>
        )}
      </section>

      {/* Submit */}
      <button
        type="submit"
        className="w-full py-4 bg-emerald-600 text-white rounded-lg text-lg font-bold hover:bg-emerald-700 transition-all duration-200 shadow-sm"
      >
        Generate Marketing Kit →
      </button>
    </form>
  );
}
