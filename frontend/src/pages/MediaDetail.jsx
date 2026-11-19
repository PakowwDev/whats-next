import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMediaDetail, addToList, removeFromList, getMediaStatus } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import Header from '../components/Header';
import LoginModal from '../components/LoginModal';
import MediaCarousel from '../components/MediaCarousel';

const TYPE_LABEL = {
  GAME: 'Jeu vidéo',
  MOVIE: 'Film',
  SERIES: 'Série',
  ANIME: 'Anime'
};

// Carte d'un avis externe
function RatingCard({ rating }) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-[10px] text-violet-400 tracking-widest font-semibold pt-1">
          {rating.source}
        </span>
        <span className="text-2xl font-bold leading-none bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent whitespace-nowrap">
          {rating.score}
          {rating.scale && (
            <span className="text-xs font-normal text-[var(--text-dim)] ml-0.5">
              {rating.scale}
            </span>
          )}
        </span>
      </div>

      <p className="text-sm italic text-[var(--text-muted)] mb-2 leading-relaxed">
        {rating.label}
      </p>

      <p className="text-[11px] text-[var(--text-dim)]">
        {rating.count
          ? `${rating.count.toLocaleString('fr-FR')} ${rating.countLabel}`
          : rating.countLabel}
      </p>
    </>
  );

  const cls = "bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 block";

  return rating.url ? (
    <a
      href={rating.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${cls} hover:border-violet-400 transition-colors`}
    >
      {content}
    </a>
  ) : (
    <div className={cls}>{content}</div>
  );
}

function MediaDetail() {
  const { source, type, id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();

  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [status, setStatus] = useState({
    WATCHLIST: false,
    FAVORITE: false,
    SEEN: false,
    HIDDEN: false
  });
  const [actionLoading, setActionLoading] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Charger les détails de l'œuvre
  useEffect(() => {
    setLoading(true);
    setError(null);
    window.scrollTo(0, 0);
    getMediaDetail(source, type, id)
      .then(data => setMedia(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [source, type, id]);

  // Charger le statut (si connecté)
  useEffect(() => {
    if (!token) return;
    getMediaStatus(token, source, id)
      .then(data => setStatus(data.status))
      .catch(() => {});
  }, [token, source, id]);

  const handleAction = async (itemType) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    setActionLoading(itemType);

    try {
      if (status[itemType]) {
        await removeFromList(token, media.source, media.id, itemType);
        setStatus(s => ({ ...s, [itemType]: false }));
      } else {
        await addToList(token, media.source, media.type, media.id, itemType);
        setStatus(s => ({ ...s, [itemType]: true }));
      }
    } catch (err) {
      alert('Erreur : ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Ligne d'infos sous le titre : type · année · studio
  const metaLine = media
    ? [TYPE_LABEL[media.type] || media.type, media.releaseYear, media.studio]
        .filter(Boolean)
        .join(' · ')
    : '';

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Header sticky />

      {/* Lien retour */}
      <div className="px-4 sm:px-7 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="text-violet-400 text-sm hover:text-violet-300"
        >
          ← Retour
        </button>
      </div>

      {loading && (
        <div className="px-4 sm:px-7 py-20 text-center text-[var(--text-muted)]">
          Chargement…
        </div>
      )}

      {/* Erreur : message clair plutôt qu'un code brut */}
      {error && (
        <div className="px-4 sm:px-7 py-20 max-w-lg mx-auto text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold mb-2">Fiche indisponible</h1>
          <p className="text-sm text-[var(--text-muted)] mb-5 leading-relaxed">
            Les informations de cette œuvre proviennent d'un service externe qui ne
            répond pas pour le moment. Réessayez dans quelques instants.
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-br from-violet-600 to-violet-400 px-5 py-2 rounded-lg text-sm font-medium shadow-md shadow-violet-500/30"
            >
              Réessayer
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-transparent text-violet-400 border border-violet-400/40 px-5 py-2 rounded-lg text-sm"
            >
              Retour à l'accueil
            </button>
          </div>
          <p className="text-[11px] text-[var(--text-dim)] mt-5">
            Détail technique : {error}
          </p>
        </div>
      )}

      {media && (
        <>
          {/* Hero : trailer + infos + actions */}
          <section className="px-4 sm:px-7 py-6 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
            {/* Trailer ou image */}
            <div className="aspect-video bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
              {media.trailerUrl ? (
                <iframe
                  src={media.trailerUrl}
                  title="Bande-annonce"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : media.backdropUrl ? (
                <img src={media.backdropUrl} alt={media.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--text-dim)]">
                  Pas de bande-annonce disponible
                </div>
              )}
            </div>

            {/* Infos + actions */}
            <div>
              <div className="flex gap-4 mb-4">
                {media.posterUrl && (
                  <img
                    src={media.posterUrl}
                    alt={media.title}
                    className="w-20 sm:w-24 shrink-0 self-start rounded-lg border border-[var(--border)]"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h1
                    className="text-xl sm:text-2xl font-bold leading-tight mb-1"
                    style={{ fontFamily: '"Orbitron", sans-serif' }}
                  >
                    {media.title}
                  </h1>
                  <div className="text-xs text-[var(--text-muted)] mb-2">
                    {metaLine}
                  </div>

                  {media.genres?.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mb-3">
                      {media.genres.slice(0, 4).map((g, i) => (
                        <span
                          key={i}
                          className="text-xs bg-violet-500/15 text-violet-400 border border-violet-500/30 px-2.5 py-0.5 rounded-full"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  )}

                  {media.rating && (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
                        ★ {media.rating}
                      </span>
                      <span className="text-xs text-[var(--text-dim)]">
                        / 10 {media.voteCount ? `· ${media.voteCount.toLocaleString('fr-FR')} avis` : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Boutons d'action */}
              <button
                onClick={() => handleAction('WATCHLIST')}
                disabled={actionLoading === 'WATCHLIST'}
                className={`w-full py-2.5 rounded-lg text-sm font-medium mb-2 flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
                  status.WATCHLIST
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-400'
                    : 'bg-gradient-to-br from-violet-600 to-violet-400 shadow-lg shadow-violet-500/30'
                }`}
              >
                {status.WATCHLIST ? '✓ Dans ma watchlist' : '📋 Ajouter à ma watchlist'}
              </button>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  onClick={() => handleAction('FAVORITE')}
                  disabled={actionLoading === 'FAVORITE'}
                  className={`py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 ${
                    status.FAVORITE
                      ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400'
                      : 'bg-[var(--surface)] text-fuchsia-400 border border-fuchsia-500/40'
                  }`}
                >
                  {status.FAVORITE ? '⭐ Favori ✓' : '⭐ Favori'}
                </button>
                <button
                  onClick={() => handleAction('SEEN')}
                  disabled={actionLoading === 'SEEN'}
                  className={`py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 ${
                    status.SEEN
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400'
                      : 'bg-[var(--surface)] text-cyan-400 border border-cyan-500/40'
                  }`}
                >
                  {status.SEEN
                    ? (media.type === 'GAME' ? '✓ Déjà joué' : '✓ Déjà vu')
                    : (media.type === 'GAME' ? '✓ Marquer comme joué' : '✓ Marquer comme vu')}
                </button>
              </div>

              <button
                onClick={() => handleAction('HIDDEN')}
                disabled={actionLoading === 'HIDDEN'}
                className={`w-full py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 ${
                  status.HIDDEN
                    ? 'bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)]'
                    : 'bg-transparent text-[var(--text-dim)] border border-[var(--border)]'
                }`}
              >
                {status.HIDDEN ? '🚫 Œuvre masquée' : '🚫 Pas intéressé (masquer des recos)'}
              </button>
            </div>
          </section>

          {/* Synopsis */}
          {media.description && (
            <section className="px-4 sm:px-7 pb-6">
              <h2 className="text-lg font-bold mb-3">Synopsis</h2>
              <div className="bg-[var(--surface)] border border-[var(--border)] border-l-4 border-l-violet-400 rounded-xl p-5 text-sm text-[var(--text-muted)] leading-relaxed">
                {media.description}
              </div>
            </section>
          )}

          {/* Plateformes */}
          {media.platforms?.length > 0 && (
            <section className="px-4 sm:px-7 pb-6">
              <h2 className="text-lg font-bold mb-3">Disponible sur</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {media.platforms.map((platform, i) => (
                  <div
                    key={i}
                    className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3 text-center"
                  >
                    {platform.logoUrl && (
                      <img
                        src={platform.logoUrl}
                        alt={platform.name}
                        className="w-10 h-10 mx-auto mb-1.5 rounded"
                      />
                    )}
                    <div className="text-sm">{platform.name}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Avis externes */}
          {media.externalRatings?.length > 0 && (
            <section className="px-4 sm:px-7 pb-6">
              <h2 className="text-lg font-bold mb-3">Avis externes</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {media.externalRatings.map((r, i) => (
                  <RatingCard key={i} rating={r} />
                ))}
              </div>
            </section>
          )}

          {/* Vous aimerez aussi */}
          {media.similar?.length > 0 && (
            <MediaCarousel
              title="Vous aimerez aussi"
              subtitle="Dans le même esprit que cette œuvre"
              items={media.similar}
            />
          )}

          <div className="h-12"></div>
        </>
      )}

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}

export default MediaDetail;