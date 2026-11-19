import { Link } from 'react-router-dom';

function LoginModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Overlay sombre */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)' }}
      ></div>

      {/* Contenu modale */}
      <div
        className="relative bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 max-w-sm w-full shadow-2xl"
        style={{ boxShadow: '0 0 60px rgba(124, 58, 237, 0.3)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Croix de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
          aria-label="Fermer"
        >
          ✕
        </button>

        {/* Icône décorative */}
        <div className="text-center mb-4 mt-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 shadow-lg shadow-violet-500/40 text-2xl">
            🔒
          </div>
        </div>

        <h2 className="text-xl font-bold text-center mb-2" style={{ fontFamily: '"Orbitron", sans-serif' }}>
          Connectez-vous
        </h2>
        <p className="text-sm text-[var(--text-muted)] text-center mb-6">
          Pour ajouter des œuvres à vos listes et bénéficier de recommandations personnalisées.
        </p>

        {/* Boutons d'action */}
        <Link
          to="/login"
          onClick={onClose}
          className="block w-full bg-gradient-to-br from-violet-600 to-violet-400 py-3 rounded-lg text-sm font-semibold text-center shadow-lg shadow-violet-500/40 mb-3"
        >
          SE CONNECTER
        </Link>

        <Link
          to="/register"
          onClick={onClose}
          className="block w-full bg-transparent text-violet-400 border border-violet-400/40 py-3 rounded-lg text-sm font-medium text-center"
        >
          Créer un compte →
        </Link>
      </div>
    </div>
  );
}

export default LoginModal;