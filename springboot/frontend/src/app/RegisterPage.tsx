import { useState } from 'react';
import { Link } from 'react-router';
import { Sparkles } from 'lucide-react';
import axios from 'axios';

interface FormState {
  name: string;
  email: string;
  password: string;
}

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
}

function validateForm(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.name.trim()) errors.name = 'Name is required.';
  if (!form.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!form.password) {
    errors.password = 'Password is required.';
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }
  return errors;
}

export default function RegisterPage() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
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
      await axios.post('/api/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setSuccess(true);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          setFieldErrors(prev => ({ ...prev, email: 'Email already in use.' }));
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
          {success ? (
            <div className="text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'color-mix(in srgb, var(--brand-green) 15%, white)' }}
              >
                <span className="text-2xl" style={{ color: 'var(--brand-green)' }}>✓</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Account created!</h2>
              <p className="text-gray-500 mb-6 text-sm">
                You're all set. Sign in to start tracking your expenses.
              </p>
              <Link
                to="/"
                className="inline-block px-6 py-2.5 text-sm font-semibold text-white rounded-lg"
                style={{ backgroundColor: 'var(--brand-green)' }}
              >
                Back to home
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-1">Create your account</h1>
              <p className="text-gray-500 text-sm mb-6">
                Already have one?{' '}
                <Link to="/" className="font-medium" style={{ color: 'var(--brand-green)' }}>
                  Sign in
                </Link>
              </p>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full px-3 py-2.5 text-sm rounded-lg border bg-gray-50 focus:outline-none focus:ring-2 transition"
                    style={{
                      borderColor: fieldErrors.name ? 'var(--destructive)' : 'var(--border)',
                      // @ts-expect-error CSS custom property
                      '--tw-ring-color': 'var(--brand-green)',
                    }}
                  />
                  {fieldErrors.name && (
                    <p className="mt-1 text-xs" style={{ color: 'var(--destructive)' }}>
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

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
                    autoComplete="new-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 8 characters"
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
                  {loading ? 'Creating account…' : 'Create account'}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
