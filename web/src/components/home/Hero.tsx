import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white" id="hero">
      {/* Background decorations */}
      <div className="absolute inset-0 mesh-gradient" />
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-brand-100/40 blur-3xl animate-float" />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-brand-50/60 blur-3xl animate-float delay-300" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse-soft" />
            Websites &amp; AI Chatbots Showcase Platform
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6 animate-slide-up">
            Showcase Demo <span className="gradient-text">Websites &amp; AI Bots</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-slate-500 leading-relaxed mb-10 max-w-2xl mx-auto animate-slide-up delay-100">
            Showcase your live demo websites and intelligent AI chatbots to clients with interactive
            desktop, tablet, and mobile device previews.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-200">
            <Link
              to="/websites"
              id="view-websites-btn"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold shadow-lg hover:shadow-xl hover:from-brand-600 hover:to-brand-700 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              🌐 Explore Demo Sites
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              to="/bots"
              id="view-bots-btn"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold shadow-sm hover:shadow-md hover:border-brand-300 hover:text-brand-700 transition-all duration-300"
            >
              🤖 View AI Chatbots
            </Link>
          </div>
        </div>


      </div>
    </section>
  );
}
