// Importation des modules nécessaires
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './lib/prisma.js';
import { igdbQuery } from './lib/igdb.js';
// Charger les variables d'environnement depuis le fichier .env
dotenv.config();

// Créer une instance de l'application Express
const app = express();

// Définir le port (depuis .env si dispo, sinon 3000)
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Autorise les requêtes cross-origin (frontend ↔ backend)
app.use(express.json()); // Permet de lire les corps de requête en JSON

// Route de test pour vérifier que le serveur tourne
app.get('/', (req, res) => {
  res.json({
    message: "API What's Next? — serveur opérationnel",
    status: 'OK',
    version: '0.1.0'
  });
});

// Route de test pour le frontend
app.get('/api/hello', (req, res) => {
  res.json({
    message: "Hello depuis le backend What's Next? 👋",
    timestamp: new Date().toISOString()
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});

// Route de test : créer un utilisateur de test
app.post('/api/test-user', async (req, res) => {
  try {
    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        username: `testuser-${Date.now()}`,
        passwordHash: 'fake-hash-for-now'
      }
    });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route de test : compter les utilisateurs
app.get('/api/users-count', async (req, res) => {
  try {
    const count = await prisma.user.count();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route de test : récupérer les films populaires depuis TMDB
app.get('/api/test-tmdb', async (req, res) => {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=fr-FR&page=1`;

    const response = await fetch(url);
    const data = await response.json();

    // On renvoie juste les 5 premiers films pour pas surcharger
    const movies = data.results.slice(0, 5).map(movie => ({
      id: movie.id,
      title: movie.title,
      releaseDate: movie.release_date,
      rating: movie.vote_average,
      overview: movie.overview,
      posterUrl: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    }));

    res.json({ source: 'TMDB', count: movies.length, movies });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route de test : récupérer des jeux populaires depuis IGDB
app.get('/api/test-igdb', async (req, res) => {
  try {
    // Requête en APIcalypse : récupère les 5 jeux les mieux notés
    const query = `
      fields name, summary, first_release_date, rating, cover.image_id;
      where rating > 85 & cover != null;
      sort rating desc;
      limit 5;
    `;

    const games = await igdbQuery('games', query);

    // Format simplifié
    const formatted = games.map(game => ({
      id: game.id,
      title: game.name,
      summary: game.summary,
      rating: game.rating ? Math.round(game.rating) / 10 : null,
      releaseDate: game.first_release_date
        ? new Date(game.first_release_date * 1000).toISOString().split('T')[0]
        : null,
      coverUrl: game.cover
        ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
        : null
    }));

    res.json({ source: 'IGDB', count: formatted.length, games: formatted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route de test : récupérer des animes populaires depuis Jikan
app.get('/api/test-jikan', async (req, res) => {
  try {
    // Top animes (équivalent "populaires")
    const url = 'https://api.jikan.moe/v4/top/anime?limit=5';

    const response = await fetch(url);
    const data = await response.json();

    const animes = data.data.map(anime => ({
      id: anime.mal_id,
      title: anime.title,
      titleEnglish: anime.title_english,
      synopsis: anime.synopsis,
      score: anime.score,
      episodes: anime.episodes,
      year: anime.year,
      genres: anime.genres.map(g => g.name),
      coverUrl: anime.images.jpg.large_image_url,
      trailerUrl: anime.trailer?.url || null
    }));

    res.json({ source: 'Jikan', count: animes.length, animes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});