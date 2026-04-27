import { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import './Login.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error?.message?.includes('Invalid login credentials')) {
      // Auto sign-up on first visit
      const { error: signUpErr } = await supabase.auth.signUp({ email, password });
      if (signUpErr) setErr(signUpErr.message);
    } else if (error) {
      setErr(error.message);
    }
    setBusy(false);
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <span className="login-logo">📝</span>
          <h1>Poetry Notes</h1>
          <p>Sign in to access your notes</p>
        </div>
        <form onSubmit={submit} className="login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="login-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="login-input"
          />
          {err && <div className="login-error">{err}</div>}
          <button type="submit" disabled={busy} className="login-btn">
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="login-hint">No account? Sign in with a new email and password to create one.</p>
      </div>
    </div>
  );
}
