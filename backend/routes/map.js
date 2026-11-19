const express = require('express');
const auth = require('../middleware/auth');
const { geocoder } = require('../services/ors');

const router = express.Router();

router.get('/geocode', auth, async (req, res) => {
  const texte = (req.query.text || '').trim();

  if (texte.length < 3) {
    return res.status(400).json({ message: 'Écrivez au moins 3 caractères' });
  }

  try {
    const resultats = await geocoder(texte);
    res.json(resultats);
  } catch (err) {
    console.error('Erreur geocodage :', err.response?.status, err.message);
    const msg = err.response?.status === 403
      ? 'Clé API OpenRouteService invalide ou expirée'
      : 'Service de géocodage indisponible. Vérifiez votre connexion Internet.';
    res.status(502).json({ message: msg });
  }
});

module.exports = router;