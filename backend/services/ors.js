const axios = require('axios');

const ORS_BASE = 'https://api.openrouteservice.org';
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

/**
 * Géocodage : utilise Nominatim (OpenStreetMap, gratuit, sans clé) en priorité.
 * Bascule sur OpenRouteService uniquement si ORS_API_KEY est définie dans .env.
 */
async function geocoder(texte) {
  // Nominatim (toujours disponible, sans clé)
  try {
    const { data } = await axios.get(`${NOMINATIM_BASE}/search`, {
      params: {
        q: texte,
        countrycodes: 'tn',
        format: 'json',
        addressdetails: 1,
        limit: 7,
        'accept-language': 'fr',
      },
      headers: { 'User-Agent': 'UniRide-ISET-Nabeul/1.0 (bahloulzeineb0@gmail.com)' },
      timeout: 10000,
    });

    if (data && data.length > 0) {
      return data.map((f) => {
        const a = f.address || {};
        // Construire un label lisible en français : Ville/Quartier, Gouvernorat, Tunisie
        const parties = [
          a.village || a.town || a.city_district || a.suburb || a.neighbourhood || a.hamlet,
          a.city || a.county || a.state_district,
          a.state,
        ].filter(Boolean);
        const label = parties.length > 0 ? [...new Set(parties)].join(', ') + ', Tunisie' : f.display_name;
        return {
          label,
          lat: parseFloat(f.lat),
          lng: parseFloat(f.lon),
        };
      });
    }
  } catch (err) {
    console.warn('Nominatim indisponible, bascule sur ORS :', err.message);
  }

  // Fallback : OpenRouteService si clé configurée
  if (process.env.ORS_API_KEY && process.env.ORS_API_KEY !== 'votre-cle-openrouteservice') {
    const { data } = await axios.get(`${ORS_BASE}/geocode/search`, {
      params: {
        api_key: process.env.ORS_API_KEY,
        text: texte,
        'boundary.country': 'TN',
        size: 5,
      },
      timeout: 10000,
    });
    return data.features.map((f) => ({
      label: f.properties.label,
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
    }));
  }

  throw new Error('Aucun service de géocodage disponible');
}

/**
 * Calcul d'itinéraire : utilise OpenRouteService si la clé est disponible,
 * sinon retourne un itinéraire simplifié (ligne droite) pour le développement.
 */
async function itineraire(depart, arrivee) {
  if (process.env.ORS_API_KEY && process.env.ORS_API_KEY !== 'votre-cle-openrouteservice') {
    const { data } = await axios.post(
      `${ORS_BASE}/v2/directions/driving-car/geojson`,
      {
        coordinates: [
          [depart.lng, depart.lat],
          [arrivee.lng, arrivee.lat],
        ],
      },
      {
        headers: { Authorization: process.env.ORS_API_KEY, 'Content-Type': 'application/json' },
        timeout: 15000,
      }
    );

    const feature = data.features[0];
    const { distance, duration } = feature.properties.summary;

    return {
      distanceKm: Math.round(distance / 100) / 10,
      dureeMin: Math.max(1, Math.round(duration / 60)),
      points: feature.geometry.coordinates,
    };
  }

  // Fallback sans clé : OSRM public (gratuit, sans clé)
  try {
    const { data } = await axios.get(
      `https://router.project-osrm.org/route/v1/driving/${depart.lng},${depart.lat};${arrivee.lng},${arrivee.lat}`,
      {
        params: { overview: 'full', geometries: 'geojson' },
        timeout: 15000,
      }
    );
    const route = data.routes[0];
    return {
      distanceKm: Math.round(route.distance / 100) / 10,
      dureeMin: Math.max(1, Math.round(route.duration / 60)),
      points: route.geometry.coordinates,
    };
  } catch (err) {
    console.warn('OSRM indisponible, itinéraire simplifié :', err.message);
    // Dernier recours : ligne droite estimée
    const dLat = arrivee.lat - depart.lat;
    const dLng = arrivee.lng - depart.lng;
    const distKm = Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 111 * 10) / 10;
    return {
      distanceKm: distKm,
      dureeMin: Math.max(5, Math.round(distKm * 1.5)),
      points: [
        [depart.lng, depart.lat],
        [(depart.lng + arrivee.lng) / 2, (depart.lat + arrivee.lat) / 2],
        [arrivee.lng, arrivee.lat],
      ],
    };
  }
}

module.exports = { geocoder, itineraire };
