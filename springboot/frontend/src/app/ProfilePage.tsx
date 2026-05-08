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

interface ExpenseTransaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
}

interface ExpenseSummary {
  totalSpent: number;
  transactionCount: number;
  topCategory: string;
}

interface ExpenseCategoryBreakdown {
  category: string;
  total: number;
  percentage: number;
}

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

function fmtDate(raw: string) {
  return new Date(raw).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function toDisplayName(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [expenses, setExpenses] = useState<ExpenseTransaction[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary>({ totalSpent: 0, transactionCount: 0, topCategory: '—' });
  const [categories, setCategories] = useState<ExpenseCategoryBreakdown[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('spendly_token');
    if (!token) { navigate('/login'); return; }
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      axios.get<ProfileData>('/api/users/me', { headers }),
      axios.get<ExpenseTransaction[]>('/api/expenses', { headers }),
      axios.get<ExpenseSummary>('/api/expenses/summary', { headers }),
      axios.get<ExpenseCategoryBreakdown[]>('/api/expenses/categories', { headers }),
    ])
      .then(([profileRes, expensesRes, summaryRes, categoriesRes]) => {
        setProfile(profileRes.data);
        setExpenses(expensesRes.data);
        setSummary(summaryRes.data);
        setCategories(categoriesRes.data);
      })
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

  const maxCategoryTotal = categories[0]?.total ?? 1;

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
              { label: 'TOTAL SPENT', value: fmt(summary.totalSpent) },
              { label: 'TRANSACTIONS', value: String(summary.transactionCount) },
              { label: 'TOP CATEGORY', value: toDisplayName(summary.topCategory) },
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
                {expenses.map((tx) => {
                  const displayCategory = toDisplayName(tx.category);
                  return (
                    <tr key={tx.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-3 text-gray-500 whitespace-nowrap pr-6">{fmtDate(tx.date)}</td>
                      <td className="py-3 text-gray-700 pr-6">{tx.description}</td>
                      <td className="py-3 pr-6">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${BADGE[displayCategory] ?? 'bg-gray-100 text-gray-500'}`}
                        >
                          {displayCategory}
                        </span>
                      </td>
                      <td className="py-3 text-right text-gray-700 font-medium tabular-nums">
                        {fmt(tx.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* By Category */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-5">By Category</h2>
            <div className="space-y-4">
              {categories.map(({ category, total }) => {
                const displayCategory = toDisplayName(category);
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-gray-700">{displayCategory}</span>
                      <span className="text-sm text-gray-600 tabular-nums">{fmt(total)}</span>
                    </div>
                    <div className="h-[5px] bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(total / maxCategoryTotal) * 100}%`,
                          backgroundColor: BAR_COLOR[displayCategory] ?? '#9ca3af',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
