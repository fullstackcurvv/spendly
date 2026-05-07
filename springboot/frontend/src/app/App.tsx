import { Sparkles, Receipt, TrendingUp, Calendar, X } from 'lucide-react';
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router';
import TermsPage from './TermsPage';
import PrivacyPolicyPage from './PrivacyPolicyPage';
import RegisterPage from './RegisterPage';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/policy" element={<PrivacyPolicyPage />} />
      </Routes>
    </BrowserRouter>
  );
}

function LandingPage() {
  const [showModal, setShowModal] = useState(false);
  return (
    <div className="min-h-screen bg-[#f8f6f4]">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#2d2d2d] rotate-45 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white -rotate-45" />
          </div>
          <span className="font-semibold text-lg">Spendly</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm px-4 py-2 text-gray-700 hover:text-gray-900">
            Sign in
          </Link>
          <Link to="/register" className="text-sm px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800">
            Get started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 pt-16 pb-24 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-200 bg-green-50 text-green-700 text-sm mb-8">
          <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
          Free to use · No credit card needed
        </div>

        {/* Headline */}
        <h1 className="text-6xl font-bold leading-tight mb-6">
          Track every rupee.<br />
          <span className="text-[#2ca85a]">Know where it goes.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          Spendly helps you log expenses, spot patterns, and stay on budget — without the spreadsheet headache.
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <Link to="/register" className="px-7 py-3.5 bg-black text-white font-semibold rounded-xl hover:bg-gray-800">
            Create free account
          </Link>
          <button
            className="px-7 py-3.5 bg-black text-white font-semibold rounded-xl hover:bg-gray-800"
            onClick={() => setShowModal(true)}
          >
            See how it works
          </button>
        </div>

        {/* Browser Mockup */}
        <div className="bg-[#f0f0ee] rounded-2xl p-6 border border-gray-200 shadow-sm text-left">
          <div className="flex items-center gap-1.5 mb-5">
            <span className="w-3 h-3 rounded-full bg-red-400"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
            <span className="w-3 h-3 rounded-full bg-green-400"></span>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-gray-400 text-xs mb-2">This month</p>
              <p className="text-2xl font-bold mb-1">₹18,240</p>
              <p className="text-red-500 text-xs font-medium">+12% vs last</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-gray-400 text-xs mb-2">Budget left</p>
              <p className="text-2xl font-bold mb-1">₹6,760</p>
              <p className="text-[#2ca85a] text-xs font-medium">43% remaining</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-gray-400 text-xs mb-2">Transactions</p>
              <p className="text-2xl font-bold mb-1">34</p>
              <p className="text-gray-400 text-xs">this month</p>
            </div>
          </div>

          {/* Category Bars */}
          <div className="bg-white rounded-xl px-5 py-4 border border-gray-100 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 w-12 text-right">Food</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-400 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 w-12 text-right">Travel</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: '55%' }}></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 w-12 text-right">Bills</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-400 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 pb-32 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
              <Receipt className="w-5 h-5 text-gray-700" />
            </div>
            <h3 className="text-xl font-bold mb-3">Log expenses instantly</h3>
            <p className="text-gray-600 leading-relaxed">
              Add any expense in seconds. Category, amount, date, description — all in one simple form.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
              <TrendingUp className="w-5 h-5 text-gray-700" />
            </div>
            <h3 className="text-xl font-bold mb-3">Understand your patterns</h3>
            <p className="text-gray-600 leading-relaxed">
              See exactly where your money goes with category breakdowns and monthly summaries.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
              <Calendar className="w-5 h-5 text-gray-700" />
            </div>
            <h3 className="text-xl font-bold mb-3">Filter by time period</h3>
            <p className="text-gray-600 leading-relaxed">
              View your spending for any date range — last week, last month, or a custom period.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-4">Ready to take control?</h2>
          <p className="text-gray-600 mb-8">
            Join thousands of people who track their expenses with Spendly.
          </p>
          <Link to="/register" className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800">
            Create free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-5 h-5 bg-white rotate-45 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-[#1a1a1a] -rotate-45" />
            </div>
            <span className="font-semibold text-lg">Spendly</span>
          </div>
          <p className="text-gray-400 text-sm">
            Track every rupee. Own your finances.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Link to="/terms" className="text-gray-400 text-sm">Terms and Conditions</Link>
            <Link to="/policy" className="text-gray-400 text-sm">Privacy Policy</Link>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full max-w-3xl mx-4 bg-black rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white"
              onClick={() => setShowModal(false)}
            >
              <X className="w-4 h-4" />
            </button>
            <div className="aspect-video">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/-Lt-ntUDj-g?list=PLKnIA16_RmvaYH3poI0oJvbDF4zEvpq8W&index=4&autoplay=1"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
