import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Sparkles } from 'lucide-react';
import axios from 'axios';

interface FormState {
  email: string;
  password: string;
}

interface FieldErrors {
  email?: string;
  password?: string;
}

function validateForm(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!form.password) {
    errors.password = 'Password is required.';
  }
  return errors;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    setServerError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setServerError('');

    try {
      const { data } = await axios.post('/api/auth/login', {
        email: form.email,
        password: form.password,
      });
      localStorage.setItem('spendly_token', data.token);
      localStorage.setItem('spendly_user', JSON.stringify({ id: data.id, name: data.name, email: data.email }));
      navigate('/dashboard');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setServerError('Invalid email or password.');
        } else {
          setServerError('Something went wrong. Please try again.');
        }
      } else {
        setServerError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--page-bg)' }}>
      {/* Header */}
      <header className="px-6 py-4 max-w-7xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <div className="w-5 h-5 bg-[#2d2d2d] rotate-45 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white -rotate-45" />
          </div>
          <span className="font-semibold text-lg">Spendly</span>
        </Link>
      </header>

      {/* Form card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold mb-1">Sign in to Spendly</h1>
          <p className="text-gray-500 text-sm mb-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium" style={{ color: 'var(--brand-green)' }}>
              Register
            </Link>
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 text-sm rounded-lg border bg-gray-50 focus:outline-none focus:ring-2 transition"
                style={{
                  borderColor: fieldErrors.email ? 'var(--destructive)' : 'var(--border)',
                  // @ts-expect-error CSS custom property
                  '--tw-ring-color': 'var(--brand-green)',
                }}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs" style={{ color: 'var(--destructive)' }}>
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                placeholder="Your password"
                className="w-full px-3 py-2.5 text-sm rounded-lg border bg-gray-50 focus:outline-none focus:ring-2 transition"
                style={{
                  borderColor: fieldErrors.password ? 'var(--destructive)' : 'var(--border)',
                  // @ts-expect-error CSS custom property
                  '--tw-ring-color': 'var(--brand-green)',
                }}
              />
              {fieldErrors.password && (
                <p className="mt-1 text-xs" style={{ color: 'var(--destructive)' }}>
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {serverError && (
              <p className="text-xs text-center" style={{ color: 'var(--destructive)' }}>
                {serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-60 transition"
              style={{ backgroundColor: 'var(--brand-green)' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
