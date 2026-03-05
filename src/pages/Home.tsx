import { Link } from 'react-router-dom';
import DemoOutput from '../components/DemoOutput';

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-navy leading-tight mb-4">
            Your Listing, Fully Marketed in{' '}
            <span className="text-emerald-600">30 Seconds</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
            MLS description, social posts, email, flyer, and video script — one form, five outputs.
          </p>
          <Link
            to="/generate"
            className="inline-block px-8 py-4 bg-emerald-600 text-white rounded-lg text-lg font-bold hover:bg-emerald-700 transition-all duration-200 shadow-sm"
          >
            Start Generating Free
          </Link>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-12 px-4 bg-[#f8faf9]">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="font-bold text-navy text-lg">123 Maple Drive, Denver, CO</h3>
              <div className="flex gap-2 text-sm text-gray-500">
                <span>4 BD</span>
                <span>|</span>
                <span>3 BA</span>
                <span>|</span>
                <span className="text-emerald-600 font-semibold">$625,000</span>
              </div>
            </div>
          </div>
          <DemoOutput />
          <p className="text-center text-sm text-gray-400 mt-4">
            This is what you'll get for every listing.
          </p>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-navy text-center mb-10">Why agents love ListingKit</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-bold text-navy mb-2">Fair Housing Compliant</h3>
              <p className="text-sm text-gray-500">Every output follows Fair Housing guidelines. No discriminatory language, ever.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-navy mb-2">5 Outputs, 1 Form</h3>
              <p className="text-sm text-gray-500">MLS, social, email, flyer, and video script — all generated in parallel.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="font-bold text-navy mb-2">No Setup Required</h3>
              <p className="text-sm text-gray-500">No API keys, no configuration. Just sign up and start generating instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-[#f8faf9]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-navy text-center mb-10">How It Works</h2>
          <div className="space-y-6">
            {[
              { step: '1', title: 'Enter your property details', desc: 'Address, price, features, and your branding — just fill in the form.' },
              { step: '2', title: 'AI generates your marketing kit', desc: 'Five outputs are created in parallel in under 15 seconds.' },
              { step: '3', title: 'Copy, download, and post', desc: 'Copy any output to your clipboard or download the flyer as a PDF.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 items-start">
                <div className="w-10 h-10 flex-shrink-0 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-bold text-navy">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-navy mb-4">Ready to market your next listing?</h2>
        <Link
          to="/generate"
          className="inline-block px-8 py-4 bg-emerald-600 text-white rounded-lg text-lg font-bold hover:bg-emerald-700 transition-all duration-200"
        >
          Start Generating Free
        </Link>
        <p className="text-sm text-gray-400 mt-4">3 free generations, then $9.99/month</p>
      </section>
    </div>
  );
}
