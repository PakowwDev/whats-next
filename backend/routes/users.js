// =====================================================
// Routes pour la gestion du profil utilisateur
// (préférences, modification du compte)
// =====================================================
import express from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { invalidateReco } from '../lib/recoCache.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Toutes les routes ci-dessous nécessitent une authentification
router.use(requireAuth);

// =====================================================
// GET /api/users/me/preferences
// Récupérer les préférences de l'utilisateur connecté
// =====================================================
router.get('/me/preferences', async (req, res) => {
  try {
    const prefs = await prisma.userPreferences.findUnique({
      where: { userId: req.user.userId }
    });

    if (!prefs) {
      return res.json({
        genres: {},
        platforms: []
      });
    }

    res.json({
      genres: prefs.genres,
      platforms: prefs.platforms
    });
  } catch (error) {
    console.error('Erreur GET /preferences:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// =====================================================
// PUT /api/users/me/preferences
// Enregistrer/mettre à jour les préférences
// Body : { genres: {...}, platforms: [...] }
// =====================================================
router.put('/me/preferences', async (req, res) => {
  try {
    const { genres, platforms } = req.body;

    // Validation basique
    if (genres && typeof genres !== 'object') {
      return res.status(400).json({ error: 'genres doit être un objet' });
    }
    if (platforms && !Array.isArray(platforms)) {
      return res.status(400).json({ error: 'platforms doit être un tableau' });
    }

    // upsert = update OR insert
    const prefs = await prisma.userPreferences.upsert({
      where: { userId: req.user.userId },
      update: {
        ...(genres !== undefined && { genres }),
        ...(platforms !== undefined && { platforms })
      },
      create: {
        userId: req.user.userId,
        genres: genres || {},
        platforms: platforms || []
      }
    });

    invalidateReco(req.user.userId);
    res.json({
      success: true,
      preferences: {
        genres: prefs.genres,
        platforms: prefs.platforms
      }
    });
  } catch (error) {
    console.error('Erreur PUT /preferences:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// =====================================================
// PUT /api/users/me — Modifier pseudo et email
// Body : { username, email }
// =====================================================
router.put('/me', async (req, res) => {
  try {
    const { username, email } = req.body;

    if (!username || !email) {
      return res.status(400).json({ error: 'Pseudo et email requis' });
    }
    if (username.trim().length < 3) {
      return res.status(400).json({ error: 'Le pseudo doit faire au moins 3 caractères' });
    }
    if (!email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ error: 'Email invalide' });
    }

    // Vérifier que l'email ou le pseudo ne sont pas déjà pris par quelqu'un d'autre
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase().trim() },
          { username: username.trim() }
        ],
        NOT: { id: req.user.userId }
      }
    });

    if (existing) {
      return res.status(409).json({
        error: existing.email === email.toLowerCase().trim()
          ? 'Cet email est déjà utilisé'
          : 'Ce pseudo est déjà pris'
      });
    }

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        username: username.trim(),
        email: email.toLowerCase().trim()
      },
      select: { id: true, username: true, email: true, createdAt: true }
    });

    res.json({ success: true, user });
  } catch (error) {
    console.error('Erreur PUT /api/users/me:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// =====================================================
// PUT /api/users/me/password — Changer le mot de passe
// Body : { currentPassword, newPassword }
// =====================================================
router.put('/me/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Mot de passe actuel et nouveau requis' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Le nouveau mot de passe doit faire au moins 8 caractères' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    // Vérifier le mot de passe actuel
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
    }

    // Hacher et enregistrer le nouveau
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { passwordHash }
    });

    res.json({ success: true, message: 'Mot de passe modifié' });
  } catch (error) {
    console.error('Erreur PUT /api/users/me/password:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;