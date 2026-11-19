import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getUserList, getMediaDetail, resetUserData, deleteAccount, updateProfile, updatePassword } from '../lib/api';import { useAuth } from '../lib/AuthContext';
import Header from '../components/Header';

const TABS = [
  { id: 'WATCHLIST', label: 'Watchlist', icon: '📋' },
  { id: 'FAVORITE', label: 'Favoris', icon: '⭐' },
  { id: 'SEEN', label: 'Déjà vus', icon: '✓' },
  { id: 'HIDDEN', label: 'Masqués', icon: '🚫' },
  { id: 'ACCOUNT', label: 'Compte', icon: '⚙️' }
];

function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, token, updateUser } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    TABS.some(t => t.id === requestedTab) ? requestedTab : 'WATCHLIST'
  );
  const [items, setItems] = useState([]);
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);

  // Si pas connecté, rediriger vers login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Charger la liste de l'onglet actif
  useEffect(() => {
    if (!token) return;
    if (activeTab === 'ACCOUNT') {
      setLoading(false);
      return;
    }

    setLoading(true);
    setItems([]);
    setDetails({});

    getUserList(token, activeTab)
    .then(async (data) => {        setItems(data.items);

        // Récupérer les détails de chaque œuvre en parallèle
        const detailsMap = {};
        await Promise.all(
          data.items.map(async (item) => {
            try {
              const detail = await getMediaDetail(item.mediaSource, item.mediaType, item.externalId);
              detailsMap[item.id] = detail;
            } catch (err) {
              // Si une œuvre échoue, on continue avec les autres
              console.error(`Erreur chargement ${item.externalId}:`, err);
            }
          })
        );
        setDetails(detailsMap);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [token, activeTab]);

  if (!isAuthenticated || !user) {
    return null; // Le useEffect va rediriger
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* En-tête */}
      <Header />

      {/* Carte profil */}
      <section className="px-4 sm:px-7 pt-6">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 flex items-center gap-4 sm:gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center text-2xl font-bold shadow-lg shadow-fuchsia-500/30">
            {user.username[0].toUpperCase()}
          </div>

          {/* Infos */}
          <div className="flex-1">
            <div className="text-xl font-bold">{user.username}</div>
            <div className="text-xs text-[var(--text-muted)]">{user.email}</div>
            <div className="text-xs text-[var(--text-dim)] mt-1">
              Membre depuis{' '}
              <span className="text-violet-400">
                {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long'
                })}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Onglets */}
      <section className="px-4 sm:px-7 pt-5">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-1.5 flex gap-1 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 shrink-0 whitespace-nowrap px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-br from-violet-600 to-violet-400 shadow-md shadow-violet-500/30'
                  : 'text-[var(--text-muted)]'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Contenu de l'onglet */}
      <section className="px-4 sm:px-7 py-6">
        {loading && (
          <p className="text-center text-[var(--text-muted)] py-12">Chargement…</p>
        )}

        {!loading && items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[var(--text-muted)] mb-3">Aucune œuvre dans cette liste pour l'instant.</p>
            <Link
              to="/"
              className="text-violet-400 underline"
            >
              Découvrir des œuvres →
            </Link>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {items.map(item => {
              const detail = details[item.id];
              if (!detail) {
                // Si pas encore chargé, on affiche un placeholder
                return (
                  <div
                    key={item.id}
                    className="bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden"
                  >
                    <div className="w-full aspect-[2/3] bg-[var(--surface-2)] flex items-center justify-center text-xs text-[var(--text-dim)]">
                      …
                    </div>
                    <div className="p-2 text-xs text-[var(--text-dim)]">Chargement…</div>
                  </div>
                );
              }
              return (
                <Link
                  key={item.id}
                  to={`/media/${item.mediaSource}/${item.mediaType}/${item.externalId}`}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden hover:border-violet-400 transition-colors"
                >
                  {detail.posterUrl ? (
                    <img src={detail.posterUrl} alt={detail.title} className="w-full aspect-[2/3] object-cover" />
                  ) : (
                    <div className="w-full aspect-[2/3] bg-[var(--surface-2)] flex items-center justify-center text-xs text-[var(--text-dim)]">
                      Pas d'image
                    </div>
                  )}
                  <div className="p-2">
                    <div className="text-sm font-medium truncate">{detail.title}</div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {detail.type} · {detail.releaseYear || '—'}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        {activeTab === 'ACCOUNT' && (
  <AccountTab
    token={token}
    user={user}
    onUserUpdated={updateUser}
    onAccountDeleted={logout}
  />
)}
      </section>
    </div>
  );
}

// =====================================================
// Sous-composant : onglet "Compte"
// Infos du compte, mot de passe, préférences, zone de danger
// =====================================================
function AccountTab({ token, user, onUserUpdated, onAccountDeleted }) {
  // --- Infos du compte ---
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState(null);

  // --- Mot de passe ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState(null);

  // --- Zone de danger ---
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [dangerLoading, setDangerLoading] = useState(false);

  const infoChanged = username !== user.username || email !== user.email;

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setInfoLoading(true);
    setInfoMsg(null);
    try {
      const data = await updateProfile(token, username, email);
      onUserUpdated(data.user);
      setInfoMsg({ type: 'ok', text: 'Informations enregistrées.' });
    } catch (err) {
      setInfoMsg({ type: 'error', text: err.message });
    } finally {
      setInfoLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdMsg(null);

    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: 'error', text: 'Les deux mots de passe ne correspondent pas.' });
      return;
    }
    if (newPassword.length < 8) {
      setPwdMsg({ type: 'error', text: 'Le nouveau mot de passe doit faire au moins 8 caractères.' });
      return;
    }

    setPwdLoading(true);
    try {
      await updatePassword(token, currentPassword, newPassword);
      setPwdMsg({ type: 'ok', text: 'Mot de passe modifié.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.message });
    } finally {
      setPwdLoading(false);
    }
  };

  const handleReset = async () => {
    setDangerLoading(true);
    try {
      const result = await resetUserData(token);
      alert(`Données réinitialisées : ${result.deleted.mediaItems} œuvres supprimées de vos listes.`);
      setConfirmReset(false);
      window.location.reload();
    } catch (err) {
      alert('Erreur : ' + err.message);
    } finally {
      setDangerLoading(false);
    }
  };

  const handleDelete = async () => {
    setDangerLoading(true);
    try {
      await deleteAccount(token);
      alert('Votre compte a été définitivement supprimé.');
      onAccountDeleted();
    } catch (err) {
      alert('Erreur : ' + err.message);
      setDangerLoading(false);
    }
  };

  const inputClass = "w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30";
  const labelClass = "block text-xs text-[var(--text-muted)] mb-1.5";

  const Message = ({ msg }) => {
    if (!msg) return null;
    return (
      <p className={`text-xs mt-3 ${msg.type === 'ok' ? 'text-cyan-400' : 'text-red-400'}`}>
        {msg.type === 'ok' ? '✓ ' : '⚠ '}{msg.text}
      </p>
    );
  };

  return (
    <div className="space-y-4">

      {/* ===== INFORMATIONS DU COMPTE ===== */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-6">
        <h2 className="text-base font-bold mb-1">Informations du compte</h2>
        <p className="text-xs text-[var(--text-muted)] mb-5">
          Votre pseudo apparaît dans l'en-tête du site
        </p>

        <form onSubmit={handleInfoSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelClass}>Pseudo</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Adresse email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={infoLoading || !infoChanged}
            className="bg-gradient-to-br from-violet-600 to-violet-400 px-5 py-2 rounded-lg text-sm font-medium shadow-md shadow-violet-500/30 disabled:opacity-40"
          >
            {infoLoading ? 'Enregistrement…' : 'Enregistrer'}
          </button>

          <Message msg={infoMsg} />
        </form>
      </div>

      {/* ===== MOT DE PASSE ===== */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-6">
        <h2 className="text-base font-bold mb-1">Mot de passe</h2>
        <p className="text-xs text-[var(--text-muted)] mb-5">
          Au moins 8 caractères
        </p>

        <form onSubmit={handlePasswordSubmit}>
          <div className="mb-4 max-w-sm">
            <label className={labelClass}>Mot de passe actuel</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
              autoComplete="current-password"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelClass}>Nouveau mot de passe</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className={labelClass}>Confirmer</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={pwdLoading || !currentPassword || !newPassword || !confirmPassword}
            className="bg-gradient-to-br from-violet-600 to-violet-400 px-5 py-2 rounded-lg text-sm font-medium shadow-md shadow-violet-500/30 disabled:opacity-40"
          >
            {pwdLoading ? 'Modification…' : 'Modifier le mot de passe'}
          </button>

          <Message msg={pwdMsg} />
        </form>
      </div>

      {/* ===== PRÉFÉRENCES ===== */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-6">
        <h2 className="text-base font-bold mb-1">Mes préférences</h2>
        <p className="text-xs text-[var(--text-muted)] mb-5">
          Vos genres et plateformes servent à calculer vos recommandations
        </p>

        <div className="flex gap-2.5 flex-wrap">
          <Link
            to="/onboarding/genres"
            className="bg-transparent text-violet-400 border border-violet-400/40 px-4 py-2 rounded-lg text-sm hover:bg-violet-500/10"
          >
            Modifier mes genres
          </Link>
          <Link
            to="/onboarding/platforms"
            className="bg-transparent text-violet-400 border border-violet-400/40 px-4 py-2 rounded-lg text-sm hover:bg-violet-500/10"
          >
            Modifier mes plateformes
          </Link>
        </div>
      </div>

      {/* ===== ZONE DE DANGER ===== */}
      <div className="bg-gradient-to-br from-red-500/[0.08] to-red-500/[0.02] border border-red-500/40 rounded-2xl p-4 sm:p-6">
        <div className="flex items-center gap-2.5 mb-1">
          <span className="text-xl">⚠️</span>
          <h2 className="text-lg font-bold text-red-500">Zone de danger</h2>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-5">
          Actions irréversibles concernant vos données et votre compte
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Réinitialisation */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="text-sm font-medium mb-1">Réinitialiser mes données</h3>
            <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed">
              Supprime watchlist, favoris, vus et historique. Le compte est conservé.
            </p>

            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="bg-transparent text-violet-400 border border-violet-400/40 px-3.5 py-1.5 rounded-md text-xs font-medium"
              >
                Réinitialiser
              </button>
            ) : (
              <div>
                <p className="text-xs text-violet-300 mb-2 font-medium">
                  Confirmer la réinitialisation ?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    disabled={dangerLoading}
                    className="bg-violet-500 text-white px-3 py-1.5 rounded-md text-xs font-medium disabled:opacity-50"
                  >
                    {dangerLoading ? '...' : 'Oui'}
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    disabled={dangerLoading}
                    className="bg-transparent text-[var(--text-muted)] border border-[var(--border)] px-3 py-1.5 rounded-md text-xs"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Suppression */}
          <div className="bg-[var(--surface)] border border-red-500/30 rounded-xl p-4">
            <h3 className="text-sm font-medium mb-1 text-red-400">Supprimer mon compte</h3>
            <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed">
              Suppression complète et définitive de toutes les données. Conforme RGPD.
            </p>

            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="bg-red-500/15 text-red-400 border border-red-500/50 px-3.5 py-1.5 rounded-md text-xs font-medium"
              >
                Supprimer définitivement
              </button>
            ) : (
              <div>
                <p className="text-xs text-red-300 mb-2 font-medium">
                  Cette action est IRRÉVERSIBLE.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={dangerLoading}
                    className="bg-red-500 text-white px-3 py-1.5 rounded-md text-xs font-medium disabled:opacity-50"
                  >
                    {dangerLoading ? '...' : 'Oui, supprimer'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    disabled={dangerLoading}
                    className="bg-transparent text-[var(--text-muted)] border border-[var(--border)] px-3 py-1.5 rounded-md text-xs"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;