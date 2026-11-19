const express = require('express');
const User = require('../models/User');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const auth = require('../middleware/auth');

const router = express.Router();
const COULEURS = ['blanc', 'noir', 'gris', 'argent', 'rouge', 'bleu', 'vert', 'jaune', 'orange', 'marron', 'autre'];

router.put('/me', auth, async (req, res) => {
  try {
    const { nom, filiere, adresse, preferences, domicile, telephone, contactConfiance } = req.body;
    const maj = {};

    if (nom !== undefined) {
      if (!nom.trim()) {
        return res.status(400).json({ message: 'Le nom ne peut pas être vide' });
      }
      maj.nom = nom.trim();
    }
    if (filiere !== undefined) maj.filiere = filiere;
    if (adresse !== undefined) maj.adresse = adresse;
    if (telephone !== undefined) maj.telephone = String(telephone).trim();
    if (contactConfiance !== undefined) {
      const nomC = String(contactConfiance?.nom || '').trim();
      const tel = String(contactConfiance?.telephone || '').replace(/[^\d+]/g, '');
      if (tel && (tel.replace('+', '').length < 8 || tel.length > 15)) {
        return res.status(400).json({ message: 'Numéro du contact de confiance invalide' });
      }
      maj.contactConfiance = { nom: nomC.slice(0, 60), telephone: tel };
    }

    // Adresse géolocalisée choisie avec la recherche d'adresse (sert au matching)
    if (domicile === null) {
      maj.domicile = null;
    } else if (domicile !== undefined) {
      const { label, lat, lng } = domicile;
      if (typeof label !== 'string' || !label.trim() || !Number.isFinite(lat) || !Number.isFinite(lng)) {
        return res.status(400).json({ message: 'Adresse invalide' });
      }
      maj.domicile = { label: label.trim(), location: { type: 'Point', coordinates: [lng, lat] } };
      maj.adresse = label.trim();
    }

    if (preferences) {
      if (typeof preferences.nonFumeur === 'boolean') maj['preferences.nonFumeur'] = preferences.nonFumeur;
      if (typeof preferences.mixte === 'boolean') maj['preferences.mixte'] = preferences.mixte;
      if (['calme', 'animee', 'aucune'].includes(preferences.musique)) {
        maj['preferences.musique'] = preferences.musique;
      }
      // Marquer que l'utilisateur a volontairement configuré ses préférences
      maj['preferences.definies'] = true;
    }

    // Permettre l'effacement explicite des préférences (null = "non défini")
    if (preferences === null) {
      maj['preferences.nonFumeur'] = undefined;
      maj['preferences.mixte'] = undefined;
      maj['preferences.musique'] = undefined;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: maj },
      { returnDocument: 'after', runValidators: true }
    ).select('-motDePasse');

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.put('/me/vehicule', auth, async (req, res) => {
  try {
    const { marque, couleur, places, matricule, photo } = req.body;
    const nbPlaces = Number(places);

    if (!marque || !matricule || !nbPlaces || !COULEURS.includes(couleur)) {
      return res.status(400).json({ message: 'Marque, couleur, places et matricule sont obligatoires' });
    }
    if (nbPlaces < 1 || nbPlaces > 8) {
      return res.status(400).json({ message: 'Le nombre de places doit être entre 1 et 8' });
    }

    const majVehicule = { marque, couleur, places: nbPlaces, matricule };
    if (typeof photo === 'string') majVehicule.photo = photo;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { vehicule: majVehicule } },
      { returnDocument: 'after', runValidators: true }
    ).select('-motDePasse');

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.delete('/me/vehicule', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { vehicule: null } },
      { returnDocument: 'after' }
    ).select('-motDePasse');

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.put('/me/photo', auth, async (req, res) => {
  try {
    const { photo } = req.body;
    const valide =
      typeof photo === 'string' &&
      photo.length <= 300000 &&
      /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(photo);

    if (!valide) {
      return res.status(400).json({ message: 'Photo invalide ou trop lourde' });
    }

    const user = await User.findByIdAndUpdate(req.userId, { $set: { photo } }, { returnDocument: 'after' }).select('photo');
    res.json({ photo: user.photo });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.delete('/me/photo', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, { $set: { photo: '' } });
    res.json({ photo: '' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * Suppression de compte (US3 — Droit à l'oubli / RGPD).
 * - Annule les trajets actifs du conducteur et prévient ses passagers.
 * - Annule les réservations en attente ou acceptées du passager et libère les places.
 * - Supprime les avis, les notifications et enfin le document utilisateur.
 */
router.delete('/me', auth, async (req, res) => {
  try {
    const userId = req.userId;

    // 1. Annuler les trajets actifs publiés par l'utilisateur (en tant que conducteur)
    const trajetsActifs = await Ride.find({ conducteur: userId, statut: 'actif' });
    for (const ride of trajetsActifs) {
      ride.statut = 'annule';
      await ride.save();
      // Libérer les réservations liées
      await Booking.updateMany({ trajet: ride._id, statut: { $in: ['en_attente', 'acceptee'] } }, { $set: { statut: 'annulee' } });
    }

    // 2. Annuler les réservations actives du passager et recréditer les places
    const reservations = await Booking.find({ passager: userId, statut: { $in: ['en_attente', 'acceptee'] } });
    for (const b of reservations) {
      if (b.statut === 'acceptee') {
        await Ride.findByIdAndUpdate(b.trajet, { $inc: { places: b.places || 1 } });
      }
      b.statut = 'annulee';
      await b.save();
    }

    // 3. Anonymiser les avis écrits par l'utilisateur (on garde les notes pour la confiance)
    await Review.updateMany({ auteur: userId }, { $set: { commentaire: '[Compte supprimé]', badges: [] } });

    // 4. Supprimer le compte utilisateur
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Votre compte a été supprimé définitivement.' });
  } catch (err) {
    console.error('Erreur suppression compte :', err);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression du compte' });
  }
});

module.exports = router;
