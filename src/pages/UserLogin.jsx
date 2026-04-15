import React, { useState } from 'react';

const UserLogin = ({ onAuth, theme, t }) => {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const u = username.trim().toLowerCase();
    if (!u || !password) {
      setError(t?.('loginNeedCreds') || 'Please enter username and password.');
      return;
    }
    if (mode === 'register') {
      if (password.length < 6) {
        setError(t?.('passwordTooShort') || 'Password must be at least 6 characters.');
        return;
      }
      if (password !== password2) {
        setError(t?.('passwordsNoMatch') || 'Passwords do not match.');
        return;
      }
    }
    setBusy(true);
    try {
      await onAuth({ username: u, password, mode });
    } catch (err) {
      setError(err?.message || t?.('apiDown') || 'Something went wrong. Is the API running?');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme.bg} py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500`}>
      <div className={`absolute top-[-10%] right-[-10%] w-64 h-64 rounded-full ${theme.primary} blur-3xl opacity-10`} />

      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl z-10 animate-fade-in border border-gray-100">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">{t?.('loginTitle') || 'CheckMate'}</h2>
          <p className="mt-3 text-sm text-gray-500 font-medium">{t?.('loginTagline') || 'Plan smarter, travel together.'}</p>
        </div>

        <div className="flex rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`segmented-tab flex-1 py-2 text-sm font-bold rounded-lg ${mode === 'login' ? 'is-active bg-white text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t?.('signIn') || 'Sign in'}
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`segmented-tab flex-1 py-2 text-sm font-bold rounded-lg ${mode === 'register' ? 'is-active bg-white text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t?.('register') || 'Register'}
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-gray-700">{t?.('username') || 'Username'}</label>
            <input
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition duration-200 text-gray-600"
              placeholder={t?.('usernameHint') || "3–32 chars: lowercase letters, digits, underscore"}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">{t?.('password') || 'Password'}</label>
            <input
              type="password"
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition duration-200 text-gray-600"
              placeholder={mode === 'register' ? (t?.('passwordHintRegister') || 'At least 6 characters') : (t?.('passwordHintLogin') || '••••••••')}
            />
          </div>
          {mode === 'register' ? (
            <div>
              <label className="block text-sm font-semibold text-gray-700">{t?.('confirmPassword') || 'Confirm password'}</label>
              <input
                type="password"
                autoComplete="new-password"
                required
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition duration-200 text-gray-600"
                placeholder={t?.('passwordReenter') || 'Re-enter password'}
              />
            </div>
          ) : null}

          {error ? (
            <p className="text-sm text-red-600 font-medium text-center" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="btn-primary-soft w-full flex justify-center py-4 px-4 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {busy ? (t?.('pleaseWait') || 'Please wait…') : mode === 'register' ? (t?.('createAccount') || 'Create account') : (t?.('signIn') || 'Sign in')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserLogin;
