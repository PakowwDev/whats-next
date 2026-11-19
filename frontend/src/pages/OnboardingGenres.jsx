import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { savePreferences } from '../lib/api';
import { useAuth } from '../lib/AuthContext';

// Listes de genres par catégorie
const GENRES = {
  games: {
    label: 'Jeux vidéo',
    icon: '🎮',
    options: ['RPG', 'Aventure', 'Action', 'Stratégie', 'FPS', 'Simulation', 'Plateforme', 'Sport', 'Course', 'Combat', 'Horreur', 'Indé']
  },
  movies: {
    label: 'Films',
    icon: '🎬',
    options: ['SF', 'Thriller', 'Comédie', 'Horreur', 'Drame', 'Action', 'Aventure', 'Animation', 'Romance', 'Documentaire']
  },
  series: {
    label: 'Séries',
    icon: '📺',
    options: ['Drame', 'Crime', 'Sitcom', 'SF', 'Thriller', 'Comédie', 'Fantasy', 'Documentaire']
  },
  anime: {
    label: 'Animes',
    icon: '🌸',
    options: ['Shōnen', 'Seinen', 'Slice of life', 'Mecha', 'Romance', 'Fantasy', 'Horror', 'Sport']
  }
};

function OnboardingGenres() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();

  // État : { games: ['RPG', 'Aventure'], movies: [...], ... }
  const [selected, setSelected] = useState({
    games: [],
    movies: [],
    series: [],
    anime: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const toggleGenre = (category, genre) => {
    setSelected(prev => {
      const current = prev[category];
      if (current.includes(genre)) {
        return { ...prev, [category]: current.filter(g => g !== genre) };
      } else {
        return { ...prev, [category]: [...current, genre] };
      }
    });
  };

  const handleContinue = async () => {
    setLoading(true);
    setError(null);
    try {
      await savePreferences(token, selected, undefined);
      navigate('/onboarding/platforms');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/onboarding/platforms');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="border-b border-[var(--border-subtle)] py-4 px-7">
        <Link to="/" className="text-2xl font-bold tracking-wide bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
          WHAT'S NEXT?
        </Link>
      </header>

      <main className="px-4 sm:px-7 py-8 sm:py-10 max-w-3xl mx-auto">
        {/* Barre de progression */}
        <div className="text-xs text-violet-400 tracking-widest font-medium text-center mb-3">
          ÉTAPE 2 / 3 — GENRES PRÉFÉRÉS
        </div>
        <div className="h-1 bg-[var(--surface-2)] rounded-full mb-2 overflow-hidden">
          <div className="h-full w-2/3 bg-gradient-to-r from-violet-600 to-violet-400 rounded-full shadow-md shadow-violet-500/50"></div>
        </div>
        <div className="flex justify-between text-xs mb-8">
          <span className="text-[var(--text-muted)]">✓ Compte</span>
          <span className="text-violet-400 font-medium">● Genres</span>
          <span className="text-[var(--text-dim)]">○ Plateformes</span>
        </div>

        <h1 className="text-2xl font-bold text-center mb-1">
          Quels genres aimez-vous ?
        </h1>
        <p className="text-sm text-[var(--text-muted)] text-center mb-8">
          Vous pouvez ignorer cette étape et y revenir depuis votre profil
        </p>

        {/* Catégories */}
        <div className="space-y-6 mb-8">
          {Object.entries(GENRES).map(([category, info]) => (
            <div key={category}>
              <div className="text-sm font-medium mb-2.5">
                {info.icon} {info.label}
              </div>
              <div className="flex gap-2 flex-wrap">
                {info.options.map(genre => {
                  const isSelected = selected[category].includes(genre);
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(category, genre)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-gradient-to-br from-violet-600 to-violet-400 shadow-md shadow-violet-500/30'
                          : 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)]'
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center mb-4">{error}</p>
        )}

        {/* Boutons */}
        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-2.5">
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
            onClick={handleContinue}
            disabled={loading}
            className="bg-gradient-to-br from-violet-600 to-violet-400 px-5 py-2.5 rounded-lg text-xs font-medium shadow-md shadow-violet-500/30 disabled:opacity-50"
          >
            {loading ? '...' : 'Continuer →'}
          </button>
        </div>
      </main>
    </div>
  );
}

export default OnboardingGenres;