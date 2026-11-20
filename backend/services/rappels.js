const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const { creerNotification } = require('./notifier');
const { enMinutes, NOMS_JOURS } = require('./matching');

const AVANCE_MIN = 30; // rappel envoyé 30 minutes avant le départ
const court = (label) => (label || '').split(',')[0].trim();

function aujourdhui() {
  const d = new Date();
  const p = (x) => String(x).padStart(2, '0');
  return { iso: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`, jour: NOMS_JOURS[d.getDay()], minutes: d.getHours() * 60 + d.getMinutes() };
}

/** Termine automatiquement les trajets "en_cours" dont l'heure de départ + durée + 60 min buffer est dépassée. */
async function terminerTrajetsExpires() {
  const maintenant = new Date();
  // On cherche les trajets en cours depuis plus de (dureeMin + 60 min) OU démarrés il y a plus de 3h
  const limite = new Date(maintenant.getTime() - 3 * 60 * 60 * 1000); // 3h max
  const rides = await Ride.find({
    statut: 'en_cours',
    startedAt: { $lt: limite },
  }).select('conducteur depart destination heureDepart startedAt dureeMin');

  let termines = 0;
  for (const ride of rides) {
    // Vérifier si dureeMin est connue et si le trajet est vraiment terminé
    const debutMs = new Date(ride.startedAt).getTime();
    const dureeBuffer = ((ride.dureeMin || 60) + 60) * 60 * 1000; // dureeMin + 60 min buffer
    if (maintenant.getTime() - debutMs < dureeBuffer) continue;

    await Ride.updateOne({ _id: ride._id }, { $set: { statut: 'termine', finishedAt: maintenant } });

    // Notifier le conducteur
    await creerNotification({
      destinataire: ride.conducteur,
      type: 'trajet_termine',
      titre: 'Trajet terminé automatiquement',
      message: `Votre trajet ${court(ride.depart.label)} → ${court(ride.destination.label)} a été clôturé automatiquement.`,
      donnees: { trajetId: ride._id },
    }).catch(() => {});

    termines += 1;
  }
  return termines;
}

/** Envoie « Votre trajet part dans 30 min » au conducteur et aux passagers confirmés. */
async function envoyerRappels() {
  const { iso, jour, minutes } = aujourdhui();
  const rides = await Ride.find({
    statut: 'actif',
    rappels: { $ne: iso },
    $or: [{ recurrent: true, jours: jour }, { recurrent: false, date: new Date(`${iso}T00:00:00.000Z`) }],
  }).select('conducteur depart destination heureDepart');

  let envoyes = 0;
  for (const ride of rides) {
    const avant = enMinutes(ride.heureDepart) - minutes;
    if (avant < 0 || avant > AVANCE_MIN) continue;

    // Marquer d'abord pour ne jamais envoyer deux fois (plusieurs serveurs / redémarrage)
    const maj = await Ride.updateOne({ _id: ride._id, rappels: { $ne: iso } }, { $push: { rappels: { $each: [iso], $slice: -14 } } });
    if (!maj.modifiedCount) continue;

    const trajetTexte = `${court(ride.depart.label)} → ${court(ride.destination.label)}`;
    const passagers = await Booking.find({ trajet: ride._id, statut: 'acceptee' }).select('passager');
    await creerNotification({
      destinataire: ride.conducteur,
      type: 'rappel_trajet',
      titre: `Départ dans ${avant} min`,
      message: `${trajetTexte} à ${ride.heureDepart} · ${passagers.length} passager(s) confirmé(s). Pensez à démarrer le trajet.`,
      donnees: { trajetId: ride._id },
    });
    for (const b of passagers) {
      await creerNotification({
        destinataire: b.passager,
        type: 'rappel_trajet',
        titre: `Votre covoiturage part dans ${avant} min`,
        message: `${trajetTexte} à ${ride.heureDepart}. Soyez au point de rendez-vous à l'heure.`,
        donnees: { trajetId: ride._id, bookingId: b._id },
      });
    }
    envoyes += 1;
  }
  return envoyes;
}

function demarrerRappels() {
  const tick = () => envoyerRappels().catch((err) => console.error('Erreur rappels :', err.message));
  const tickExpires = () => terminerTrajetsExpires().catch((err) => console.error('Erreur auto-terminer :', err.message));
  setTimeout(tick, 5000);
  setTimeout(tickExpires, 10000); // vérification initiale après 10s
  setInterval(tick, 60 * 1000);
  setInterval(tickExpires, 10 * 60 * 1000); // vérification toutes les 10 min
}

module.exports = { envoyerRappels, demarrerRappels, terminerTrajetsExpires };
