import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Sparkles } from 'lucide-react';
import axios from 'axios';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface Transaction {
  date: string;
  description: string;
  category: string;
  amount: number;
}

// Mock expense data — replace with real API calls when expense endpoints are built
const MOCK_TRANSACTIONS: Transaction[] = [
  { date: '12 Apr 2025', description: 'Groceries', category: 'Food', amount: 850.0 },
  { date: '11 Apr 2025', description: 'Metro card recharge', category: 'Transport', amount: 500.0 },
  { date: '10 Apr 2025', description: 'Electricity bill', category: 'Bills', amount: 2200.0 },
  { date: '09 Apr 2025', description: 'Doctor visit', category: 'Health', amount: 800.0 },
  { date: '08 Apr 2025', description: 'Netflix subscription', category: 'Entertainment', amount: 649.0 },
  { date: '07 Apr 2025', description: 'New shoes', category: 'Shopping', amount: 3200.0 },
  { date: '05 Apr 2025', description: 'Dinner with friends', category: 'Food', amount: 1450.0 },
  { date: '01 Apr 2025', description: 'Miscellaneous', category: 'Other', amount: 2801.75 },
];

const BADGE: Record<string, string> = {
  Food: 'bg-green-100 text-green-700',
  Transport: 'bg-slate-700 text-white',
  Bills: 'bg-blue-100 text-blue-600',
  Health: 'bg-red-100 text-red-500',
  Entertainment: 'bg-purple-100 text-purple-600',
  Shopping: 'bg-amber-100 text-amber-700',
  Other: 'bg-gray-100 text-gray-500',
};

const BAR_COLOR: Record<string, string> = {
  Shopping: '#d97706',
  Other: '#9ca3af',
  Food: '#16a34a',
  Bills: '#2563eb',
  Health: '#ef4444',
  Entertainment: '#7c3aed',
  Transport: '#f59e0b',
};

function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('spendly_token');
    if (!token) { navigate('/login'); return; }
    axios
      .get<ProfileData>('/api/users/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setProfile(res.data))
      .catch(err => {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem('spendly_token');
          localStorage.removeItem('spendly_user');
          navigate('/login');
        }
      });
  }, [navigate]);

  function handleSignOut() {
    localStorage.removeItem('spendly_token');
    localStorage.removeItem('spendly_user');
    navigate('/');
  }

  const totalSpent = MOCK_TRANSACTIONS.reduce((s, t) => s + t.amount, 0);

  const categoryTotals = Object.entries(
    MOCK_TRANSACTIONS.reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount;
      return acc;
    }, {})
  )
    .sort(([, a], [, b]) => b - a)
    .map(([category, total]) => ({ category, total }));

  const maxTotal = categoryTotals[0]?.total ?? 1;
  const topCategory = categoryTotals[0]?.category ?? '—';

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--page-bg)' }}>
      {/* Header */}
      <header className="px-8 py-4 max-w-5xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#2d2d2d] rotate-45 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white -rotate-45" />
          </div>
          <span className="font-semibold text-base">Spendly</span>
        </Link>
        <div className="flex items-center gap-5">
          {profile && (
            <span className="text-sm text-gray-700 font-medium">
              {profile.name.split(' ')[0]}
            </span>
          )}
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 hover:text-gray-900 transition"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="px-8 pb-12 max-w-5xl mx-auto space-y-4">
        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
          {profile ? (
            <div className="flex items-center gap-5">
              <div
                className="w-[68px] h-[68px] rounded-full flex-shrink-0 flex items-center justify-center text-white text-xl font-bold"
                style={{ backgroundColor: '#2e4d38' }}
              >
                {initials(profile.name)}
              </div>
              <div className="space-y-0.5">
                <p className="text-xl font-bold text-gray-900">{profile.name}</p>
                <p className="text-sm text-gray-500">{profile.email}</p>
                <p className="text-sm text-gray-400">
                  Member since{' '}
                  {new Date(profile.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <div className="w-[68px] h-[68px] rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
              <div className="space-y-2">
                <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          )}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4">
          {(
            [
              { label: 'TOTAL SPENT', value: fmt(totalSpent) },
              { label: 'TRANSACTIONS', value: String(MOCK_TRANSACTIONS.length) },
              { label: 'TOP CATEGORY', value: topCategory },
            ] as const
          ).map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
              <p className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-2">
                {label}
              </p>
              <p className="text-[32px] leading-tight font-bold text-gray-900 tabular-nums">{value}</p>
            </div>
          ))}
        </div>

        {/* Transactions + By Category */}
        <div className="grid gap-4 items-start" style={{ gridTemplateColumns: '1fr 280px' }}>
          {/* Recent Transactions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Recent Transactions</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['DATE', 'DESCRIPTION', 'CATEGORY', 'AMOUNT'].map((col, i) => (
                    <th
                      key={col}
                      className={`pb-3 text-[11px] uppercase tracking-widest text-gray-400 font-semibold ${i === 3 ? 'text-right' : 'text-left'}`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_TRANSACTIONS.map((tx, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 text-gray-500 whitespace-nowrap pr-6">{tx.date}</td>
                    <td className="py-3 text-gray-700 pr-6">{tx.description}</td>
                    <td className="py-3 pr-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${BADGE[tx.category] ?? 'bg-gray-100 text-gray-500'}`}
                      >
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3 text-right text-gray-700 font-medium tabular-nums">
                      {fmt(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* By Category */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-5">By Category</h2>
            <div className="space-y-4">
              {categoryTotals.map(({ category, total }) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gray-700">{category}</span>
                    <span className="text-sm text-gray-600 tabular-nums">{fmt(total)}</span>
                  </div>
                  <div className="h-[5px] bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(total / maxTotal) * 100}%`,
                        backgroundColor: BAR_COLOR[category] ?? '#9ca3af',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
