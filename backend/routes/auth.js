// =====================================================
// Routes d'authentification : inscription + connexion
// =====================================================
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// =====================================================
// POST /api/auth/register — Création d'un compte
// =====================================================
router.post('/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Validation basique
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, pseudo et mot de passe sont requis' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Le mot de passe doit faire au moins 8 caractères' });
    }

    // Vérifier que l'email n'est pas déjà utilisé
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }

    // Vérifier que le pseudo n'est pas déjà utilisé
    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      return res.status(409).json({ error: 'Ce pseudo est déjà utilisé' });
    }

    // Hacher le mot de passe (10 = nombre de tours, équilibre sécurité/perf)
    const passwordHash = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash
      }
    });

    // Générer un token JWT (valable 7 jours)
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Renvoyer le token + les infos publiques de l'utilisateur (sans le hash !)
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Erreur register:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// =====================================================
// POST /api/auth/login — Connexion
// =====================================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe sont requis' });
    }

    // Chercher l'utilisateur par email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // Comparer le mot de passe avec le hash
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // Générer un nouveau token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
// =====================================================
// GET /api/auth/me — Récupérer les infos de l'utilisateur connecté
// (route protégée par le middleware requireAuth)
// =====================================================
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Erreur /me:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// =====================================================
// POST /api/auth/reset — Réinitialiser ses données
// (supprime listes, historique — garde le compte et préférences)
// =====================================================
router.post('/reset', requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Supprimer toutes les listes (watchlist, favoris, vus, masqués)
    const mediaResult = await prisma.userMediaItem.deleteMany({
      where: { userId }
    });

    // Supprimer l'historique de recherche
    const historyResult = await prisma.searchHistory.deleteMany({
      where: { userId }
    });

    res.json({
      success: true,
      deleted: {
        mediaItems: mediaResult.count,
        searchHistory: historyResult.count
      }
    });
  } catch (error) {
    console.error('Erreur reset:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// =====================================================
// DELETE /api/auth/me — Supprimer définitivement le compte
// (RGPD : supprime tout, irréversible)
// =====================================================
router.delete('/me', requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Grâce au "onDelete: Cascade" dans le schéma Prisma,
    // toutes les données liées (préférences, listes, historique)
    // seront supprimées automatiquement avec le compte
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ success: true, message: 'Compte supprimé' });
  } catch (error) {
    console.error('Erreur suppression compte:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;