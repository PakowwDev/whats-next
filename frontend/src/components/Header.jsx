import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import SettingsPanel from './SettingsPanel';

function Header({ sticky = false }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <header
        className={`border-b border-[var(--border-subtle)] py-3 sm:py-4 px-4 sm:px-7 flex items-center justify-between gap-2 ${
          sticky ? 'sticky top-0 z-10' : ''
        }`}
        style={sticky ? { backgroundColor: 'var(--header-bg)', backdropFilter: 'blur(10px)' } : undefined}
      >
        <Link
          to="/"
          className="text-lg sm:text-2xl font-bold tracking-wide bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent whitespace-nowrap"
        >
          WHAT'S NEXT?
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {isAuthenticated ? (
            <>
              {/* Pseudo complet sur grand écran */}
              <Link
                to="/profile"
                className="hidden md:inline text-sm text-[var(--text-muted)] hover:text-violet-400"
              >
                Bonjour <span className="text-violet-400 font-medium">{user.username}</span>
              </Link>

              {/* Pastille initiale sur mobile */}
              <Link
                to="/profile"
                className="md:hidden w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center text-xs font-bold text-white"
                aria-label="Mon profil"
              >
                {user.username[0].toUpperCase()}
              </Link>

              <button
                onClick={logout}
                className="text-xs sm:text-sm text-[var(--text-muted)] border border-[var(--border)] px-2.5 sm:px-4 py-1.5 rounded-lg whitespace-nowrap"
              >
                <span className="hidden sm:inline">Déconnexion</span>
                <span className="sm:hidden">Sortir</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs sm:text-sm text-[var(--text-muted)] border border-[var(--border)] px-2.5 sm:px-4 py-1.5 rounded-lg whitespace-nowrap"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="text-xs sm:text-sm bg-gradient-to-br from-violet-600 to-violet-400 px-2.5 sm:px-4 py-1.5 rounded-lg shadow-md shadow-violet-500/30 whitespace-nowrap"
              >
                <span className="hidden sm:inline">Inscription</span>
                <span className="sm:hidden">S'inscrire</span>
              </Link>
            </>
          )}

          <button
            onClick={() => setShowSettings(true)}
            className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 border border-[var(--border)] rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-violet-400"
            aria-label="Ouvrir les réglages"
            title="Réglages rapides"
          >
            ⚙
          </button>
        </div>
      </header>

      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}

export default Header;