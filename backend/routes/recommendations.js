// =====================================================
// Routes pour les recommandations personnalisées
// (nécessite d'être connecté)
// =====================================================
import express from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import {
  getPersonalizedRecommendations,
  getMixRecommendations
} from '../lib/recommendations.js';
import { getTrending } from '../lib/mediaApi.js';
import { getCachedReco, setCachedReco } from '../lib/recoCache.js';

const router = express.Router();

router.use(requireAuth);

// =====================================================
// GET /api/recommendations
// Renvoie { forYou: [...], mix: [...] }
// =====================================================
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;

    const cached = getCachedReco(userId);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }
    
    // 1. Récupérer les préférences de l'utilisateur
    const prefs = await prisma.userPreferences.findUnique({
      where: { userId }
    });

    // Si pas de préférences, on renvoie vide (le front affichera un message)
    if (!prefs || !prefs.genres || Object.keys(prefs.genres).length === 0) {
      return res.json({
        forYou: [],
        mix: [],
        noPreferences: true,
        cached: false
      });
    }

    // 2. Récupérer les œuvres à exclure (vues + masquées)
    const excludedItems = await prisma.userMediaItem.findMany({
      where: {
        userId,
        itemType: { in: ['SEEN', 'HIDDEN'] }
      },
      select: { mediaSource: true, externalId: true }
    });

    const excludedIds = excludedItems.map(
      item => `${item.mediaSource}-${item.externalId}`
    );

    // 3. Calculer les recommandations
    const [forYou, trending] = await Promise.all([
      getPersonalizedRecommendations(prefs, excludedIds),
      getTrending()
    ]);

    const mix = await getMixRecommendations(prefs, trending, excludedIds);

    const result = {
      forYou: forYou.slice(0, 20),
      mix: mix.slice(0, 20),
      noPreferences: false
    };

    setCachedReco(userId, result);
    res.json({ ...result, cached: false });
    } catch (error) {
    console.error('Erreur /api/recommendations:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;