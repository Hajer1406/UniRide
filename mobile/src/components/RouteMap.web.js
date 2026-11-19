import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme';

/**
 * Version Web de la carte d'itinéraire (US8).
 * Utilise OpenStreetMap + tuiles CartoDB Voyager via Leaflet dans un iframe,
 * évitant ainsi le crash natif de react-native-maps sur navigateur.
 */
export default function RouteMap({ ride, height = 220, voiture, style }) {
  if (!ride?.depart?.location?.coordinates || !ride?.destination?.location?.coordinates) {
    return <View style={[styles.box, { height }, style]} />;
  }

  const [lngD, latD] = ride.depart.location.coordinates;
  const [lngA, latA] = ride.destination.location.coordinates;
  // Leaflet attend [latitude, longitude]
  const points = (ride.itineraire || []).map(([lng, lat]) => [lat, lng]);
  const depart = [latD, lngD];
  const arrivee = [latA, lngA];
  const voitureCoord = voiture ? [voiture.latitude, voiture.longitude] : null;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { box-sizing: border-box; }
    html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #EEF2F6; }
    .car-pulse {
      background: #0D47A1;
      border: 2px solid #FFFFFF;
      border-radius: 50%;
      width: 14px;
      height: 14px;
      box-shadow: 0 0 0 6px rgba(13,71,161,0.28);
    }
    .leaflet-popup-content-wrapper { border-radius: 8px; font-family: sans-serif; font-size: 12px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    try {
      var map = L.map('map', { zoomControl: false });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      var pts = ${JSON.stringify(points)};
      var dep = ${JSON.stringify(depart)};
      var arr = ${JSON.stringify(arrivee)};
      var car = ${JSON.stringify(voitureCoord)};

      if (pts && pts.length > 1) {
        L.polyline(pts, { color: '${colors.primary}', weight: 5, opacity: 0.85 }).addTo(map);
        map.fitBounds(pts, { padding: [35, 35] });
      } else {
        map.fitBounds([dep, arr], { padding: [35, 35] });
      }

      L.circleMarker(dep, {
        radius: 8,
        fillColor: '#1976D2',
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 1
      }).addTo(map).bindPopup("<b>Départ:</b> " + ${JSON.stringify(ride.depart?.label || '')});

      L.circleMarker(arr, {
        radius: 8,
        fillColor: '#F57F17',
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 1
      }).addTo(map).bindPopup("<b>Arrivée:</b> " + ${JSON.stringify(ride.destination?.label || '')});

      if (car) {
        var carIcon = L.divIcon({
          className: 'car-pulse',
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });
        L.marker(car, { icon: carIcon }).addTo(map).bindPopup("Véhicule");
      }
    } catch (e) {
      console.warn("Leaflet map error:", e);
    }
  </script>
</body>
</html>`;

  return (
    <View style={[styles.box, { height }, style]}>
      <iframe
        title="Carte OpenStreetMap"
        srcDoc={html}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: radius.lg,
          display: 'block',
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.input,
  },
});
