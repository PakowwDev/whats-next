// =====================================================
// Module de recommandations personnalisées
// Basé sur les préférences de genres de l'utilisateur
// =====================================================
import { igdbQuery } from './igdb.js';

// -----------------------------------------------------
// Tables de correspondance : nos genres → IDs des APIs
// -----------------------------------------------------

// TMDB genre IDs (films)
const TMDB_MOVIE_GENRES = {
  'Action': 28,
  'Aventure': 12,
  'Animation': 16,
  'Comédie': 35,
  'Documentaire': 99,
  'Drame': 18,
  'Horreur': 27,
  'Romance': 10749,
  'SF': 878,
  'Thriller': 53
};

// TMDB genre IDs (séries)
const TMDB_TV_GENRES = {
  'Crime': 80,
  'Documentaire': 99,
  'Drame': 18,
  'Comédie': 35,
  'Sitcom': 35,
  'SF': 10765,
  'Fantasy': 10765,
  'Thriller': 9648
};

// IGDB genre IDs (jeux)
const IGDB_GENRES = {
  'RPG': 12,
  'Aventure': 31,
  'Action': 4,
  'Stratégie': 15,
  'FPS': 5,
  'Simulation': 13,
  'Plateforme': 8,
  'Sport': 14,
  'Course': 10,
  'Combat': 4,
  'Indé': 32
};

// Jikan genre IDs (animes)
const JIKAN_GENRES = {
  'Shōnen': 27,
  'Seinen': 42,
  'Slice of life': 36,
  'Mecha': 18,
  'Romance': 22,
  'Fantasy': 10,
  'Horror': 14,
  'Sport': 30
};

// -----------------------------------------------------
// Recommandations de films selon les genres préférés
// -----------------------------------------------------
async function recommendMovies(preferredGenres) {
  const apiKey = process.env.TMDB_API_KEY;

  // Convertir nos genres en IDs TMDB
  const genreIds = preferredGenres
    .map(g => TMDB_MOVIE_GENRES[g])
    .filter(Boolean);

  if (genreIds.length === 0) return [];

  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=fr-FR&sort_by=popularity.desc&with_genres=${genreIds.join('|')}&vote_count.gte=100&page=1`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.results) return [];

  return data.results.slice(0, 12).map(item => ({
    id: String(item.id),
    source: 'TMDB',
    type: 'MOVIE',
    title: item.title,
    description: item.overview || '',
    releaseYear: item.release_date ? parseInt(item.release_date.slice(0, 4)) : null,
    rating: item.vote_average ? Math.round(item.vote_average * 10) / 10 : null,
    posterUrl: item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : null,
    // Score = nb de genres qui matchent
    matchScore: (item.genre_ids || []).filter(id => genreIds.includes(id)).length
  }));
}

// -----------------------------------------------------
// Recommandations de séries
// -----------------------------------------------------
async function recommendSeries(preferredGenres) {
  const apiKey = process.env.TMDB_API_KEY;

  const genreIds = preferredGenres
    .map(g => TMDB_TV_GENRES[g])
    .filter(Boolean);

  if (genreIds.length === 0) return [];

  const url = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&language=fr-FR&sort_by=popularity.desc&with_genres=${genreIds.join('|')}&vote_count.gte=50&page=1`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.results) return [];

  return data.results.slice(0, 12).map(item => ({
    id: String(item.id),
    source: 'TMDB',
    type: 'SERIES',
    title: item.name,
    description: item.overview || '',
    releaseYear: item.first_air_date ? parseInt(item.first_air_date.slice(0, 4)) : null,
    rating: item.vote_average ? Math.round(item.vote_average * 10) / 10 : null,
    posterUrl: item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : null,
    matchScore: (item.genre_ids || []).filter(id => genreIds.includes(id)).length
  }));
}

