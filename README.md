# UniRide 🚗🎓

**Plateforme de covoiturage étudiant intelligent — ISET Nabeul**  
*Projet d'intégration (Sprints 1 à 6 — US1 à US22)*

---

## 👥 Équipe de développement

* **Bahri Hajer** — [bahrihajer14@gmail.com](mailto:bahrihajer14@gmail.com)
* **Bahloul Zeineb** — [bahloulzeineb0@gmail.com](mailto:bahloulzeineb0@gmail.com)
* **Ben Taher Mohamed** — [Bentaherm233@gmail.com](mailto:Bentaherm233@gmail.com)

**Institut :** Institut Supérieur des Études Technologiques de Nabeul (ISET Nabeul)  
**Département :** Technologies de l'Informatique

---

## 🌟 Présentation du projet

UniRide est une application mobile et web facilitant le déplacement quotidien des étudiants de l'ISET Nabeul. Elle résout les problèmes de transport (coûts élevés des taxis, transports en commun insuffisants) en connectant les étudiants conducteurs et passagers empruntant les mêmes itinéraires et ayant des horaires concordants.

### 🚀 Fonctionnalités phares (Sprints 1 à 6)
- **Authentification & Sécurité (US1, US2) :** Inscription avec filières réelles de l'ISET, connexion JWT, réinitialisation de mot de passe par code par e-mail via Nodemailer.
- **Profil & Véhicule (US3, US4) :** Gestion du profil, préférences (non-fumeur, mixte, musique), domicile géolocalisé pour le matching, ajout de véhicule avec photo.
- **Emploi du temps & Publication (US5, US6) :** Import et saisie d'emploi du temps, publication de trajets réguliers (toute la semaine) ou ponctuels.
- **Recherche, Carte & Réservation (US7, US8, US9, US10) :** Recherche multicritère, carte Leaflet / OpenStreetMap gratuite sans clé payante, réservation et acceptation/refus instantané.
- **Matching intelligent (US11) :** Algorithme de compatibilité sur 100 :
  $$\text{Score} = (35\% \times \text{Proximité}) + (35\% \times \text{Horaires}) + (15\% \times \text{Préférences}) + (15\% \times \text{Note})$$
- **Chat & Notifications (US12, US13) :** Messagerie instantanée temps réel via Socket.io et notifications push/in-app.
- **Confiance, Avis & Statistiques (US14, US15, US16, US17) :** Évaluations mutuelles, signalements avec arbitrage, économies d'argent (DT), calcul de CO₂ évité (kg) et badges d'engagement.
- **Trajet en direct (US21) :** Écran de trajet actif avec jauge d'avancement, estimation en temps réel de l'arrivée et récapitulatif.
- **Bouton SOS d'urgence (US22) :** Partage direct des coordonnées GPS avec le contact ICE par SMS, alerte temps réel vers le tableau de bord Admin, boutons d'appel direct (197 Police, 190 SAMU, 198 Protection Civile).
- **Administration complète (US18, US19, US20) :** Tableau de bord KPI, gestion et blocage des utilisateurs, traitement des signalements avec compteurs dynamiques.

---

## 🛠️ Stack technique

| Composant | Technologies |
|---|---|
| **Mobile & Web** | React Native, Expo (SDK 58), React Navigation |
| **Cartographie** | OpenStreetMap, Leaflet, OpenRouteService / OSRM |
| **Backend** | Node.js, Express.js, Socket.io |
| **Base de données** | MongoDB Atlas / Local, Mongoose (index 2dsphere) |
| **Sécurité** | JWT (JSON Web Tokens), Bcrypt.js |
| **E-mails** | Nodemailer (Service Gmail SMTP) |

---

## 📦 Installation et démarrage

### 1. Cloner le dépôt
```bash
git clone https://github.com/Hajer1406/UniRide.git
cd UniRide
```

### 2. Configurer et lancer le backend
```bash
cd backend
npm install
cp .env.example .env
# Remplir les informations dans .env (MONGO_URI, JWT_SECRET, etc.)
npm run seed  # (optionnel) Charger les données de démo pour la soutenance
npm run dev   # Démarre sur le port 5000
```

### 3. Lancer l'application mobile & web
```bash
cd ../mobile
npm install
npx expo start
```
- Appuyez sur **`w`** pour ouvrir dans votre navigateur web (`http://localhost:8081`).
- Scannez le QR Code avec **Expo Go** pour tester sur smartphone iOS ou Android.

---

## 📄 Licence
Projet académique développé dans le cadre du projet d'intégration — ISET Nabeul 2026.
