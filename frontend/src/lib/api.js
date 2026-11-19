// =====================================================
// Module pour appeler l'API backend
// =====================================================

// En développement : http://localhost:3000
// En production : l'adresse définie dans les réglages de Vercel
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function callApi(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erreur serveur');
  }

  return data;
}

// =====================================================
// Recherche d'œuvres
// =====================================================
export async function searchMedia(query) {
  return callApi(`/api/search?q=${encodeURIComponent(query)}`);
}

// =====================================================
// Authentification
// =====================================================
export async function register(email, username, password) {
  return callApi('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, username, password })
  });
}

export async function login(email, password) {
  return callApi('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function getMe(token) {
  return callApi('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
}

// =====================================================
// Détails d'une œuvre
// =====================================================
export async function getMediaDetail(source, type, id) {
  return callApi(`/api/media/${source}/${type}/${id}`);
}

// =====================================================
// Actions utilisateur sur les œuvres (nécessitent un token)
// =====================================================
export async function addToList(token, source, type, externalId, itemType) {
  return callApi('/api/me/media', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ source, type, externalId, itemType })
  });
}

export async function removeFromList(token, source, externalId, itemType) {
  const params = new URLSearchParams({
    source,
    externalId: String(externalId),
    itemType
  });
  return callApi(`/api/me/media?${params}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function getMediaStatus(token, source, externalId) {
  return callApi(`/api/me/media/status/check?source=${source}&externalId=${encodeURIComponent(externalId)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function getUserList(token, itemType) {
  return callApi(`/api/me/media/${itemType}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

// =====================================================
// Gestion du compte utilisateur (RGPD)
// =====================================================
export async function resetUserData(token) {
  return callApi('/api/auth/reset', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function deleteAccount(token) {
  return callApi('/api/auth/me', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
}

// =====================================================
// Préférences utilisateur
// =====================================================
export async function getPreferences(token) {
  return callApi('/api/users/me/preferences', {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function savePreferences(token, genres, platforms) {
  return callApi('/api/users/me/preferences', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ genres, platforms })
  });
}

// =====================================================
// Œuvres populaires (page d'accueil)
// =====================================================
export async function getPopular() {
  return callApi('/api/popular');
}

// =====================================================
// Recommandations personnalisées
// =====================================================
export async function getRecommendations(token) {
  return callApi('/api/recommendations', {
    headers: { Authorization: `Bearer ${token}` }
  });
}

// =====================================================
// Modification du compte
// =====================================================
export async function updateProfile(token, username, email) {
  return callApi('/api/users/me', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ username, email })
  });
}

export async function updatePassword(token, currentPassword, newPassword) {
  return callApi('/api/users/me/password', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ currentPassword, newPassword })
  });
}

// =====================================================
// Résumé des listes (accueil connectée)
// =====================================================
export async function getSummary(token) {
  return callApi('/api/me/media/summary', {
    headers: { Authorization: `Bearer ${token}` }
  });
}