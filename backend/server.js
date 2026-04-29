// Importation des modules nécessaires
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

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