// =====================================================
// Routes pour les détails d'une œuvre
// =====================================================
import express from 'express';
import { getMediaDetail } from '../lib/mediaDetail.js';

const router = express.Router();

// =====================================================
// GET /api/media/:source/:type/:id
// =====================================================
router.get('/:source/:type/:id', async (req, res) => {
  try {
    const { source, type, id } = req.params;

    // Validation des paramètres
    const validSources = ['TMDB', 'IGDB', 'ANILIST'];
    const validTypes = ['MOVIE', 'SERIES', 'GAME', 'ANIME'];

    if (!validSources.includes(source)) {
      return res.status(400).json({ error: 'Source invalide' });
    }
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Type invalide' });
    }

    const detail = await getMediaDetail(source, type, id);
    res.json(detail);
  } catch (error) {
    console.error('Erreur /api/media:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;