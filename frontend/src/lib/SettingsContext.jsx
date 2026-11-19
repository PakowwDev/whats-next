import { createContext, useContext, useState, useEffect } from 'react';

// =====================================================
// Context de gestion des réglages/accessibilité
// Applique les préférences globalement via des attributs
// sur l'élément <html>
// =====================================================

const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  theme: 'dark',           // 'light' | 'dark' | 'system'
  dyslexicMode: false,
  textSize: 'normal',      // 'small' | 'normal' | 'large'
  highContrast: false,
  language: 'fr'
};

const STORAGE_KEY = 'whats-next-settings';

// Lecture du localStorage AVANT le premier rendu
function loadSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Erreur chargement settings:', e);
  }
  return DEFAULT_SETTINGS;
}

export function SettingsProvider({ children }) {
  // L'initialiseur ne s'exécute qu'une seule fois, au tout premier rendu
  const [settings, setSettings] = useState(loadSettings);

  // Appliquer les settings sur <html> à chaque changement
  useEffect(() => {
    const html = document.documentElement;

    // Thème
    let effectiveTheme = settings.theme;
    if (effectiveTheme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark' : 'light';
    }
    html.setAttribute('data-theme', effectiveTheme);

    // Mode dyslexique
    if (settings.dyslexicMode) {
      html.setAttribute('data-dyslexic', 'true');
    } else {
      html.removeAttribute('data-dyslexic');
    }

    // Taille du texte
    html.setAttribute('data-text-size', settings.textSize);

    // Contraste élevé
    if (settings.highContrast) {
      html.setAttribute('data-high-contrast', 'true');
    } else {
      html.removeAttribute('data-high-contrast');
    }
  }, [settings]);

  // Modifier un réglage et l'enregistrer immédiatement
  const updateSetting = (key, value) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Erreur sauvegarde settings:', e);
      }
      return next;
    });
  };

  const value = { settings, updateSetting };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// Hook pour utiliser le contexte facilement
export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings doit être utilisé dans un SettingsProvider');
  }
  return context;
}