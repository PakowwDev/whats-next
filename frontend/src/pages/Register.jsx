import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as apiRegister } from '../lib/api';
import { useAuth } from '../lib/AuthContext';

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await apiRegister(email, username, password);
      login(data.token, data.user);
      navigate('/onboarding/genres');    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col">
      <header className="border-b border-[var(--border-subtle)] py-4 px-7">
        <Link to="/" className="text-2xl font-bold tracking-wide bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
          WHAT'S NEXT?
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-7 py-16">
        <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 shadow-2xl shadow-violet-500/10">
          <div className="text-xs text-violet-400 tracking-widest font-medium text-center mb-3">
            ÉTAPE 1 / 3 — CRÉATION DE COMPTE
          </div>

          <div className="h-1 bg-[var(--surface-2)] rounded-full mb-6 overflow-hidden">
            <div className="h-full w-1/3 bg-gradient-to-r from-violet-600 to-violet-400 rounded-full shadow-md shadow-violet-500/50"></div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">Créez votre compte</h1>
          <p className="text-sm text-[var(--text-muted)] text-center mb-7">
            Pour des recommandations personnalisées
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-violet-400 font-medium mb-1.5 tracking-wide">
                PSEUDO
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30"
                placeholder="Votre pseudo"
              />
            </div>

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
                minLength={8}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30"
                placeholder="••••••••"
              />
              <p className="text-xs text-[var(--text-dim)] mt-1.5">
                Au moins 8 caractères
              </p>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-br from-violet-600 to-violet-400 py-3 rounded-lg text-sm font-semibold shadow-lg shadow-violet-500/40 disabled:opacity-50"
            >
              {loading ? 'Création…' : 'Continuer →'}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)] mt-5">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-violet-400 font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default Register;