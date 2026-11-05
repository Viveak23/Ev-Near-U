import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Zap,
  Search,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles,
  Users,
  ChevronRight,
  BatteryCharging,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  HeartHandshake,
  HelpCircle
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [searchCity, setSearchCity] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchCity.trim()) {
      navigate(`/find-chargers?searchQuery=${encodeURIComponent(searchCity.trim())}`);
    } else {
      navigate('/find-chargers');
    }
  };

  return (
    <div className="space-y-20 sm:space-y-28">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Background glow & subtle tech accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-100/60 via-teal-50/30 to-transparent blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>India's #1 Peer-to-Peer EV Charging Marketplace</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
              Charge Anywhere.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                Share Everywhere.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
              Connect with local EV charger owners to book private home chargers when travelling. Or share your home EV charger to earn money while empowering zero-emission mobility.
            </p>

            {/* Search Bar Input */}
            <div className="pt-4 max-w-xl mx-auto">
              <form
                onSubmit={handleSearchSubmit}
                className="bg-white p-2 sm:p-2.5 rounded-2xl shadow-xl border border-slate-200 flex flex-col sm:flex-row gap-2"
              >
                <div className="flex-1 flex items-center gap-3 px-3">
                  <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
                  <input
                    type="text"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    placeholder="Enter city, pin, or area (e.g. Koramangala, Bengaluru)..."
                    className="w-full text-sm font-medium bg-transparent focus:outline-none text-slate-800 placeholder-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-2 shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Chargers</span>
                </button>
              </form>

              {/* Popular quick cities */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-400">Popular:</span>
                {['Bengaluru', 'Indiranagar', 'Koramangala', 'HSR Layout', 'Whitefield', 'Hyderabad'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => navigate(`/find-chargers?searchQuery=${encodeURIComponent(c)}`)}
                    className="hover:text-emerald-600 hover:underline"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Dual CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/find-chargers"
                className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Find Nearby Chargers</span>
              </Link>
              <Link
                to="/post-charger"
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Host Your Home Charger</span>
              </Link>
            </div>

            {/* Trust Highlights */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center border-t border-slate-200">
              <div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900">5,000+</p>
                <p className="text-xs text-slate-500 font-medium">Private Bays Available</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900">40% Cheaper</p>
                <p className="text-xs text-slate-500 font-medium">Than Commercial DC</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900">₹15,000+</p>
                <p className="text-xs text-slate-500 font-medium">Avg Monthly Host Income</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900">99.8%</p>
                <p className="text-xs text-slate-500 font-medium">Booking Reliability</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Simple 3-Step Experience
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
            How EvNearU Works
          </h2>
          <p className="text-sm text-slate-600 mt-3">
            Designed for convenience whether you are seeking a quick charge or renting out your wallbox.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg mb-6">
              1
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Discover & Reserve
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Find verified chargers nearby on the interactive map. Check connector compatibility, power rating, and live availability. Reserve your slot with guaranteed price transparency.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs relative">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-black text-lg mb-6">
              2
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Charge with Live Telemetry
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Arrive at the host's bay, plug in, and monitor charging in real time. Track battery SOC, live kW output, and elapsed time right from your smartphone.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs relative">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-black text-lg mb-6">
              3
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Automated Bill & Host Payout
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              When charging stops, the bill is calculated automatically based on measured energy consumed. Pay seamlessly via UPI or Card, and hosts receive automated earnings payouts.
            </p>
          </div>

        </div>
      </section>

      {/* 3. BENEFITS: HOSTS & EV DRIVERS */}
      <section className="bg-slate-900 text-white py-20 rounded-3xl mx-4 sm:mx-8">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* For Drivers */}
            <div className="space-y-6">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                For EV Drivers
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Never Experience Range Anxiety Again.
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Commercial public charging hubs often have long queues, broken guns, or high peak tariffs. EvNearU brings you access to thousands of residential chargers in quiet neighborhoods.
              </p>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Guaranteed slot reservations without queueing</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Up to 40% cheaper than commercial fast charging</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Exact measured billing with transparent GST receipts</span>
                </div>
              </div>

              <Link
                to="/find-chargers"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition"
              >
                <span>Find a Charger Near You</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* For Hosts */}
            <div className="bg-charcoal-800 p-8 rounded-3xl border border-charcoal-700 space-y-6">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                For Charger Owners
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Turn Your Wallbox Into A Passive Income Stream.
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Your home charger sits idle 85% of the day. Share your charger with trusted, verified EV owners while you are away or overnight, and earn handsome monthly payouts.
              </p>

              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span>Set your own price per kWh and parking hours</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span>Full privacy: exact home address only revealed on booking</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span>Automated bank payouts with 0 hassle</span>
                </div>
              </div>

              <Link
                to="/post-charger"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm transition"
              >
                <span>List Your Charger Today</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* 4. SAFETY & TRUST SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Trust & Security First
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
            Safe, Transparent & Reliable
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
          
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Verified Users & Hosts
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every host and driver is verified via OTP phone confirmation and KYC vehicle registration before accessing booking slots.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Precise Metered Billing
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our automated billing engine calculates charges strictly according to the formula: Energy Consumed × Price per kWh + configured time fees. No hidden markups.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              24/7 Roadside Assistance
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Facing trouble reaching a charger or experiencing a trip? Our 24/7 roadside assistance hotline is always ready to assist drivers anywhere in India.
            </p>
          </div>

        </div>
      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Got Questions?
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4 text-sm">
          {[
            {
              q: 'Can I both host my home charger and book other chargers with one account?',
              a: 'Yes, absolutely! Every EvNearU account has dual capabilities built in. You do not need two separate accounts. You can easily toggle between Driver Mode and Host Mode right from the navigation bar.'
            },
            {
              q: 'Is my exact home address visible to everyone on the internet?',
              a: 'No. To protect host privacy, search results only display the approximate neighborhood and city. Your exact street address and contact phone are only revealed to an authorized driver after their booking is confirmed.'
            },
            {
              q: 'How does the billing and payment work?',
              a: 'Charging costs are calculated using the exact formula: Energy Consumed (kWh) × Price per kWh + Optional Hourly Fee + 5% Platform Fee + 18% GST. When you stop charging, you pay instantly via UPI or Card, and hosts receive their net earnings directly.'
            },
            {
              q: 'What connectors and vehicle brands are supported?',
              a: 'EvNearU supports all standard Indian EV connectors including CCS2 (Tata Nexon, MG ZS, Hyundai Ioniq, BYD, Mahindra), Type 2 AC, CHAdeMO, Tesla NACS, and 16A 3-Pin sockets for electric scooters and portable EV chargers.'
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <h3 className="font-bold text-base text-slate-900 mb-2">
                {item.q}
              </h3>
              <p className="text-slate-600 leading-relaxed text-xs">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CALL TO ACTION FOOTER BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-black">
            Join the Clean Energy Charging Revolution
          </h2>
          <p className="text-emerald-100 max-w-xl mx-auto text-sm sm:text-base">
            Start saving on charging costs or earn thousands every month sharing your charger. It takes only 2 minutes to get started.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-emerald-900 hover:bg-slate-100 rounded-xl font-bold text-sm shadow-md transition"
            >
              Create Free Account
            </Link>
            <Link
              to="/find-chargers"
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-800/80 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm transition"
            >
              Explore Nearby Chargers
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
