import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import api from '../api';
import { Avatar, Badge, Card, ConfirmModal, ErrorState, Header, Ionicons, ListItem, Loader, Row, Screen, Stars } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useDonnees } from '../hooks';
import { colors, font, spacing } from '../theme';
import { MUSIQUE, court, erreurApi } from '../utils';

/** Onglet Profil (US3, US4). */
export default function ProfileScreen({ navigation }) {
  const { deconnecter } = useAuth();
  const [photoEnvoi, setPhotoEnvoi] = useState(false);
  const [modalDeconnexion, setModalDeconnexion] = useState(false);
  const [modalSupprimerPhoto, setModalSupprimerPhoto] = useState(false);
  const [modalSupprimerCompte, setModalSupprimerCompte] = useState(false);
  const [erreurMsg, setErreurMsg] = useState(null);
  const { data, setData, chargement, erreur, rafraichir, rafraichissement, reessayer } = useDonnees(async () => {
    const [user, stats, schedule] = await Promise.all([
      api.get('/auth/me').then((r) => r.data),
      api.get('/stats/me').then((r) => r.data).catch(() => null),
      api.get('/schedule/me').then((r) => r.data).catch(() => ({ jours: [] })),
    ]);
    return { user, stats, schedule };
  });

  const supprimerPhoto = async () => {
    setPhotoEnvoi(true);
    try {
      await api.delete('/users/me/photo');
      setData((d) => ({ ...d, user: { ...d.user, photo: '' } }));
    } catch (err) {
      setErreurMsg(erreurApi(err));
    } finally {
      setPhotoEnvoi(false);
    }
  };

  const confirmerSuppression = () => setModalSupprimerPhoto(true);

  const changerPhoto = async () => {
    const choix = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (choix.canceled) return;
    setPhotoEnvoi(true);
    try {
      const reduite = await ImageManipulator.manipulateAsync(choix.assets[0].uri, [{ resize: { width: 300 } }], {
        compress: 0.6,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      });
      const photo = `data:image/jpeg;base64,${reduite.base64}`;
      await api.put('/users/me/photo', { photo });
      setData((d) => ({ ...d, user: { ...d.user, photo } }));
    } catch (err) {
      setErreurMsg(erreurApi(err));
    } finally {
      setPhotoEnvoi(false);
    }
  };

  const seDeconnecter = () => setModalDeconnexion(true);

  const supprimerCompte = async () => {
    setModalSupprimerCompte(false);
    try {
      await api.delete('/users/me');
      deconnecter();
    } catch (err) {
      setErreurMsg(erreurApi(err));
    }
  };

  const confirmerSuppressionCompte = () => setModalSupprimerCompte(true);

  if (chargement) return <Loader />;
  if (erreur) return <ErrorState text={erreur} onRetry={reessayer} />;

  const { user, stats, schedule } = data;
  const pref = user.preferences || {};
  const nbBadges = (stats?.badges || []).filter((b) => b.debloque).length;

  return (
    <Screen header={<Header title="Mon profil" />} onRefresh={rafraichir} refreshing={rafraichissement} bottomInset={false}>
      <Card style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
        <View style={{ position: 'relative' }}>
          <Pressable onPress={changerPhoto} disabled={photoEnvoi}>
            <Avatar uri={user.photo} nom={user.nom} size={92} />
            <View style={styles.camera}>
              {photoEnvoi ? <ActivityIndicator size="small" color={colors.ink} /> : <Ionicons name="camera" size={16} color={colors.ink} />}
            </View>
          </Pressable>
          {user.photo ? (
            <Pressable onPress={confirmerSuppression} disabled={photoEnvoi} style={styles.poubelle}>
              <Ionicons name="trash-outline" size={15} color={colors.white} />
            </Pressable>
          ) : null}
        </View>
        <Text style={[font.h2, { marginTop: spacing.md }]}>{user.nom}</Text>
        <Text style={font.small}>{user.filiere || 'Filière non renseignée'}</Text>
        <Text style={[font.caption, { color: colors.muted, marginTop: 3 }]}>{user.email}</Text>
        <View style={{ marginTop: 6 }}>
          <Stars value={user.noteMoyenne} count={user.nombreAvis} />
        </View>

        <Row style={styles.chiffres} gap={0}>
          <Chiffre valeur={stats?.trajetsEffectues ?? 0} label="Trajets" />
          <View style={styles.sep} />
          <Chiffre valeur={user.nombreAvis || 0} label="Avis" />
          <View style={styles.sep} />
          <Chiffre valeur={nbBadges} label="Badges" />
        </Row>

        <Row gap={6} style={{ flexWrap: 'wrap', justifyContent: 'center', marginTop: spacing.md }}>
          {pref.definies && pref.nonFumeur === true ? <Badge icon="ban-outline" label="Non-fumeur" /> : null}
          {pref.definies && pref.musique && pref.musique !== 'aucune' ? <Badge icon="musical-notes-outline" label={MUSIQUE[pref.musique]} /> : null}
          {pref.definies && pref.mixte === true ? <Badge icon="people-outline" label="Trajets mixtes" /> : null}
          {!pref.definies ? (
            <Badge icon="options-outline" label="Préférences à définir" />
          ) : null}
        </Row>
      </Card>

      <Text style={[font.overline, styles.groupe]}>Mon compte</Text>
      <Card padded={false}>
        <ListItem icon="person-outline" title="Modifier mon profil" subtitle={user.domicile ? court(user.domicile.label) : 'Adresse non renseignée'} onPress={() => navigation.navigate('EditProfile')} />
        <ListItem
          icon="calendar-outline"
          title="Mon emploi du temps"
          subtitle={schedule.jours.length ? `${schedule.jours.length} jour(s) de cours` : 'À importer pour le matching'}
          onPress={() => navigation.navigate('Schedule')}
        />
        <ListItem
          icon="car-outline"
          title="Mon véhicule"
          subtitle={user.vehicule ? `${user.vehicule.marque} · ${user.vehicule.places} places` : 'Ajoutez-le pour devenir conducteur'}
          onPress={() => navigation.navigate('Vehicle')}
        />
      </Card>

      <Text style={[font.overline, styles.groupe]}>Activité</Text>
      <Card padded={false}>
        <ListItem icon="stats-chart-outline" iconTone="success" title="Statistiques et badges" subtitle="Argent économisé, CO₂ évité" onPress={() => navigation.navigate('Stats')} />
        <ListItem icon="star-outline" iconTone="accent" title="Noter mes covoitureurs" onPress={() => navigation.navigate('RateRide')} />
        <ListItem icon="notifications-outline" iconTone="info" title="Notifications" onPress={() => navigation.navigate('Notifications')} />
      </Card>

      <Card padded={false}>
        <ListItem icon="log-out-outline" title="Se déconnecter" danger onPress={seDeconnecter} right={null} />
        <ListItem icon="trash-outline" title="Supprimer mon compte" danger onPress={confirmerSuppressionCompte} right={null} />
      </Card>
      <Text style={[font.caption, { textAlign: 'center', marginTop: spacing.md, color: colors.muted }]}>UniRide · Version 1.0.0 (ISET Nabeul)</Text>

      <ConfirmModal
        visible={modalDeconnexion}
        icon="log-out"
        variant="danger"
        titre="Se déconnecter ?"
        message="Vous devrez saisir à nouveau votre mot de passe."
        confirmLabel="Se déconnecter"
        onConfirm={() => { setModalDeconnexion(false); deconnecter(); }}
        onCancel={() => setModalDeconnexion(false)}
      />
      <ConfirmModal
        visible={modalSupprimerPhoto}
        icon="trash"
        variant="danger"
        titre="Supprimer la photo ?"
        message="Votre profil utilisera à nouveau vos initiales."
        confirmLabel="Supprimer"
        onConfirm={() => { setModalSupprimerPhoto(false); supprimerPhoto(); }}
        onCancel={() => setModalSupprimerPhoto(false)}
      />
      <ConfirmModal
        visible={modalSupprimerCompte}
        icon="trash"
        variant="danger"
        titre="Supprimer mon compte ?"
        message="Cette action est irréversible. Vos trajets, réservations et évaluations seront définitivement supprimés."
        confirmLabel="Supprimer définitivement"
        onConfirm={supprimerCompte}
        onCancel={() => setModalSupprimerCompte(false)}
      />
      <ConfirmModal
        visible={!!erreurMsg}
        icon="alert-circle"
        variant="danger"
        titre="Erreur"
        message={erreurMsg}
        cancelLabel={null}
        onConfirm={() => setErreurMsg(null)}
      />
    </Screen>
  );
}

function Chiffre({ valeur, label }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={[font.h2, { fontSize: 20 }]}>{valeur}</Text>
      <Text style={font.caption}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  camera: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  poubelle: {
    position: 'absolute',
    left: -2,
    bottom: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  chiffres: { marginTop: spacing.lg, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.borderSoft, alignSelf: 'stretch' },
  sep: { width: 1, height: 30, backgroundColor: colors.borderSoft },
  groupe: { marginTop: spacing.sm, marginBottom: spacing.sm, marginLeft: 4 },
});
