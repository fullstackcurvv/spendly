import { Sparkles } from 'lucide-react';
import { Link } from 'react-router';

export default function TermsPage() {
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
        <h1 className="text-5xl font-bold mb-3">Terms and Conditions</h1>
        <p className="text-gray-500 text-sm mb-12">Last updated: May 5, 2026</p>

        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-bold mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing or using Spendly, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the service. Your continued use of Spendly constitutes acceptance of any updates or changes to these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">2. Use of Service</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Spendly is a personal finance tracking tool designed to help individuals log and understand their expenses. You agree to use the service only for lawful purposes and in a manner consistent with all applicable laws and regulations.
            </p>
            <p className="text-gray-600 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">3. User Data</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              You retain ownership of all financial data you enter into Spendly. By using the service, you grant us a limited license to store and process your data solely for the purpose of providing the service to you.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We do not sell your personal or financial data to third parties. Your expense data is used exclusively to power the features of the app. For more details on how we handle your data, please review our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">4. Limitations of Liability</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Spendly is provided "as is" without warranties of any kind, either express or implied. We do not guarantee that the service will be uninterrupted, error-free, or completely secure.
            </p>
            <p className="text-gray-600 leading-relaxed">
              To the fullest extent permitted by law, Spendly and its team shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of — or inability to use — the service, including but not limited to loss of data or financial decisions made based on information displayed in the app.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">5. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to update these Terms and Conditions at any time. When we make changes, we will update the "Last updated" date at the top of this page. We encourage you to review these terms periodically. Continued use of Spendly after any changes constitutes your acceptance of the new terms.
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
            <a href="#" className="text-gray-400 text-sm">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
