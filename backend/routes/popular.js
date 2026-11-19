// =====================================================
// Routes pour les œuvres populaires (page d'accueil)
// =====================================================
import express from 'express';
import {
  getTrending,
  getPopularMovies,
  getPopularSeries,
  getPopularGames,
  getPopularAnimes
} from '../lib/mediaApi.js';

const router = express.Router();

// Cache simple en mémoire (30 min)
const cache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function setCache(key, value) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS
  });
}

// =====================================================
// GET /api/popular — Renvoie toutes les catégories d'un coup
// =====================================================
router.get('/', async (req, res) => {
  try {
    const cached = getCached('all');
    if (cached) {
      return res.json({ ...cached, cached: true });
    }

    // Requêtes parallèles pour aller vite
    const [trending, movies, series, games, animes] = await Promise.allSettled([
      getTrending(),
      getPopularMovies(),
      getPopularSeries(),
      getPopularGames(),
      getPopularAnimes()
    ]);

    const result = {
      trending: trending.status === 'fulfilled' ? trending.value : [],
      movies: movies.status === 'fulfilled' ? movies.value : [],
      series: series.status === 'fulfilled' ? series.value : [],
      games: games.status === 'fulfilled' ? games.value : [],
      animes: animes.status === 'fulfilled' ? animes.value : []
    };

    setCache('all', result);
    res.json({ ...result, cached: false });
  } catch (error) {
    console.error('Erreur /api/popular:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;