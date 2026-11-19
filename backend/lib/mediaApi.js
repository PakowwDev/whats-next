// =====================================================
// Module unifié pour appeler les 3 API externes
// Toutes les fonctions renvoient des œuvres au même format
// =====================================================
import { igdbQuery } from './igdb.js';

// Format unifié d'une œuvre (pour normaliser les 3 sources)
// {
//   id: string,           // ID dans l'API source
//   source: string,       // 'TMDB' | 'IGDB' | 'ANILIST'
//   type: string,         // 'GAME' | 'MOVIE' | 'SERIES' | 'ANIME'
//   title: string,
//   description: string,
//   releaseYear: number,
//   rating: number,       // sur 10
//   posterUrl: string
// }

// =====================================================
// Recherche dans TMDB (films + séries)
// =====================================================
export async function searchTmdb(query) {
  const apiKey = process.env.TMDB_API_KEY;
  const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=fr-FR&query=${encodeURIComponent(query)}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.results) return [];

  return data.results
    .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
    .map(item => ({
      id: String(item.id),
      source: 'TMDB',
      type: item.media_type === 'movie' ? 'MOVIE' : 'SERIES',
      title: item.title || item.name,
      description: item.overview || '',
      releaseYear: item.release_date
        ? parseInt(item.release_date.slice(0, 4))
        : item.first_air_date
          ? parseInt(item.first_air_date.slice(0, 4))
          : null,
      rating: item.vote_average ? Math.round(item.vote_average * 10) / 10 : null,
      posterUrl: item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : null
    }));
}

// =====================================================
// Recherche dans IGDB (jeux vidéo)
// =====================================================
export async function searchIgdb(query) {
  const apicalypseQuery = `
    fields name, summary, first_release_date, rating, cover.image_id;
    search "${query.replace(/"/g, '\\"')}";
    where cover != null;
    limit 10;
  `;

  const games = await igdbQuery('games', apicalypseQuery);

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
      : null
  }));
}

// =====================================================
// Recherche dans Jikan (animes)
// =====================================================
export async function searchJikan(query) {
  const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=10&order_by=popularity`;

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
    posterUrl: anime.images?.jpg?.large_image_url || null
  }));
}

// =====================================================
// Recherche multi-source (les 3 API en parallèle)
// =====================================================
export async function searchAll(query) {
  // Lancer les 3 recherches en parallèle pour être rapide
  const [tmdbResults, igdbResults, jikanResults] = await Promise.allSettled([
    searchTmdb(query),
    searchIgdb(query),
    searchJikan(query)
  ]);

  // Récupérer les résultats (en ignorant les API qui ont échoué)
  const results = [
    ...(tmdbResults.status === 'fulfilled' ? tmdbResults.value : []),
    ...(igdbResults.status === 'fulfilled' ? igdbResults.value : []),
    ...(jikanResults.status === 'fulfilled' ? jikanResults.value : [])
  ];

  return results;
}

// =====================================================
// Œuvres populaires par catégorie
// =====================================================

export async function getPopularMovies() {
  const apiKey = process.env.TMDB_API_KEY;
  const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=fr-FR&page=1`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.results) return [];

  return data.results.slice(0, 10).map(item => ({
    id: String(item.id),
    source: 'TMDB',
    type: 'MOVIE',
    title: item.title,
    description: item.overview || '',
    releaseYear: item.release_date ? parseInt(item.release_date.slice(0, 4)) : null,
    rating: item.vote_average ? Math.round(item.vote_average * 10) / 10 : null,
    posterUrl: item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : null
  }));
}

export async function getPopularSeries() {
  const apiKey = process.env.TMDB_API_KEY;
  const url = `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=fr-FR&page=1`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.results) return [];

  return data.results.slice(0, 10).map(item => ({
    id: String(item.id),
    source: 'TMDB',
    type: 'SERIES',
    title: item.name,
    description: item.overview || '',
    releaseYear: item.first_air_date ? parseInt(item.first_air_date.slice(0, 4)) : null,
    rating: item.vote_average ? Math.round(item.vote_average * 10) / 10 : null,
    posterUrl: item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : null
  }));
}

export async function getPopularGames() {
  try {
  const query = `
    fields name, summary, first_release_date, rating, total_rating, total_rating_count, cover.image_id;
    where total_rating_count > 50 & cover != null;
    sort total_rating_count desc;
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
      rating: (game.total_rating || game.rating)
      ? Math.round(game.total_rating || game.rating) / 10
      : null,
      posterUrl: game.cover
      ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
      : null
  }));
  } catch (err) {
    console.error('!!! ERREUR IGDB getPopularGames :', err.message);
    console.error(err);
    return [];
  }
}

export async function getPopularAnimes() {
  const url = 'https://api.jikan.moe/v4/top/anime?limit=10&filter=bypopularity';

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
    posterUrl: anime.images?.jpg?.large_image_url || null
  }));
}

// =====================================================
// Tendances : mix des 4 catégories
// =====================================================
export async function getTrending() {
  // On lance les 4 requêtes en parallèle
  const [movies, series, games, animes] = await Promise.allSettled([
    getPopularMovies(),
    getPopularSeries(),
    getPopularGames(),
    getPopularAnimes()
  ]);

  const results = [];

  // On prend les 3 premiers de chaque source (mix équilibré)
  if (movies.status === 'fulfilled') results.push(...movies.value.slice(0, 3));
  if (series.status === 'fulfilled') results.push(...series.value.slice(0, 3));
  if (games.status === 'fulfilled') results.push(...games.value.slice(0, 3));
  if (animes.status === 'fulfilled') results.push(...animes.value.slice(0, 3));

  // On mélange (Fisher-Yates)
  for (let i = results.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [results[i], results[j]] = [results[j], results[i]];
  }

  return results;
}