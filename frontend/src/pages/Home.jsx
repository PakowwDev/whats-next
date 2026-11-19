import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPopular, getRecommendations, getSummary } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import Header from '../components/Header';
import MediaCarousel from '../components/MediaCarousel';
import MediaGrid from '../components/MediaGrid';

const QUICK_ACCESS = [
  { tab: 'WATCHLIST', icon: '📋', label: 'Watchlist', color: 'violet',  unit: ['œuvre en attente', 'œuvres en attente'] },
  { tab: 'FAVORITE',  icon: '⭐', label: 'Favoris',   color: 'fuchsia', unit: ['œuvre épinglée', 'œuvres épinglées'] },
  { tab: 'SEEN',      icon: '✓',  label: 'Déjà vus',  color: 'cyan',    unit: ['œuvre', 'œuvres'] },
  { tab: 'HIDDEN',    icon: '🚫', label: 'Masqués',   color: 'dim',     unit: ['œuvre masquée', 'œuvres masquées'] }
];

const ICON_STYLES = {
  violet:  'bg-violet-500/15 text-violet-400 border-violet-500/30',
  fuchsia: 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30',
  cyan:    'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  dim:     'bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border)]'
};

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, token, user } = useAuth();

  const [query, setQuery] = useState('');

  // Œuvres populaires
  const [popular, setPopular] = useState(null);
  const [popularLoading, setPopularLoading] = useState(true);

  // Recommandations personnalisées
  const [reco, setReco] = useState(null);
  const [recoLoading, setRecoLoading] = useState(false);

  // Résumé des listes
  const [summary, setSummary] = useState(null);

  const [activeTab, setActiveTab] = useState('forYou');

  useEffect(() => {
    getPopular()
      .then(data => setPopular(data))
      .catch(err => console.error('Erreur getPopular:', err))
      .finally(() => setPopularLoading(false));
  }, []);

  useEffect(() => {
    if (!token) {
      setReco(null);
      setSummary(null);
      return;
    }

    setRecoLoading(true);
    getRecommendations(token)
      .then(data => setReco(data))
      .catch(err => console.error('Erreur getRecommendations:', err))
      .finally(() => setRecoLoading(false));

    getSummary(token)
      .then(data => setSummary(data))
      .catch(err => console.error('Erreur getSummary:', err));
  }, [token]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim().length < 2) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const TABS = [
    { id: 'forYou', label: 'Pour vous' },
    { id: 'mix', label: 'Mix' },
    { id: 'popular', label: 'Populaire' }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Header sticky />

      {/* Hero avec barre de recherche */}
      <section className="py-8 sm:py-12 px-4 sm:px-7 text-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-96 rounded-full opacity-20" style={{
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.6) 0%, transparent 70%)'
          }}></div>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: '"Orbitron", sans-serif' }}>
            Trouvez votre prochaine œuvre
          </h2>
          <p className="text-[var(--text-muted)] mb-8">
            Jeux vidéo, films, séries, animes — tout en un seul endroit
          </p>

          <form onSubmit={handleSearch} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cherchez une œuvre ou un genre"
              className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-full px-5 py-3 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30"
            />
            <button
              type="submit"
              disabled={query.trim().length < 2}
              className="bg-gradient-to-br from-violet-600 to-violet-400 px-6 py-3 rounded-full text-sm font-medium shadow-lg shadow-violet-500/30 disabled:opacity-50"
            >
              Rechercher
            </button>
          </form>
        </div>
      </section>

      {/* Bannière incitation (invités) */}
      {!isAuthenticated && (
        <section className="px-4 sm:px-7 pb-8">
          <div className="rounded-xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border" style={{
            borderColor: 'rgba(217, 70, 239, 0.3)',
            background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.12), rgba(217, 70, 239, 0.08))'
          }}>
            <div className="flex items-center gap-3">
              <span className="text-xl">✨</span>
              <span className="text-sm">Créez un compte pour des recommandations personnalisées</span>
            </div>
            <Link
              to="/register"
              className="bg-gradient-to-br from-violet-400 to-fuchsia-500 px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap"
            >
              Créer un compte →
            </Link>
          </div>
        </section>
      )}

      {/* ===== MODE CONNECTÉ ===== */}
      {isAuthenticated && (
        <>
          {/* Message d'accueil */}
          <section className="px-4 sm:px-7 pb-6">
            <h2 className="text-2xl sm:text-3xl font-bold mb-1" style={{ fontFamily: '"Orbitron", sans-serif' }}>
              Bonjour {user.username} <span style={{ fontFamily: 'inherit' }}>👋</span>
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              Voici nos suggestions du jour
            </p>
          </section>

          {/* Ma watchlist */}
          {summary?.watchlist?.length > 0 && (
            <MediaCarousel
              title="Ma watchlist"
              subtitle="Les œuvres que vous avez mises de côté"
              items={summary.watchlist}
              linkTo="/profile?tab=WATCHLIST"
            />
          )}

          {/* Onglets de recommandations */}
          <section className="px-4 sm:px-7 pb-12">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-1.5 flex gap-1 w-full max-w-md mx-auto mb-6">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-br from-violet-600 to-violet-400 shadow-md shadow-violet-500/30'
                      : 'text-[var(--text-muted)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'popular' ? (
              popularLoading ? (
                <p className="text-center text-[var(--text-muted)] py-12">Chargement…</p>
              ) : popular ? (
                <>
                  <MediaCarousel title="Tendances actuelles" items={popular.trending} />
                  <MediaCarousel title="Jeux vidéo populaires" items={popular.games} />
                  <MediaCarousel title="Films populaires" items={popular.movies} />
                  <MediaCarousel title="Séries populaires" items={popular.series} />
                  <MediaCarousel title="Animes populaires" items={popular.animes} />
                </>
              ) : (
                <p className="text-center text-red-400 py-12">Impossible de charger les tendances.</p>
              )
            ) : recoLoading ? (
              <p className="text-center text-[var(--text-muted)] py-12">Calcul de vos recommandations…</p>
            ) : reco?.noPreferences ? (
              <div className="text-center py-12">
                <p className="text-[var(--text-muted)] mb-3">
                  Renseignez vos genres préférés pour obtenir des recommandations personnalisées.
                </p>
                <Link to="/onboarding/genres" className="text-violet-400 underline">
                  Choisir mes genres →
                </Link>
              </div>
            ) : (
              <>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                  {activeTab === 'forYou'
                    ? 'Sélectionnées d\'après vos genres préférés'
                    : 'Un mélange de vos goûts et de nouvelles découvertes'}
                </p>
                <MediaGrid items={activeTab === 'forYou' ? reco?.forYou : reco?.mix} />
                {(activeTab === 'forYou' ? reco?.forYou : reco?.mix)?.length === 0 && (
                  <p className="text-center text-[var(--text-muted)] py-12">
                    Aucune recommandation pour le moment.
                  </p>
                )}
              </>
            )}
          </section>

          {/* Accès rapide */}
          {summary && (
            <section className="px-4 sm:px-7 pb-10">
              <h3
                className="text-lg sm:text-xl font-bold mb-4"
                style={{ fontFamily: '"Orbitron", sans-serif', letterSpacing: '0.5px' }}
              >
                Accès rapide
              </h3>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                {QUICK_ACCESS.map(item => {
                  const count = summary.counts[item.tab] || 0;
                  return (
                    <Link
                      key={item.tab}
                      to={`/profile?tab=${item.tab}`}
                      className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 hover:border-violet-400 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <span
                          className={`w-8 h-8 shrink-0 rounded-lg border flex items-center justify-center text-sm ${ICON_STYLES[item.color]}`}
                        >
                          {item.icon}
                        </span>
                        <span className="font-medium truncate">{item.label}</span>
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {count === 0
                          ? 'Aucune œuvre'
                          : `${count} ${count > 1 ? item.unit[1] : item.unit[0]}`}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}

      {/* ===== MODE INVITÉ : carrousels ===== */}
      {!isAuthenticated && (
        <>
          {popularLoading ? (
            <section className="px-4 sm:px-7 py-12 text-center text-[var(--text-muted)]">
              Chargement des tendances…
            </section>
          ) : popular ? (
            <>
              <MediaCarousel title="Tendances actuelles" items={popular.trending} />
              <MediaCarousel
                title="Jeux vidéo populaires"
                subtitle="Les incontournables du moment"
                items={popular.games}
              />
              <MediaCarousel title="Films populaires" items={popular.movies} />
              <MediaCarousel title="Séries populaires" items={popular.series} />
              <MediaCarousel title="Animes populaires" items={popular.animes} />
            </>
          ) : (
            <section className="px-4 sm:px-7 py-12 text-center text-red-400">
              Impossible de charger les tendances.
            </section>
          )}
        </>
      )}

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-6 px-4 sm:px-7 text-center text-xs text-[var(--text-dim)] mt-8">
        <div className="text-[var(--text-muted)] mb-2">What's Next? — Projet Bac Pro CIEL</div>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Link to="/a-propos" className="hover:text-violet-400">À propos</Link>
          <span>·</span>
          <Link to="/mentions-legales" className="hover:text-violet-400">Mentions légales</Link>
          <span>·</span>
          <span>Sources : TMDB, IGDB, Jikan</span>
        </div>
      </footer>
    </div>
  );
}

export default Home;