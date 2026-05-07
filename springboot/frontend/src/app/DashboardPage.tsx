import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Sparkles, LogOut } from 'lucide-react';

interface StoredUser {
  id: string;
  name: string;
  email: string;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('spendly_user');
    if (!raw) {
      navigate('/login');
      return;
    }
    try {
      setUser(JSON.parse(raw) as StoredUser);
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem('spendly_token');
    localStorage.removeItem('spendly_user');
    navigate('/');
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--page-bg)' }}>
      {/* Header */}
      <header className="px-6 py-4 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#2d2d2d] rotate-45 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white -rotate-45" />
          </div>
          <span className="font-semibold text-lg">Spendly</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: 'color-mix(in srgb, var(--brand-green) 15%, white)' }}
          >
            <Sparkles className="w-6 h-6" style={{ color: 'var(--brand-green)' }} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome back, {user.name}!</h1>
          <p className="text-gray-500 text-sm">
            Your expense dashboard is coming soon. You're all set up and ready to track every rupee.
          </p>
        </div>
      </main>
    </div>
  );
}
