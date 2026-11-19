import { useSettings } from '../lib/SettingsContext';

function SettingsPanel({ isOpen, onClose }) {
  const { settings, updateSetting } = useSettings();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      {/* Overlay sombre à gauche */}
      <div className="flex-1" style={{ background: 'rgba(0, 0, 0, 0.5)' }}></div>

      {/* Panneau latéral droit */}
      <aside
        className="w-full max-w-sm bg-[var(--bg)] border-l border-[var(--border)] overflow-y-auto"
        style={{ boxShadow: '-20px 0 40px rgba(0, 0, 0, 0.5)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div>
            <div className="text-base font-bold" style={{ fontFamily: '"Orbitron", sans-serif' }}>
              Réglages rapides
            </div>
            <div className="text-xs text-[var(--text-dim)] mt-0.5">
              Préférences enregistrées automatiquement
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border border-[var(--border)] rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Section APPARENCE */}
        <div className="p-5 border-b border-[var(--border-subtle)]">
          <div className="text-[10px] text-violet-400 tracking-widest font-semibold mb-3">
            APPARENCE
          </div>

          <div className="text-sm mb-2.5">Thème</div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => updateSetting('theme', 'light')}
              className={`py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 border transition-all ${
                settings.theme === 'light'
                  ? 'bg-gradient-to-br from-violet-600 to-violet-400 text-white border-transparent shadow-md shadow-violet-500/30'
                  : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)]'
              }`}
            >
              ☀ Clair
            </button>
            <button
              onClick={() => updateSetting('theme', 'dark')}
              className={`py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 border transition-all ${
                settings.theme === 'dark'
                  ? 'bg-gradient-to-br from-violet-600 to-violet-400 text-white border-transparent shadow-md shadow-violet-500/30'
                  : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)]'
              }`}
            >
              🌙 Sombre
            </button>
          </div>
          <button
            onClick={() => updateSetting('theme', 'system')}
            className={`w-full py-2 rounded-lg text-xs border transition-all ${
              settings.theme === 'system'
                ? 'bg-gradient-to-br from-violet-600 to-violet-400 text-white border-transparent shadow-md shadow-violet-500/30'
                : 'bg-transparent text-[var(--text-muted)] border-[var(--border)]'
            }`}
          >
            Suivre les préférences système
          </button>
        </div>

        {/* Section ACCESSIBILITÉ */}
        <div className="p-5 border-b border-[var(--border-subtle)]">
          <div className="text-[10px] text-violet-400 tracking-widest font-semibold mb-3">
            ACCESSIBILITÉ
          </div>

          {/* Mode dyslexique — toggle */}
          <div className="flex items-center justify-between mb-4">
            <div className="pr-3">
              <div className="text-sm">Mode dyslexique</div>
              <div className="text-[10px] text-[var(--text-dim)] mt-0.5">
                Police adaptée pour faciliter la lecture
              </div>
            </div>
            <button
              onClick={() => updateSetting('dyslexicMode', !settings.dyslexicMode)}
              className={`relative w-10 h-6 rounded-full border transition-all flex-shrink-0 ${
                settings.dyslexicMode
                  ? 'bg-gradient-to-br from-violet-600 to-violet-400 border-violet-400 shadow-md shadow-violet-500/40'
                  : 'bg-[var(--surface-2)] border-[var(--border)]'
              }`}
              aria-label="Toggle mode dyslexique"
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                  settings.dyslexicMode
                    ? 'right-0.5 bg-white'
                    : 'left-0.5 bg-[#6B6385]'
                }`}
              ></span>
            </button>
          </div>

          {/* Taille du texte — 3 boutons */}
          <div className="mb-4">
            <div className="text-sm mb-2">Taille du texte</div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => updateSetting('textSize', 'small')}
                className={`py-2 rounded-md text-xs border transition-all ${
                  settings.textSize === 'small'
                    ? 'bg-gradient-to-br from-violet-600 to-violet-400 text-white border-transparent shadow-md shadow-violet-500/30'
                    : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)]'
                }`}
              >
                A−
              </button>
              <button
                onClick={() => updateSetting('textSize', 'normal')}
                className={`py-2 rounded-md text-sm font-semibold border transition-all ${
                  settings.textSize === 'normal'
                    ? 'bg-gradient-to-br from-violet-600 to-violet-400 text-white border-transparent shadow-md shadow-violet-500/30'
                    : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)]'
                }`}
              >
                A
              </button>
              <button
                onClick={() => updateSetting('textSize', 'large')}
                className={`py-2 rounded-md text-base border transition-all ${
                  settings.textSize === 'large'
                    ? 'bg-gradient-to-br from-violet-600 to-violet-400 text-white border-transparent shadow-md shadow-violet-500/30'
                    : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)]'
                }`}
              >
                A+
              </button>
            </div>
          </div>

          {/* Contraste élevé — toggle */}
          <div className="flex items-center justify-between">
            <div className="pr-3">
              <div className="text-sm">Contraste élevé</div>
              <div className="text-[10px] text-[var(--text-dim)] mt-0.5">
                Améliore la lisibilité
              </div>
            </div>
            <button
              onClick={() => updateSetting('highContrast', !settings.highContrast)}
              className={`relative w-10 h-6 rounded-full border transition-all flex-shrink-0 ${
                settings.highContrast
                  ? 'bg-gradient-to-br from-violet-600 to-violet-400 border-violet-400 shadow-md shadow-violet-500/40'
                  : 'bg-[var(--surface-2)] border-[var(--border)]'
              }`}
              aria-label="Toggle contraste élevé"
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                  settings.highContrast
                    ? 'right-0.5 bg-white'
                    : 'left-0.5 bg-[#6B6385]'
                }`}
              ></span>
            </button>
          </div>
        </div>

        {/* Section LANGUE */}
        <div className="p-5">
          <div className="text-[10px] text-violet-400 tracking-widest font-semibold mb-3">
            LANGUE
          </div>
          <button
            disabled
            className="w-full bg-[var(--surface)] border border-[var(--border)] px-4 py-2.5 rounded-lg text-sm flex items-center justify-between opacity-90"
          >
            <span className="flex items-center gap-2">🇫🇷 Français</span>
            <span className="text-[10px] text-[var(--text-dim)]">(v1 uniquement)</span>
          </button>
        </div>
      </aside>
    </div>
  );
}

export default SettingsPanel;