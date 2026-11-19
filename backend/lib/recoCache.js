// =====================================================
// Cache des recommandations, partagé entre les routes
// Permet de vider le cache d'un utilisateur dès qu'il
// modifie ses listes ou ses préférences
// =====================================================

const cache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export function getCachedReco(userId) {
  const entry = cache.get(userId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(userId);
    return null;
  }
  return entry.value;
}

export function setCachedReco(userId, value) {
  cache.set(userId, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS
  });
}

// Appelée quand l'utilisateur modifie ses listes ou préférences
export function invalidateReco(userId) {
  cache.delete(userId);
}