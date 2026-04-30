// Module pour gérer la connexion à IGDB (via Twitch OAuth)

let cachedToken = null;
let tokenExpiry = 0;

// Obtenir un access token valide auprès de Twitch
async function getAccessToken() {
  // Si on a déjà un token valide en cache, on le réutilise
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;

  const url = `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;

  const response = await fetch(url, { method: 'POST' });
  const data = await response.json();

  if (!data.access_token) {
    throw new Error('Impossible de récupérer le token IGDB : ' + JSON.stringify(data));
  }

  cachedToken = data.access_token;
  // On stocke l'expiration en ms (data.expires_in est en secondes)
  // On retire 5 minutes par sécurité
  tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

  return cachedToken;
}

// Faire une requête à l'API IGDB
export async function igdbQuery(endpoint, query) {
  const token = await getAccessToken();
  const clientId = process.env.IGDB_CLIENT_ID;

  const response = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
    method: 'POST',
    headers: {
      'Client-ID': clientId,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'text/plain'
    },
    body: query
  });

  return response.json();
}