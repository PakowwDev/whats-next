// =====================================================
// Routes de recherche d'œuvres
// =====================================================
import express from 'express';
import { searchAll } from '../lib/mediaApi.js';

const router = express.Router();

// =====================================================
// GET /api/search?q=motcle — Recherche multi-source
// =====================================================
router.get('/', async (req, res) => {
  try {
    const query = req.query.q;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        error: 'La recherche doit faire au moins 2 caractères'
      });
    }

    const results = await searchAll(query.trim());

    res.json({
      query: query.trim(),
      count: results.length,
      results
    });
  } catch (error) {
    console.error('Erreur /api/search:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;