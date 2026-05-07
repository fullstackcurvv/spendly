import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Sparkles, LogOut } from 'lucide-react';
import axios from 'axios';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface NameForm {
  name: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [nameForm, setNameForm] = useState<NameForm>({ name: '' });
  const [nameError, setNameError] = useState('');
  const [nameSuccess, setNameSuccess] = useState('');
  const [nameSaving, setNameSaving] = useState(false);

  const [pwForm, setPwForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwErrors, setPwErrors] = useState<Partial<PasswordForm>>({});
  const [pwServerError, setPwServerError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  function authHeader() {
    const token = localStorage.getItem('spendly_token');
    return { Authorization: `Bearer ${token}` };
  }

  function handleUnauthorized() {
    localStorage.removeItem('spendly_token');
    localStorage.removeItem('spendly_user');
    navigate('/login');
  }

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data } = await axios.get<ProfileData>('/api/users/me', {
          headers: authHeader(),
        });
        setProfile(data);
        setNameForm({ name: data.name });
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          handleUnauthorized();
        }
      } finally {
        setLoadingProfile(false);
      }
    }
    fetchProfile();
  }, []);

  function handleLogout() {
    localStorage.removeItem('spendly_token');
    localStorage.removeItem('spendly_user');
    navigate('/');
  }

  async function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nameForm.name.trim()) {
      setNameError('Name is required.');
      return;
    }
    setNameSaving(true);
    setNameError('');
    setNameSuccess('');
    try {
      const { data } = await axios.patch<ProfileData>('/api/users/me', nameForm, {
        headers: authHeader(),
      });
      setProfile(data);
      setNameForm({ name: data.name });
      const stored = localStorage.getItem('spendly_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem('spendly_user', JSON.stringify({ ...parsed, name: data.name }));
      }
      setNameSuccess('Name updated successfully.');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          handleUnauthorized();
        } else {
          setNameError('Something went wrong. Please try again.');
        }
      }
    } finally {
      setNameSaving(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors: Partial<PasswordForm> = {};
    if (!pwForm.currentPassword) errors.currentPassword = 'Current password is required.';
    if (!pwForm.newPassword) {
      errors.newPassword = 'New password is required.';
    } else if (pwForm.newPassword.length < 8) {
      errors.newPassword = 'New password must be at least 8 characters.';
    }
    if (!pwForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password.';
    } else if (pwForm.newPassword !== pwForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    if (Object.keys(errors).length > 0) {
      setPwErrors(errors);
      return;
    }

    setPwSaving(true);
    setPwErrors({});
    setPwServerError('');
    setPwSuccess('');
    try {
      await axios.patch('/api/users/me/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      }, {
        headers: authHeader(),
      });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwSuccess('Password updated successfully.');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          handleUnauthorized();
        } else {
          setPwServerError(err.response?.data?.error ?? 'Something went wrong. Please try again.');
        }
      }
    } finally {
      setPwSaving(false);
    }
  }

  const inputClass = 'w-full px-3 py-2.5 text-sm rounded-lg border bg-gray-50 focus:outline-none focus:ring-2 transition';
  const inputStyle = (hasError: boolean) => ({
    borderColor: hasError ? 'var(--destructive)' : 'var(--border)',
    // @ts-expect-error CSS custom property
    '--tw-ring-color': 'var(--brand-green)',
  });

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
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="text-sm px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition"
          >
            Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-10 max-w-lg mx-auto w-full space-y-6">
        <h1 className="text-2xl font-bold">My Profile</h1>

        {/* Card 1 — Account Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold mb-4">Account Info</h2>
          {loadingProfile ? (
            <div className="space-y-3">
              <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
              <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
            </div>
          ) : profile ? (
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Name</dt>
                <dd className="font-medium">{profile.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Email</dt>
                <dd className="font-medium">{profile.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Member since</dt>
                <dd className="font-medium">
                  {new Date(profile.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </dd>
              </div>
            </dl>
          ) : null}
        </div>

        {/* Card 2 — Edit Name */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold mb-4">Edit Name</h2>
          <form onSubmit={handleNameSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Display name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={nameForm.name}
                onChange={e => {
                  setNameForm({ name: e.target.value });
                  setNameError('');
                  setNameSuccess('');
                }}
                className={inputClass}
                style={inputStyle(!!nameError)}
              />
              {nameError && (
                <p className="mt-1 text-xs" style={{ color: 'var(--destructive)' }}>{nameError}</p>
              )}
              {nameSuccess && (
                <p className="mt-1 text-xs" style={{ color: 'var(--brand-green)' }}>{nameSuccess}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={nameSaving}
              className="w-full py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-60 transition"
              style={{ backgroundColor: 'var(--brand-green)' }}
            >
              {nameSaving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>

        {/* Card 3 — Change Password */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold mb-4">Change Password</h2>
          <form onSubmit={handlePasswordSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Current password
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                value={pwForm.currentPassword}
                onChange={e => {
                  setPwForm(prev => ({ ...prev, currentPassword: e.target.value }));
                  setPwErrors(prev => ({ ...prev, currentPassword: undefined }));
                  setPwServerError('');
                }}
                className={inputClass}
                style={inputStyle(!!pwErrors.currentPassword)}
              />
              {pwErrors.currentPassword && (
                <p className="mt-1 text-xs" style={{ color: 'var(--destructive)' }}>{pwErrors.currentPassword}</p>
              )}
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                value={pwForm.newPassword}
                onChange={e => {
                  setPwForm(prev => ({ ...prev, newPassword: e.target.value }));
                  setPwErrors(prev => ({ ...prev, newPassword: undefined }));
                  setPwServerError('');
                }}
                className={inputClass}
                style={inputStyle(!!pwErrors.newPassword)}
              />
              {pwErrors.newPassword && (
                <p className="mt-1 text-xs" style={{ color: 'var(--destructive)' }}>{pwErrors.newPassword}</p>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={pwForm.confirmPassword}
                onChange={e => {
                  setPwForm(prev => ({ ...prev, confirmPassword: e.target.value }));
                  setPwErrors(prev => ({ ...prev, confirmPassword: undefined }));
                  setPwServerError('');
                }}
                className={inputClass}
                style={inputStyle(!!pwErrors.confirmPassword)}
              />
              {pwErrors.confirmPassword && (
                <p className="mt-1 text-xs" style={{ color: 'var(--destructive)' }}>{pwErrors.confirmPassword}</p>
              )}
            </div>
            {pwServerError && (
              <p className="text-xs text-center" style={{ color: 'var(--destructive)' }}>{pwServerError}</p>
            )}
            {pwSuccess && (
              <p className="text-xs text-center" style={{ color: 'var(--brand-green)' }}>{pwSuccess}</p>
            )}
            <button
              type="submit"
              disabled={pwSaving}
              className="w-full py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-60 transition"
              style={{ backgroundColor: 'var(--brand-green)' }}
            >
              {pwSaving ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
