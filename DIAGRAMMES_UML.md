# Dossier de Conception UML — UniRide (ISET Nabeul)
**Projet d'Intégration : Plateforme mobile de covoiturage étudiant intelligent**  
**Auteurs :** Bahri Hajer · Bahloul Zeineb · Ben Taher Mohamed

---

## Sommaire
1. [Formalisme & Acteurs du Système](#1-formalisme--acteurs-du-système)
2. [Sprint 1 : Authentification, Profils & Véhicules (US1 à US4)](#sprint-1--authentification-profils--véhicules-us1-à-us4)
3. [Sprint 2 : Emploi du temps & Publication des trajets (US5, US6)](#sprint-2--emploi-du-temps--publication-des-trajets-us5-us6)
4. [Sprint 3 : Recherche, Carte, Réservation & Validation (US7 à US10)](#sprint-3--recherche-carte-réservation--validation-us7-à-us10)
5. [Sprint 4 : Matching intelligent, Notifications & Trajet en direct (US11, US13, US21)](#sprint-4--matching-intelligent-notifications--trajet-en-direct-us11-us13-us21)
6. [Sprint 5 : Communication, Évaluations, Signalements & Badges (US12, US14 à US17)](#sprint-5--communication-évaluations-signalements--badges-us12-us14-à-us17)
7. [Sprint 6 : Administration, Sécurité SOS & Tableaux de bord (US18 à US20, US22)](#sprint-6--administration-sécurité-sos--tableaux-de-bord-us18-à-us20-us22)
8. [Diagramme de Classes Global du Système](#8-diagramme-de-classes-global-du-système)

---

## 1. Formalisme & Acteurs du Système

Conformément au cahier des charges (§1.5) :
- **Étudiant (Générique) :** Acteur de base ayant un compte universitaire (`@isetn.tn`), pouvant agir alternativement en tant que **Passager** ou **Conducteur**.
- **Passager :** Étudiant cherchant un trajet, important son emploi du temps, réservant une place et évaluant son conducteur.
- **Conducteur :** Étudiant possédant un véhicule enregistré, publiant des trajets réguliers ou ponctuels, acceptant les passagers.
- **Administrateur :** Responsable du campus gérant les utilisateurs, traitant les signalements et supervisant les alertes SOS.
- **Système (Acteur secondaire) :** Moteur automatique calculant les scores de compatibilité et distribuant les notifications temps réel.
- **Service externe de Cartographie :** Fournisseur des tuiles et des calculs d'itinéraires (OpenStreetMap / Nominatim / OSRM).

---

## Sprint 1 : Authentification, Profils & Véhicules (US1 à US4)

### Objectifs
- **US1 :** S'inscrire avec un e-mail universitaire (`@isetn.tn`) et choisir sa filière ISET.
- **US2 :** Se connecter (JWT), se déconnecter et réinitialiser un mot de passe oublié via code reçu par e-mail.
- **US3 :** Gérer son profil (photo, bio, adresse de départ pour le calcul de proximité, préférences).
- **US4 :** Enregistrer et gérer son véhicule (marque, couleur, matricule, places, photo).

### Diagramme de Cas d'Utilisation — Sprint 1

```mermaid
flowchart LR
    user["👤 Étudiant"]
    cond["👤 Conducteur"]
    user <|-- cond

    subgraph Sprint1["UniRide — Sprint 1 (Gestion des comptes & Profils)"]
        UC1(["S'inscrire (US1)"])
        UC2(["S'authentifier (US2)"])
        UC2_1(["Réinitialiser mot de passe (US2)"])
        UC2_2(["Se déconnecter (US2)"])
        UC3(["Gérer mon profil (US3)"])
        UC3_1(["Définir préférences trajet (US3)"])
        UC3_2(["Renseigner adresse de départ (US3)"])
        UC3_3(["Ajouter contact de confiance (US3)"])
        UC4(["Gérer mon véhicule (US4)"])
        UC_VERIF(["Vérifier e-mail universitaire"])
    end

    user --> UC1
    user --> UC2
    user --> UC2_1
    user --> UC2_2
    user --> UC3
    cond --> UC4

    UC1 -.->|"«include»"| UC_VERIF
    UC3 -.->|"«extend»"| UC3_1
    UC3 -.->|"«extend»"| UC3_2
    UC3 -.->|"«extend»"| UC3_3
```

### Diagramme de Classes — Sprint 1

```mermaid
classDiagram
    class User {
        +String id
        +String nom
        +String email
        +String motDePasse
        +String filiere
        +String photo
        +String telephone
        +String role
        +Date createdAt
        +sInscrire() boolean
        +sAuthentifier(email, mdp) String
        +reinitialiserMotDePasse(code, nouveauMdp) boolean
        +modifierProfil(nom, filiere, tel) void
        +supprimerCompte() boolean
    }

    class Preferences {
        +boolean nonFumeur
        +boolean mixte
        +String musique
        +boolean definies
        +mettreAJour(nonFumeur, mixte, musique) void
    }

    class Domicile {
        +String label
        +float latitude
        +float longitude
        +definirPosition(label, lat, lng) void
    }

    class ContactConfiance {
        +String nom
        +String telephone
        +enregistrerContact(nom, tel) void
    }

    class Vehicule {
        +String marque
        +String couleur
        +int places
        +String matricule
        +String photo
        +ajouterVehicule(marque, coul, places, mat) void
        +supprimerVehicule() void
    }

    User "1" *-- "0..1" Preferences : configure
    User "1" *-- "0..1" Domicile : réside à
    User "1" *-- "0..1" ContactConfiance : désigne
    User "1" o-- "0..1" Vehicule : possède
```

---

## Sprint 2 : Emploi du temps & Publication des trajets (US5, US6)

### Objectifs
- **US5 :** Importer l'emploi du temps (fichier `.ics` / saisie manuelle) pour détecter automatiquement les heures d'arrivée et de départ chaque jour.
- **US6 :** Publier un trajet ponctuel ou récurrent (du lundi au vendredi), calculer la durée, la distance et l'itinéraire via OpenStreetMap.

### Diagramme de Cas d'Utilisation — Sprint 2

```mermaid
flowchart LR
    pass["👤 Passager"]
    cond["👤 Conducteur"]
    osm["⚙️ API Cartographie (OSM)"]

    subgraph Sprint2["UniRide — Sprint 2 (Emploi du temps & Offre de trajets)"]
        UC5(["Gérer emploi du temps (US5)"])
        UC5_1(["Importer fichier ICS / CSV (US5)"])
        UC5_2(["Saisir créneaux manuellement (US5)"])
        UC6(["Publier un trajet (US6)"])
        UC6_1(["Définir récurrence hebdomadaire (US6)"])
        UC6_2(["Modifier / Annuler mon trajet (US6)"])
        UC_CALC(["Calculer itinéraire & durée"])
    end

    pass --> UC5
    cond --> UC6
    cond --> UC6_2

    UC5 -.->|"«extend»"| UC5_1
    UC5 -.->|"«extend»"| UC5_2
    UC6 -.->|"«extend»"| UC6_1
    UC6 -.->|"«include»"| UC_CALC
    UC_CALC --- osm
```

### Diagramme de Classes — Sprint 2

```mermaid
classDiagram
    class User {
        +String id
        +String nom
        +String email
    }

    class Schedule {
        +String id
        +String userId
        +Date updatedAt
        +importerICS(fichier) boolean
        +ajouterJour(nomJour, debut, fin) void
        +getPlageHoraire(nomJour) PlageHoraire
    }

    class DaySchedule {
        +String jour
        +String heureDebut
        +String heureFin
        +boolean aCours
    }

    class Ride {
        +String id
        +String conducteurId
        +String heureDepart
        +String heureArrivee
        +boolean recurrent
        +String[] jours
        +Date date
        +int places
        +float prix
        +float distanceKm
        +int dureeMin
        +String statut
        +publierTrajet() boolean
        +modifierTrajet(heure, places, prix) void
        +annulerTrajet() boolean
    }

    class PointArret {
        +String label
        +float latitude
        +float longitude
    }

    User "1" -- "1" Schedule : possède
    Schedule "1" *-- "1..6" DaySchedule : est composé de
    User "1" -- "0..*" Ride : propose en tant que conducteur
    Ride "1" *-- "1" PointArret : point de départ
    Ride "1" *-- "1" PointArret : point de destination
```

---

## Sprint 3 : Recherche, Carte, Réservation & Validation (US7 à US10)

### Objectifs
- **US7 :** Rechercher un trajet avec filtres (destination ISET, date, plage horaire, prix max).
- **US8 :** Visualiser le tracé routier sur une carte interactive (Leaflet / OpenStreetMap).
- **US9 :** Réserver une ou plusieurs places et suivre le statut de la demande.
- **US10 :** Permettre au conducteur d'accepter ou de refuser les demandes avec décrément atomique des places.

### Diagramme de Cas d'Utilisation — Sprint 3

```mermaid
flowchart LR
    pass["👤 Passager"]
    cond["👤 Conducteur"]
    osm["⚙️ OpenStreetMap"]

    subgraph Sprint3["UniRide — Sprint 3 (Recherche, Carte & Réservation MVP)"]
        UC7(["Rechercher un trajet (US7)"])
        UC8(["Consulter trajet sur carte (US8)"])
        UC9(["Réserver une place (US9)"])
        UC9_1(["Annuler ma réservation (US9)"])
        UC10(["Gérer les demandes reçues (US10)"])
        UC10_1(["Accepter la réservation (US10)"])
        UC10_2(["Refuser la réservation (US10)"])
    end

    pass --> UC7
    pass --> UC8
    pass --> UC9
    pass --> UC9_1
    cond --> UC10

    UC7 -.->|"«include»"| UC8
    UC8 --- osm
    UC9 -.->|"«include»"| UC7
    UC10 -.->|"«extend»"| UC10_1
    UC10 -.->|"«extend»"| UC10_2
```

### Diagramme de Classes — Sprint 3

```mermaid
classDiagram
    class Ride {
        +String id
        +int places
        +float prix
        +String statut
        +rechercher(depart, date, heure) List~Ride~
        +decrementerPlaces(nb) boolean
        +incrementerPlaces(nb) void
    }

    class Booking {
        +String id
        +String trajetId
        +String passagerId
        +String conducteurId
        +int places
        +String statut
        +Date createdAt
        +creerDemande(places) boolean
        +annulerDemande() boolean
        +accepter() boolean
        +refuser() boolean
    }

    class User {
        +String id
        +String nom
        +String telephone
    }

    User "1" -- "0..*" Booking : effectue (Passager)
    User "1" -- "0..*" Booking : reçoit (Conducteur)
    Ride "1" -- "0..*" Booking : concerne
```

---

## Sprint 4 : Matching intelligent, Notifications & Trajet en direct (US11, US13, US21)

### Objectifs
- **US11 :** Calculer automatiquement le score de compatibilité /100 entre passager et conducteur (35% proximité, 35% horaires, 15% préférences, 15% réputation).
- **US13 :** Notifier en temps réel les étudiants (réservation acceptée, rappel départ 30 min, annulation).
- **US21 :** Démarrer le trajet (mode direct), afficher la jauge d'avancement et le terminer avec statistiques générées.

### Diagramme de Cas d'Utilisation — Sprint 4

```mermaid
flowchart LR
    pass["👤 Passager"]
    cond["👤 Conducteur"]
    sys["⚙️ Moteur de Calcul & Notifications"]

    subgraph Sprint4["UniRide — Sprint 4 (Matching, Temps réel & Suivi de trajet)"]
        UC11(["Consulter suggestions & score de compatibilité (US11)"])
        UC11_1(["Voir détails du score /100 (US11)"])
        UC13(["Recevoir notifications push / in-app (US13)"])
        UC21_1(["Démarrer le trajet (US21)"])
        UC21_2(["Suivre trajet en direct (US21)"])
        UC21_3(["Terminer le trajet (US21)"])
    end

    pass --> UC11
    pass --> UC21_2
    pass --> UC13
    cond --> UC21_1
    cond --> UC21_2
    cond --> UC21_3
    cond --> UC13

    UC11 -.->|"«extend»"| UC11_1
    UC11 --- sys
    UC13 --- sys
    UC21_1 -.->|"«include»"| UC13
    UC21_3 -.->|"«include»"| UC13
```

### Diagramme de Classes — Sprint 4

```mermaid
classDiagram
    class MatchingEngine {
        +calculerDistanceKm(p1, p2) float
        +calculerScoreProximite(distance) float
        +calculerScoreHoraires(heureTrajet, coursDebut) float
        +calculerScorePreferences(prefCond, prefPass) float
        +calculerScoreGlobal(passager, ride, schedule) MatchResult
    }

    class MatchResult {
        +int scoreTotal
        +float scoreProximite
        +float scoreHoraires
        +float scorePreferences
        +float scoreAvis
        +String[] explications
    }

    class Ride {
        +String id
        +String statut
        +Date startedAt
        +Date finishedAt
        +demarrerTrajet() boolean
        +terminerTrajet() SummaryResult
    }

    class Notification {
        +String id
        +String destinataireId
        +String emetteurId
        +String type
        +String titre
        +String message
        +boolean lu
        +Date createdAt
        +envoyerNotification() void
        +marquerLu() void
    }

    MatchingEngine ..> MatchResult : génère
    MatchingEngine ..> Ride : analyse
    Ride ..> Notification : déclenche
```

---

## Sprint 5 : Communication, Évaluations, Signalements & Badges (US12, US14 à US17)

### Objectifs
- **US12 :** Messagerie instantanée en temps réel (Socket.io) entre covoitureurs.
- **US14 :** Noter mutuellement le covoitureur (1 à 5 étoiles, commentaire et sélection de compliments).
- **US15 :** Signaler un utilisateur en cas de retard grave, conduite dangereuse ou comportement inapproprié.
- **US16 & US17 :** Calculer l'argent économisé, les kg de CO₂ évités et débloquer les badges de mérite.

### Diagramme de Cas d'Utilisation — Sprint 5

```mermaid
flowchart LR
    user["👤 Utilisateur (Passager / Conducteur)"]
    userCible["👤 Covoitureur"]

    subgraph Sprint5["UniRide — Sprint 5 (Communication, Confiance & Gamification)"]
        UC12(["Échanger par chat en direct (US12)"])
        UC14(["Évaluer un covoitureur (US14)"])
        UC14_1(["Attribuer des compliments / badges (US17)"])
        UC15(["Signaler un problème / utilisateur (US15)"])
        UC16(["Consulter ses statistiques CO₂ et argent (US16)"])
        UC17(["Consulter ses badges débloqués (US17)"])
    end

    user --> UC12
    user --> UC14
    user --> UC15
    user --> UC16
    user --> UC17

    UC12 <--> userCible
    UC14 -.->|"«extend»"| UC14_1
```

### Diagramme de Classes — Sprint 5

```mermaid
classDiagram
    class Conversation {
        +String id
        +String[] participants
        +String dernierMessage
        +Date updatedAt
        +creerOuRecuperer(u1, u2) Conversation
    }

    class Message {
        +String id
        +String conversationId
        +String auteurId
        +String texte
        +Date createdAt
        +envoyer() void
    }

    class Review {
        +String id
        +String auteurId
        +String cibleId
        +String trajetId
        +int note
        +String commentaire
        +String[] badges
        +String roleCible
        +Date createdAt
        +enregistrerAvis() void
    }

    class Report {
        +String id
        +String auteurId
        +String utilisateurSignaleId
        +String trajetId
        +String motif
        +String commentaire
        +String statut
        +Date createdAt
        +soumettreSignalement() void
    }

    class StatisticsAndBadges {
        +float argentEconomise
        +float co2EviteKg
        +int trajetsEffectues
        +String[] badgesObtenus
        +calculerStatistiques(userId) void
        +verifierDeblocageBadges(userId) void
    }

    Conversation "1" *-- "0..*" Message : contient
    User "1" -- "0..*" Review : rédige
    User "1" -- "0..*" Review : reçoit
    User "1" -- "0..*" Report : signale / est signalé
    User "1" -- "1" StatisticsAndBadges : possède
```

---

## Sprint 6 : Administration, Sécurité SOS & Tableaux de bord (US18 à US20, US22)

### Objectifs
- **US18 :** Gérer les utilisateurs (consulter, bloquer/débloquer avec motif, supprimer un compte).
- **US19 :** Traiter les signalements avec compteurs en temps réel (À traiter, Traités, Rejetés) et décision administrative.
- **US20 :** Tableau de bord global avec KPIs (étudiants actifs, taux de satisfaction, conducteurs, trajets effectués).
- **US22 :** Bouton SOS (envoi SMS du lien GPS au contact de confiance, alerte temps réel Socket.io à l'administration, numéros nationaux 197/190/198).

### Diagramme de Cas d'Utilisation — Sprint 6

```mermaid
flowchart LR
    admin["👮 Administrateur ISET"]
    user["👤 Étudiant en danger"]
    contact["📞 Contact de confiance (ICE)"]
    secours["🚑 Secours (197 / 190 / 198)"]

    subgraph Sprint6["UniRide — Sprint 6 (Administration & Sécurité SOS)"]
        UC18(["Gérer les utilisateurs (US18)"])
        UC18_1(["Bloquer un utilisateur (US18)"])
        UC18_2(["Débloquer un utilisateur (US18)"])
        UC19(["Traiter les signalements (US19)"])
        UC20(["Consulter tableau de bord KPI (US20)"])
        UC22(["Déclencher une alerte SOS (US22)"])
        UC22_1(["Marquer l'alerte résolue (US22)"])
    end

    user --> UC22
    admin --> UC18
    admin --> UC19
    admin --> UC20
    admin --> UC22_1

    UC18 -.->|"«extend»"| UC18_1
    UC18 -.->|"«extend»"| UC18_2
    UC22 --> contact
    UC22 --> secours
    UC22_1 -.->|"«include»"| UC20
```

### Diagramme de Classes — Sprint 6

```mermaid
classDiagram
    class AdminDashboardService {
        +getStatistiquesGlobales() DashboardKPI
        +getTopConducteurs() List~User~
        +getGrapheActivite7Jours() GraphData
    }

    class Sos {
        +String id
        +String auteurId
        +String trajetId
        +float latitude
        +float longitude
        +int precisionM
        +String statut
        +String resoluPar
        +Date resoluLe
        +String noteAdmin
        +Date createdAt
        +declencherAlerte(lat, lng) void
        +marquerResolue(adminId, note) void
    }

    class Report {
        +String id
        +String statut
        +String decision
        +traiter(statut, decision, bloquerCible) void
    }

    class User {
        +String id
        +boolean bloque
        +String bloqueRaison
        +Date bloqueLe
        +bloquer(raison) void
        +debloquer() void
    }

    AdminDashboardService ..> User : supervise
    AdminDashboardService ..> Report : comptabilise
    AdminDashboardService ..> Sos : surveille en direct
    User "1" -- "0..*" Sos : déclenche
```

---

## 8. Diagramme de Classes Global du Système

Ce diagramme unifie l'intégralité du modèle de données et des composants métiers du projet UniRide :

```mermaid
classDiagram
    class User {
        +String id
        +String nom
        +String email
        +String motDePasse
        +String filiere
        +String photo
        +String telephone
        +String role
        +float noteMoyenne
        +int nombreAvis
        +boolean bloque
        +Date createdAt
        +sInscrire() boolean
        +sAuthentifier() String
        +modifierProfil() void
        +supprimerCompte() boolean
    }

    class Vehicule {
        +String marque
        +String couleur
        +int places
        +String matricule
        +String photo
    }

    class Schedule {
        +String id
        +DaySchedule[] jours
        +importerICS(file) void
    }

    class DaySchedule {
        +String jour
        +String heureDebut
        +String heureFin
    }

    class Ride {
        +String id
        +PointArret depart
        +PointArret destination
        +String heureDepart
        +String heureArrivee
        +boolean recurrent
        +String[] jours
        +Date date
        +int places
        +float prix
        +float distanceKm
        +int dureeMin
        +String statut
        +demarrer() void
        +terminer() void
        +annuler() void
    }

    class PointArret {
        +String label
        +float latitude
        +float longitude
    }

    class Booking {
        +String id
        +int places
        +String statut
        +Date createdAt
        +accepter() void
        +refuser() void
        +annuler() void
    }

    class Review {
        +String id
        +int note
        +String commentaire
        +String[] badges
        +String roleCible
        +Date createdAt
    }

    class Report {
        +String id
        +String motif
        +String commentaire
        +String statut
        +String decision
        +Date createdAt
    }

    class Conversation {
        +String id
        +String dernierMessage
        +Date updatedAt
    }

    class Message {
        +String id
        +String texte
        +Date createdAt
    }

    class Notification {
        +String id
        +String type
        +String titre
        +String message
        +boolean lu
        +Date createdAt
    }

    class Sos {
        +String id
        +float latitude
        +float longitude
        +String statut
        +Date resoluLe
        +Date createdAt
    }

    %% Relations d'héritage et d'association
    User "1" o-- "0..1" Vehicule : possède
    User "1" -- "1" Schedule : a pour emploi du temps
    Schedule "1" *-- "1..6" DaySchedule : détaille

    User "1" -- "0..*" Ride : propose en tant que conducteur
    Ride "1" *-- "1" PointArret : départ
    Ride "1" *-- "1" PointArret : destination

    Ride "1" -- "0..*" Booking : rassemble
    User "1" -- "0..*" Booking : réserve en tant que passager

    User "1" -- "0..*" Review : rédige
    User "1" -- "0..*" Review : est évalué dans

    User "1" -- "0..*" Report : soumet
    User "1" -- "0..*" Report : est signalé par

    Conversation "1" *-- "0..*" Message : contient
    User "2" -- "0..*" Conversation : dialogue dans

    User "1" -- "0..*" Notification : reçoit
    User "1" -- "0..*" Sos : émet
    Ride "0..1" -- "0..*" Sos : localisé sur
```
