// =====================================================
// Middleware de vérification du token JWT
// =====================================================
import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  // Récupérer l'en-tête Authorization
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  // L'en-tête doit être au format "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Format du token invalide' });
  }

  const token = parts[1];

  try {
    // Vérifier la signature du token avec notre JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attacher les infos décodées à la requête
    // (ainsi req.user sera accessible dans les routes suivantes)
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    // Tout est bon, on passe à la route suivante
    next();
  } catch (error) {
    // Le token est invalide, expiré, ou mal signé
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}