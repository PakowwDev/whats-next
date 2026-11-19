import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../lib/api';
import { useAuth } from '../lib/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await apiLogin(email, password);
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col">
      {/* En-tête */}
      <header className="border-b border-[var(--border-subtle)] py-4 px-7">
        <Link to="/" className="text-2xl font-bold tracking-wide bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
          WHAT'S NEXT?
        </Link>
      </header>

      {/* Formulaire centré */}
      <main className="flex-1 flex items-center justify-center px-7 py-16">
        <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 shadow-2xl shadow-violet-500/10">
          <h1 className="text-2xl font-bold text-center mb-2">Connexion</h1>
          <p className="text-sm text-[var(--text-muted)] text-center mb-7">
            Retrouvez vos recommandations personnalisées
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-violet-400 font-medium mb-1.5 tracking-wide">
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30"
                placeholder="user@email.com"
              />
            </div>

            <div>
              <label className="block text-xs text-violet-400 font-medium mb-1.5 tracking-wide">
                MOT DE PASSE
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-br from-violet-600 to-violet-400 py-3 rounded-lg text-sm font-semibold tracking-wide shadow-lg shadow-violet-500/40 disabled:opacity-50"
            >
              {loading ? 'Connexion…' : 'SE CONNECTER'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#2D2147]"></div>
            <span className="text-xs text-[var(--text-dim)] tracking-wider">OU</span>
            <div className="flex-1 h-px bg-[#2D2147]"></div>
          </div>

          <p className="text-center text-sm text-[var(--text-muted)] mb-3">
            Pas encore de compte ?
          </p>
          <Link
            to="/register"
            className="block w-full text-center bg-transparent text-violet-400 border border-violet-400/40 py-2.5 rounded-lg text-sm font-medium"
          >
            Créer un compte →
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Login;