import React, { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import api from '../api';
import RouteMap from '../components/RouteMap';
import {
  Avatar,
  Badge,
  Button,
  Card,
  ConfirmModal,
  ErrorState,
  Header,
  IconButton,
  Input,
  Ionicons,
  Loader,
  Notice,
  ProgressBar,
  RouteLine,
  Row,
  ScoreBadge,
  Screen,
  Stars,
  Stepper,
} from '../components/ui';
import { useDonnees } from '../hooks';
import { colors, font, radius, scoreTone, spacing } from '../theme';
import { MUSIQUE, court, erreurApi, nombre, prix, quand } from '../utils';

const STATUT = {
  en_cours: { label: 'En route', tone: 'success', icon: 'car-sport-outline' },
  termine: { label: 'Terminé', tone: 'neutral', icon: 'flag-outline' },
  annule: { label: 'Annulé', tone: 'danger', icon: 'close-circle-outline' },
};

/** Détail d'un trajet : carte, score, conducteur, réservation (US8, US9, US11). */
export default function RideDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [modal, setModal] = useState(false);
  const [places, setPlaces] = useState(1);
  const [message, setMessage] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [infoMsg, setInfoMsg] = useState(null);
  const [erreurMsg, setErreurMsg] = useState(null);
  const [annulerConfirm, setAnnulerConfirm] = useState(false);
  const [demarrerConfirm, setDemarrerConfirm] = useState(false);

  const { data, chargement, erreur, recharger, reessayer } = useDonnees(async () => {
    const [ride, resa] = await Promise.all([
      api.get(`/rides/${id}`).then((r) => r.data),
      api.get(`/bookings/ride/${id}`).then((r) => r.data),
    ]);
    return { ride, reservation: resa.booking };
  }, [id]);

  const reserver = async () => {
    setEnvoi(true);
    try {
      await api.post('/bookings', { trajetId: id, places, message });
      setModal(false);
      setMessage('');
      recharger();
      setInfoMsg('Le conducteur a été prévenu. Vous recevrez une notification dès sa réponse.');
    } catch (err) {
      setErreurMsg(erreurApi(err));
    } finally {
      setEnvoi(false);
    }
  };

  const annuler = () => setAnnulerConfirm(true);

  const execAnnuler = async () => {
    setAnnulerConfirm(false);
    try {
      await api.patch(`/bookings/${data.reservation._id}/cancel`);
      recharger();
    } catch (err) {
      setErreurMsg(erreurApi(err));
    }
  };

  const demarrer = () => setDemarrerConfirm(true);

  const execDemarrer = async () => {
    setDemarrerConfirm(false);
    try {
      await api.patch(`/rides/${id}/start`);
      navigation.replace('ActiveRide', { id });
    } catch (err) {
      setErreurMsg(erreurApi(err));
    }
  };

  if (chargement) return <Loader />;
  if (erreur) return <ErrorState text={erreur} onRetry={reessayer} />;

  const { ride, reservation } = data;
  const c = ride.conducteur;
  const pref = c.preferences || {};
  const details = ride.matchDetails || {};
  const st = STATUT[ride.statut];
  const ouvert = ride.statut === 'actif';
  const peutReserver = !ride.estConducteur && !reservation && ouvert && ride.places > 0;

  let pied = null;
  if (ride.estConducteur) {
    pied =
      ride.statut === 'en_cours' ? (
        <Button title="Ouvrir le trajet en cours" icon="navigate" variant="success" onPress={() => navigation.navigate('ActiveRide', { id })} />
      ) : ouvert ? (
        <Row>
          <Button title="Demandes" icon="people-outline" variant="secondary" style={{ flex: 1 }} onPress={() => navigation.navigate('BookingRequests', { trajetId: id })} />
          <Button title="Démarrer" icon="play" style={{ flex: 1 }} onPress={demarrer} />
        </Row>
      ) : null;
  } else if (peutReserver) {
    pied = (
      <Row>
        <IconButton icon="chatbubble-ellipses-outline" onPress={() => navigation.navigate('Chat', { destinataireId: c._id, trajetId: id })} label="Écrire au conducteur" />
        <Button title={`Réserver · ${prix(ride.prix)}`} style={{ flex: 1 }} onPress={() => setModal(true)} />
      </Row>
    );
  } else if (reservation?.statut === 'acceptee' && ride.statut === 'en_cours') {
    pied = <Button title="Suivre le trajet" icon="navigate" variant="success" onPress={() => navigation.navigate('ActiveRide', { id })} />;
  }

  return (
    <Screen
      header={<Header title={`${court(ride.depart.label)} → ${court(ride.destination.label)}`} subtitle={quand(ride)} onBack={() => navigation.goBack()} />}
      footer={pied}
    >
      {st ? <Badge label={st.label} tone={st.tone} icon={st.icon} style={{ marginBottom: spacing.md }} /> : null}

      {reservation ? (
        <Notice
          tone={reservation.statut === 'acceptee' ? 'success' : 'warning'}
          icon={reservation.statut === 'acceptee' ? 'checkmark-circle-outline' : 'time-outline'}
          title={reservation.statut === 'acceptee' ? 'Votre place est confirmée' : 'Demande en attente'}
          text={
            reservation.statut === 'acceptee'
              ? 'Fixez le point de rendez-vous avec le conducteur dans le chat.'
              : 'Le conducteur doit accepter votre demande. Vous serez notifié.'
          }
          action={ouvert ? 'Annuler ma réservation' : null}
          onAction={annuler}
        />
      ) : null}

      <RouteMap ride={ride} height={210} style={{ marginBottom: spacing.md }} />

      <Card>
        <RouteLine depart={ride.depart.label} arrivee={ride.destination.label} heureDepart={ride.heureDepart} heureArrivee={ride.heureArrivee} />
        <Row style={styles.metriques} gap={0}>
          <Metrique icon="speedometer-outline" valeur={`${nombre(ride.distanceKm)} km`} label="Distance" />
          <Metrique icon="time-outline" valeur={`${ride.dureeMin} min`} label="Durée" />
          <Metrique icon="people-outline" valeur={ride.places} label="Places libres" />
          <Metrique icon="cash-outline" valeur={prix(ride.prix)} label="Par place" />
        </Row>
      </Card>

      {!ride.estConducteur ? (
        <Card onPress={() => navigation.navigate('MatchingDetail', { id })}>
          <Row style={{ justifyContent: 'space-between', marginBottom: spacing.md }}>
            <View>
              <Text style={font.h3}>Compatibilité</Text>
              <Text style={font.caption}>Touchez pour voir le calcul détaillé</Text>
            </View>
            <ScoreBadge score={ride.scoreMatch} large />
          </Row>
          {['proximite', 'horaires', 'preferences', 'note'].map((k) =>
            details[k] ? (
              <View key={k} style={{ marginBottom: 10 }}>
                <Row style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={font.small}>{details[k].titre}</Text>
                  <Text style={[font.small, { fontWeight: '700', color: colors.ink }]}>{details[k].scorePourcent} %</Text>
                </Row>
                <ProgressBar value={details[k].scorePourcent} color={scoreTone(details[k].scorePourcent).fg === colors.muted ? colors.faint : colors.primary} />
              </View>
            ) : null
          )}
        </Card>
      ) : null}

      <Card>
        <Row>
          <Avatar uri={c.photo} nom={c.nom} size={52} />
          <View style={{ flex: 1 }}>
            <Text style={font.h3}>{c.nom}</Text>
            <Text style={font.caption}>{c.filiere || 'Étudiant ISET Nabeul'}</Text>
            <View style={{ marginTop: 2 }}>
              <Stars value={c.noteMoyenne} count={c.nombreAvis} />
            </View>
          </View>
          {!ride.estConducteur ? (
            <IconButton
              icon="flag-outline"
              label="Signaler"
              onPress={() => navigation.navigate('Report', { utilisateurSignaleId: c._id, utilisateurNom: c.nom, trajetId: id })}
            />
          ) : null}
        </Row>
        {c.vehicule ? (
          <View style={styles.vehicule}>
            {c.vehicule.photo ? (
              <Image source={{ uri: c.vehicule.photo }} style={{ width: 44, height: 32, borderRadius: 6, marginRight: 10 }} />
            ) : (
              <Ionicons name="car-sport-outline" size={20} color={colors.primary} />
            )}
            <Text style={[font.label, { marginLeft: c.vehicule.photo ? 0 : 10, flex: 1 }]}>
              {c.vehicule.marque} · {c.vehicule.couleur}
            </Text>
          </View>
        ) : null}
        <Row gap={6} style={{ flexWrap: 'wrap', marginTop: spacing.md }}>
          <Badge icon={pref.nonFumeur ? 'ban-outline' : 'flame-outline'} label={pref.nonFumeur ? 'Non-fumeur' : 'Fumeur'} />
          <Badge icon="musical-notes-outline" label={MUSIQUE[pref.musique] || MUSIQUE.aucune} />
          {pref.mixte ? <Badge icon="people-outline" label="Mixte" /> : null}
        </Row>
      </Card>

      {!ride.estConducteur && !reservation && ouvert && ride.places <= 0 ? <Notice tone="warning" icon="alert-circle-outline" text="Ce trajet est complet." /> : null}

      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setModal(false)}>
          <Pressable style={styles.feuille} onPress={() => {}}>
            <View style={styles.poignee} />
            <Text style={font.h2}>Réserver ma place</Text>
            <Text style={[font.small, { marginBottom: spacing.lg }]}>
              {court(ride.depart.label)} → {court(ride.destination.label)} · {ride.heureDepart}
            </Text>
            <Row style={{ justifyContent: 'space-between', marginBottom: spacing.lg }}>
              <Text style={font.label}>Nombre de places</Text>
              <Stepper value={places} onChange={setPlaces} min={1} max={Math.max(1, ride.places)} />
            </Row>
            <Input label="Message au conducteur (facultatif)" placeholder="Ex : Je peux vous attendre devant la gare." value={message} onChangeText={setMessage} multiline maxLength={300} />
            <Row style={{ justifyContent: 'space-between', marginBottom: spacing.lg }}>
              <Text style={font.small}>Total à régler au conducteur</Text>
              <Text style={[font.h2, { color: colors.primary }]}>{prix(ride.prix * places)}</Text>
            </Row>
            <Button title="Envoyer la demande" onPress={reserver} loading={envoi} />
          </Pressable>
        </Pressable>
      </Modal>

      <ConfirmModal
        visible={!!infoMsg}
        icon="checkmark-circle"
        variant="success"
        titre="Demande envoyée"
        message={infoMsg}
        cancelLabel={null}
        onConfirm={() => setInfoMsg(null)}
      />
      <ConfirmModal
        visible={annulerConfirm}
        icon="close-circle"
        variant="danger"
        titre="Annuler votre réservation ?"
        message="Le conducteur sera prévenu et la place sera libérée."
        confirmLabel="Oui, annuler"
        cancelLabel="Non"
        onConfirm={execAnnuler}
        onCancel={() => setAnnulerConfirm(false)}
      />
      <ConfirmModal
        visible={demarrerConfirm}
        icon="play-circle"
        variant="success"
        titre="Démarrer le trajet ?"
        message="Vos passagers confirmés seront prévenus que vous êtes en route."
        confirmLabel="Démarrer"
        cancelLabel="Pas encore"
        onConfirm={execDemarrer}
        onCancel={() => setDemarrerConfirm(false)}
      />
      <ConfirmModal
        visible={!!erreurMsg}
        icon="alert-circle"
        variant="danger"
        titre="Action impossible"
        message={erreurMsg}
        cancelLabel={null}
        onConfirm={() => setErreurMsg(null)}
      />
    </Screen>
  );
}

function Metrique({ icon, valeur, label }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={[font.label, { marginTop: 4 }]} numberOfLines={1}>
        {valeur}
      </Text>
      <Text style={[font.caption, { fontSize: 11 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  metriques: { marginTop: spacing.lg, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.borderSoft },
  vehicule: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, padding: spacing.md, backgroundColor: colors.primarySoft, borderRadius: radius.md },
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  feuille: { backgroundColor: colors.card, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.xl, paddingBottom: spacing.xxl },
  poignee: { width: 40, height: 5, borderRadius: 3, backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.lg },
});