// -----------------------------------------------------
// Recommandations de jeux
// -----------------------------------------------------
async function recommendGames(preferredGenres) {
  const genreIds = [...new Set(
    preferredGenres.map(g => IGDB_GENRES[g]).filter(Boolean)
  )];

  if (genreIds.length === 0) return [];

  const query = `
    fields name, summary, first_release_date, rating, cover.image_id, genres;
    where genres = (${genreIds.join(',')}) & rating > 70 & cover != null & category = 0;
    sort rating_count desc;
    limit 12;
  `;

  const games = await igdbQuery('games', query);

  if (!Array.isArray(games)) return [];

  return games.map(game => ({
    id: String(game.id),
    source: 'IGDB',
    type: 'GAME',
    title: game.name,
    description: game.summary || '',
    releaseYear: game.first_release_date
      ? new Date(game.first_release_date * 1000).getFullYear()
      : null,
    rating: game.rating ? Math.round(game.rating) / 10 : null,
    posterUrl: game.cover
      ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
      : null,
    matchScore: (game.genres || []).filter(id => genreIds.includes(id)).length
  }));
}

// -----------------------------------------------------
// Recommandations d'animes
// -----------------------------------------------------
async function recommendAnimes(preferredGenres) {
  const genreIds = preferredGenres
    .map(g => JIKAN_GENRES[g])
    .filter(Boolean);

  if (genreIds.length === 0) return [];

  const url = `https://api.jikan.moe/v4/anime?genres=${genreIds.join(',')}&order_by=popularity&sort=asc&limit=12&min_score=7`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.data) return [];

  return data.data.map(anime => ({
    id: String(anime.mal_id),
    source: 'ANILIST',
    type: 'ANIME',
    title: anime.title,
    description: anime.synopsis || '',
    releaseYear: anime.year,
    rating: anime.score,
    posterUrl: anime.images?.jpg?.large_image_url || null,
    matchScore: (anime.genres || [])
      .filter(g => genreIds.includes(g.mal_id)).length
  }));
}

// =====================================================
// Fonction principale : recommandations "Pour vous"
// =====================================================
export async function getPersonalizedRecommendations(preferences, excludedIds = []) {
  const genres = preferences?.genres || {};

  // On lance les 4 requêtes en parallèle
  const [movies, series, games, animes] = await Promise.allSettled([
    recommendMovies(genres.movies || []),
    recommendSeries(genres.series || []),
    recommendGames(genres.games || []),
    recommendAnimes(genres.anime || [])
  ]);

  let results = [];
  if (movies.status === 'fulfilled') results.push(...movies.value);
  if (series.status === 'fulfilled') results.push(...series.value);
  if (games.status === 'fulfilled') results.push(...games.value);
  if (animes.status === 'fulfilled') results.push(...animes.value);

  // Retirer les œuvres déjà vues / masquées
  results = results.filter(item => {
    const key = `${item.source}-${item.id}`;
    return !excludedIds.includes(key);
  });

  // Trier par score de correspondance, puis par note
  results.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    return (b.rating || 0) - (a.rating || 0);
  });

  return results;
}

// =====================================================
// Mode "Mix" : 60% recommandations perso + 40% découverte
// =====================================================
export async function getMixRecommendations(preferences, popularItems, excludedIds = []) {
  const personalized = await getPersonalizedRecommendations(preferences, excludedIds);

  // Filtrer aussi les populaires
  const filteredPopular = (popularItems || []).filter(item => {
    const key = `${item.source}-${item.id}`;
    return !excludedIds.includes(key);
  });

  // On prend les 12 meilleures perso + 8 populaires
  const perso = personalized.slice(0, 12);
  const decouverte = filteredPopular
    .filter(p => !perso.some(x => x.source === p.source && x.id === p.id))
    .slice(0, 8);

  const mixed = [...perso, ...decouverte];

  // Mélanger pour que ce ne soit pas "bloc perso puis bloc découverte"
  for (let i = mixed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [mixed[i], mixed[j]] = [mixed[j], mixed[i]];
  }

  return mixed;
}