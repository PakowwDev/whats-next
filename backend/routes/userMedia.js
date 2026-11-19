// =====================================================
// Routes pour les actions utilisateur sur les œuvres
// (watchlist, favoris, vus, masqués)
// Toutes les routes sont protégées par l'authentification
// =====================================================
import express from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { invalidateReco } from '../lib/recoCache.js';
import { getMediaDetail } from '../lib/mediaDetail.js';

const router = express.Router();

// Toutes les routes ci-dessous nécessitent une authentification
router.use(requireAuth);

const validTypes = ['MOVIE', 'SERIES', 'GAME', 'ANIME'];
const validSources = ['TMDB', 'IGDB', 'ANILIST'];
const validItemTypes = ['WATCHLIST', 'FAVORITE', 'SEEN', 'HIDDEN'];

// =====================================================
// GET /api/me/media/summary
// Compteurs des 4 listes + aperçu de la watchlist
// ⚠️ Doit rester AVANT la route /:itemType
// =====================================================
router.get('/summary', async (req, res) => {
  try {
    const userId = req.user.userId;

    // Compter les œuvres de chaque liste en une seule requête
    const grouped = await prisma.userMediaItem.groupBy({
      by: ['itemType'],
      where: { userId },
      _count: { itemType: true }
    });

    const counts = {
      WATCHLIST: 0,
      FAVORITE: 0,
      SEEN: 0,
      HIDDEN: 0
    };
    grouped.forEach(g => {
      counts[g.itemType] = g._count.itemType;
    });

    // Les 10 dernières œuvres ajoutées à la watchlist
    const items = await prisma.userMediaItem.findMany({
      where: { userId, itemType: 'WATCHLIST' },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Récupérer leurs détails en parallèle
    const details = await Promise.allSettled(
      items.map(item =>
        getMediaDetail(item.mediaSource, item.mediaType, item.externalId)
      )
    );

    // On garde celles qui ont répondu, au format des carrousels
    const watchlist = details
      .filter(d => d.status === 'fulfilled')
      .map(d => ({
        id: d.value.id,
        source: d.value.source,
        type: d.value.type,
        title: d.value.title,
        releaseYear: d.value.releaseYear,
        rating: d.value.rating,
        posterUrl: d.value.posterUrl
      }));

    res.json({ counts, watchlist });
  } catch (error) {
    console.error('Erreur GET /api/me/media/summary:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// =====================================================
// GET /api/me/media/:itemType — Récupérer une liste
// (ex: /api/me/media/WATCHLIST)
// =====================================================
router.get('/:itemType', async (req, res) => {
  try {
    const { itemType } = req.params;

    if (!validItemTypes.includes(itemType)) {
      return res.status(400).json({ error: 'Type de liste invalide' });
    }

    const items = await prisma.userMediaItem.findMany({
      where: {
        userId: req.user.userId,
        itemType
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ count: items.length, items });
  } catch (error) {
    console.error('Erreur GET /api/me/media:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// =====================================================
// POST /api/me/media — Ajouter une œuvre à une liste
// Body : { source, type, externalId, itemType }
// =====================================================
router.post('/', async (req, res) => {
  try {
    const { source, type, externalId, itemType } = req.body;

    // Validations
    if (!source || !type || !externalId || !itemType) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }
    if (!validSources.includes(source)) {
      return res.status(400).json({ error: 'Source invalide' });
    }
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Type invalide' });
    }
    if (!validItemTypes.includes(itemType)) {
      return res.status(400).json({ error: 'Type de liste invalide' });
    }

    // Vérifier si l'œuvre n'est pas déjà dans cette liste
    const existing = await prisma.userMediaItem.findFirst({
      where: {
        userId: req.user.userId,
        mediaSource: source,
        externalId: String(externalId),
        itemType
      }
    });

    if (existing) {
      return res.status(409).json({ error: 'Œuvre déjà présente dans cette liste' });
    }

    // Créer l'entrée
    const item = await prisma.userMediaItem.create({
      data: {
        userId: req.user.userId,
        mediaSource: source,
        mediaType: type,
        externalId: String(externalId),
        itemType
      }
    });

    invalidateReco(req.user.userId);
    res.status(201).json({ success: true, item });
  } catch (error) {
    console.error('Erreur POST /api/me/media:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// =====================================================
// DELETE /api/me/media?source=&externalId=&itemType=
// (paramètres en query string pour éviter les soucis avec fetch + DELETE)
// =====================================================
router.delete('/', async (req, res) => {
  try {
    const { source, externalId, itemType } = req.query;

    if (!source || !externalId || !itemType) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }

    const result = await prisma.userMediaItem.deleteMany({
      where: {
        userId: req.user.userId,
        mediaSource: source,
        externalId: String(externalId),
        itemType
      }
    });

    if (result.count === 0) {
      return res.status(404).json({ error: 'Élément introuvable' });
    }

    invalidateReco(req.user.userId);
    res.json({ success: true, deleted: result.count });
  } catch (error) {
    console.error('Erreur DELETE /api/me/media:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// =====================================================
// GET /api/me/media-status?source=&externalId=
// Renvoie un objet indiquant dans quelles listes l'œuvre se trouve
// (utile pour la fiche détaillée : afficher les boutons en surbrillance)
// =====================================================
router.get('/status/check', async (req, res) => {
  try {
    const { source, externalId } = req.query;

    if (!source || !externalId) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }

    const items = await prisma.userMediaItem.findMany({
      where: {
        userId: req.user.userId,
        mediaSource: source,
        externalId: String(externalId)
      },
      select: { itemType: true }
    });

    const status = {
      WATCHLIST: false,
      FAVORITE: false,
      SEEN: false,
      HIDDEN: false
    };

    items.forEach(item => {
      status[item.itemType] = true;
    });

    res.json({ status });
  } catch (error) {
    console.error('Erreur status:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;