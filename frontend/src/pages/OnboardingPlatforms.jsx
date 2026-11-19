import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { savePreferences } from '../lib/api';
import { useAuth } from '../lib/AuthContext';

const PLATFORMS = [
  'Netflix',
  'Prime Video',
  'Disney+',
  'Crunchyroll',
  'Apple TV+',
  'Canal+',
  'Steam',
  'PlayStation',
  'Xbox',
  'Switch',
  'Epic Games',
  'GOG'
];

function OnboardingPlatforms() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();

  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const togglePlatform = (platform) => {
    setSelected(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleFinish = async () => {
    setLoading(true);
    setError(null);
    try {
      await savePreferences(token, undefined, selected);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="border-b border-[var(--border-subtle)] py-4 px-7">
        <Link to="/" className="text-2xl font-bold tracking-wide bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
          WHAT'S NEXT?
        </Link>
      </header>

      <main className="px-7 py-10 max-w-3xl mx-auto">
        {/* Barre de progression complète */}
        <div className="text-xs text-violet-400 tracking-widest font-medium text-center mb-3">
          ÉTAPE 3 / 3 — PLATEFORMES UTILISÉES
        </div>
        <div className="h-1 bg-gradient-to-r from-violet-600 via-violet-400 to-fuchsia-500 rounded-full mb-2 shadow-md shadow-violet-500/50"></div>
        <div className="flex justify-between text-xs mb-8">
          <span className="text-[var(--text-muted)]">✓ Compte</span>
          <span className="text-[var(--text-muted)]">✓ Genres</span>
          <span className="text-violet-400 font-medium">● Plateformes</span>
        </div>

        <h1 className="text-2xl font-bold text-center mb-1">
          Sur quelles plateformes regardez-vous / jouez-vous ?
        </h1>
        <p className="text-sm text-[var(--text-muted)] text-center mb-8">
          On filtrera les recommandations en fonction
        </p>

        {/* Grille de plateformes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-8">
          {PLATFORMS.map(platform => {
            const isSelected = selected.includes(platform);
            return (
              <button
                key={platform}
                type="button"
                onClick={() => togglePlatform(platform)}
                className={`py-4 rounded-xl text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-gradient-to-br from-violet-600/20 to-violet-400/10 text-[var(--text)] border border-violet-400 shadow-md shadow-violet-500/20'
                    : 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)]'
                }`}
              >
                {platform}
              </button>
            );
          })}
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center mb-4">{error}</p>
        )}

        {/* Boutons */}
        <div className="grid grid-cols-[auto_1fr_auto] gap-2.5">
          <button
            onClick={() => navigate(-1)}
            className="bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] px-5 py-2.5 rounded-lg text-xs"
          >
            ← Retour
          </button>
          <button
            onClick={handleSkip}
            disabled={loading}
            className="bg-transparent text-[var(--text-dim)] border border-[var(--border)] py-2.5 rounded-lg text-xs disabled:opacity-50"
          >
            Ignorer, je répondrai plus tard
          </button>
          <button
            onClick={handleFinish}
            disabled={loading}
            className="bg-gradient-to-br from-violet-400 to-fuchsia-500 px-5 py-2.5 rounded-lg text-xs font-medium shadow-md shadow-fuchsia-500/40 disabled:opacity-50"
          >
            {loading ? '...' : 'Terminer ✓'}
          </button>
        </div>
      </main>
    </div>
  );
}

export default OnboardingPlatforms;