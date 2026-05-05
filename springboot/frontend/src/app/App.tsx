import { Sparkles, Receipt, TrendingUp, Calendar } from 'lucide-react';
import { BrowserRouter, Routes, Route, Link } from 'react-router';
import TermsPage from './TermsPage';
import PrivacyPolicyPage from './PrivacyPolicyPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/policy" element={<PrivacyPolicyPage />} />
      </Routes>
    </BrowserRouter>
  );
}

function LandingPage() {
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
          <button className="text-sm px-4 py-2 text-gray-700 hover:text-gray-900">
            Sign in
          </button>
          <button className="text-sm px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800">
            Get started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 pt-20 pb-32 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs tracking-[0.15em] text-gray-600 mb-6 font-medium">
              PERSONAL FINANCE TRACKER
            </div>
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              Know where your{' '}
              <span className="italic font-serif">money goes</span>
            </h1>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed max-w-md">
              Log expenses, understand your spending patterns, and take control of your financial life — one transaction at a time.
            </p>
            <div className="flex items-center gap-6">
              <button className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800">
                Start tracking free
              </button>
              <button className="text-gray-700 hover:text-gray-900">
                Sign in
              </button>
            </div>
          </div>

          {/* Spending Card */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="flex justify-between items-start mb-8">
              <span className="text-xs text-gray-500 tracking-wider">MARCH 2026</span>
              <span className="text-3xl font-bold">₹12,450</span>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Bills</span>
                  <span className="text-gray-500">₹4,500</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#2d5f2e] rounded-full" style={{ width: '72%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Food</span>
                  <span className="text-gray-500">₹3,200</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#d4a04c] rounded-full" style={{ width: '51%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Health</span>
                  <span className="text-gray-500">₹2,050</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#6b7ca8] rounded-full" style={{ width: '33%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Transport</span>
                  <span className="text-gray-500">₹1,800</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#5d4157] rounded-full" style={{ width: '29%' }}></div>
                </div>
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
          <button className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800">
            Create free account
          </button>
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
    </div>
  );
}
