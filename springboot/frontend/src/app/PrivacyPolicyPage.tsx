import { Sparkles } from 'lucide-react';
import { Link } from 'react-router';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f8f6f4]">
      <header className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#2d2d2d] rotate-45 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white -rotate-45" />
          </div>
          <span className="font-semibold text-lg">Spendly</span>
        </Link>
      </header>

      <main className="px-6 py-16 max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold mb-3">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-12">Last updated: May 5, 2026</p>

        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-bold mb-3">1. Acceptance of Privacy Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              By using Spendly, you acknowledge that you have read and understood this Privacy Policy and agree to the collection and use of your information as described herein. If you do not agree, please discontinue use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">2. Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              We collect information you provide directly when you create an account and use the service, including your name, email address, and the expense data you log (amounts, categories, dates, and descriptions).
            </p>
            <p className="text-gray-600 leading-relaxed">
              We also collect basic usage data — such as pages visited and features used — to help us understand how the service is being used and where we can improve it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">3. How We Use Your Data</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Your data is used solely to provide and improve the Spendly service. This includes displaying your expense history, generating spending summaries, and personalizing your experience within the app.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We do not sell, rent, or share your personal or financial data with third parties for marketing purposes. Data may be shared only where required by law or to protect the rights and safety of our users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">4. Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We take reasonable technical and organizational measures to protect your data from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security. You are responsible for keeping your account credentials confidential.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">5. Changes to Privacy Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. When we do, we will revise the "Last updated" date at the top of this page. We encourage you to review this policy periodically. Continued use of Spendly after any changes constitutes your acceptance of the updated policy.
            </p>
          </section>
        </div>
      </main>

      <footer className="bg-[#1a1a1a] text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-5 h-5 bg-white rotate-45 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-[#1a1a1a] -rotate-45" />
            </div>
            <span className="font-semibold text-lg">Spendly</span>
          </div>
          <p className="text-gray-400 text-sm">Track every rupee. Own your finances.</p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Link to="/terms" className="text-gray-400 text-sm">Terms and Conditions</Link>
            <Link to="/policy" className="text-gray-400 text-sm">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
