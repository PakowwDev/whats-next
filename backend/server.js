// =====================================================
// Serveur principal de What's Next?
// =====================================================
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import searchRoutes from './routes/search.js';
import mediaRoutes from './routes/media.js';
import userMediaRoutes from './routes/userMedia.js';
import usersRoutes from './routes/users.js';
import popularRoutes from './routes/popular.js';
import recommendationsRoutes from './routes/recommendations.js';

// Charger les variables d'environnement
dotenv.config();

// Créer l'application Express
const app = express();
const PORT = process.env.PORT || 3000;

// =====================================================
// MIDDLEWARES GLOBAUX
// =====================================================
// Sites autorisés à appeler cette API.
// FRONTEND_URL est défini dans les réglages de Render ;
// localhost reste autorisé pour le développement.
const allowedOrigins = [
  'http://localhost:5173',
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : [])
];

app.use(cors({
  origin: (origin, callback) => {
    // Pas d'origine = appel direct (curl, Thunder Client) : autorisé
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Origine non autorisée par le CORS'));
  }
}));
app.use(express.json());
app.use('/api/media', mediaRoutes);
app.use('/api/me/media', userMediaRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/popular', popularRoutes);
app.use('/api/recommendations', recommendationsRoutes);

// =====================================================
// ROUTES
// =====================================================

// Route racine : vérifie que l'API tourne
app.get('/', (req, res) => {
  res.json({
    name: "What's Next? API",
    status: 'OK',
    version: '0.1.0'
  });
});

// Les routes spécifiques seront branchées ici au fur et à mesure
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
// app.use('/api/search', searchRoutes);
// app.use('/api/users', usersRoutes);
// app.use('/api/media', mediaRoutes);

// =====================================================
// DÉMARRAGE DU SERVEUR
// =====================================================
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});