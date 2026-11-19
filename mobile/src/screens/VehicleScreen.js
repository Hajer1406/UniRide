import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import api from '../api';
import { Button, Card, Field, Header, Input, Ionicons, Loader, Notice, Row, Screen, Stepper } from '../components/ui';
import { colors, font, radius, spacing } from '../theme';
import { erreurApi } from '../utils';

const COULEURS = [
  { valeur: 'blanc', label: 'Blanc', hex: '#FFFFFF' },
  { valeur: 'noir', label: 'Noir', hex: '#1E293B' },
  { valeur: 'gris', label: 'Gris', hex: '#64748B' },
  { valeur: 'argent', label: 'Argent', hex: '#CBD5E1' },
  { valeur: 'rouge', label: 'Rouge', hex: '#EF4444' },
  { valeur: 'bleu', label: 'Bleu', hex: '#3B82F6' },
  { valeur: 'vert', label: 'Vert', hex: '#10B981' },
  { valeur: 'jaune', label: 'Jaune', hex: '#FACC15' },
  { valeur: 'orange', label: 'Orange', hex: '#F97316' },
  { valeur: 'marron', label: 'Marron', hex: '#78350F' },
  { valeur: 'autre', label: 'Autre', hex: '#8B5CF6' },
];

/** Ajouter / modifier son véhicule pour devenir conducteur (US4). */
export default function VehicleScreen({ navigation }) {
  const [marque, setMarque] = useState('');
  const [couleur, setCouleur] = useState('');
  const [places, setPlaces] = useState(3);
  const [matricule, setMatricule] = useState('');
  const [photo, setPhoto] = useState('');
  const [existe, setExiste] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [envoi, setEnvoi] = useState(false);
  const [erreurs, setErreurs] = useState({});

  useEffect(() => {
    api
      .get('/auth/me')
      .then(({ data }) => {
        if (data.vehicule) {
          setMarque(data.vehicule.marque);
          setCouleur(data.vehicule.couleur || '');
          setPlaces(data.vehicule.places);
          setMatricule(data.vehicule.matricule);
          setPhoto(data.vehicule.photo || '');
          setExiste(true);
        }
      })
      .catch((err) => Alert.alert('Erreur', erreurApi(err)))
      .finally(() => setChargement(false));
  }, []);

  const choisirPhoto = async () => {
    try {
      const choix = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [16, 9], quality: 0.8 });
      if (choix.canceled) return;
      const reduite = await ImageManipulator.manipulateAsync(choix.assets[0].uri, [{ resize: { width: 500 } }], {
        compress: 0.6,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      });
      setPhoto(`data:image/jpeg;base64,${reduite.base64}`);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger la photo');
    }
  };

  const enregistrer = async () => {
    const e = {};
    if (!marque.trim()) e.marque = 'Indiquez la marque et le modèle';
    if (!couleur) e.couleur = 'Choisissez une couleur';
    if (!matricule.trim()) e.matricule = 'Indiquez la plaque d’immatriculation';
    setErreurs(e);
    if (Object.keys(e).length) return;

    setEnvoi(true);
    try {
      await api.put('/users/me/vehicule', {
        marque: marque.trim(),
        couleur,
        places,
        matricule: matricule.trim().toUpperCase(),
        photo,
      });
      Alert.alert(existe ? 'Véhicule mis à jour' : 'Vous êtes conducteur !', existe ? '' : 'Vous pouvez maintenant publier vos trajets.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Enregistrement impossible', erreurApi(err));
    } finally {
      setEnvoi(false);
    }
  };

  const retirer = () =>
    Alert.alert('Retirer le véhicule ?', 'Vous ne pourrez plus publier de trajet.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Retirer',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete('/users/me/vehicule');
            navigation.goBack();
          } catch (err) {
            Alert.alert('Erreur', erreurApi(err));
          }
        },
      },
    ]);

  if (chargement) return <Loader />;

  return (
    <Screen
      header={<Header title="Mon véhicule" subtitle={existe ? 'Espace conducteur' : 'Devenir conducteur'} onBack={() => navigation.goBack()} />}
      footer={<Button title={existe ? 'Mettre à jour' : 'Enregistrer mon véhicule'} icon="checkmark" onPress={enregistrer} loading={envoi} />}
      keyboard
    >
      {!existe ? (
        <Notice tone="info" icon="car-sport-outline" title="Partagez vos places libres" text="Un seul compte suffit : vous restez passager quand vous ne conduisez pas." />
      ) : null}
      <Card>
        <Field label="Photo du véhicule (facultatif)" hint="Aide les étudiants à identifier votre voiture au point de rendez-vous">
          {photo ? (
            <View style={styles.photoCadre}>
              <Image source={{ uri: photo }} style={styles.photoVoiture} />
              <Row gap={8} style={{ marginTop: spacing.sm, justifyContent: 'center' }}>
                <Button title="Changer" icon="camera-outline" onPress={choisirPhoto} size="small" variant="secondary" />
                <Button title="Supprimer" icon="trash-outline" onPress={() => setPhoto('')} size="small" tone="danger" variant="secondary" />
              </Row>
            </View>
          ) : (
            <Pressable onPress={choisirPhoto} style={styles.photoBouton}>
              <Ionicons name="camera-outline" size={24} color={colors.primary} />
              <Text style={styles.photoBoutonTexte}>Ajouter une photo de la voiture</Text>
            </Pressable>
          )}
        </Field>
        <Input label="Marque et modèle" icon="car-outline" value={marque} onChangeText={setMarque} placeholder="Ex : Peugeot 208" error={erreurs.marque} />
        <Field label={`Couleur${couleur ? ` : ${COULEURS.find((c) => c.valeur === couleur)?.label}` : ''}`} error={erreurs.couleur}>
          <View style={styles.couleurs}>
            {COULEURS.map((c) => (
              <Pressable
                key={c.valeur}
                onPress={() => setCouleur(c.valeur)}
                accessibilityLabel={c.label}
                style={[styles.couleur, { backgroundColor: c.hex }, couleur === c.valeur && styles.couleurActive]}
              >
                {couleur === c.valeur ? <Ionicons name="checkmark" size={18} color={['blanc', 'argent', 'jaune'].includes(c.valeur) ? colors.ink : colors.white} /> : null}
              </Pressable>
            ))}
          </View>
        </Field>
        <Input
          label="Immatriculation"
          icon="document-text-outline"
          value={matricule}
          onChangeText={setMatricule}
          autoCapitalize="characters"
          placeholder="Ex : 123 TU 4567"
          error={erreurs.matricule}
        />
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={font.label}>Places passagers</Text>
            <Text style={font.caption}>Sans compter le conducteur</Text>
          </View>
          <Stepper value={places} onChange={setPlaces} min={1} max={8} />
        </Row>
      </Card>
      {existe ? <Button title="Retirer mon véhicule" variant="danger" icon="trash-outline" onPress={retirer} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  photoCadre: { alignItems: 'center', marginBottom: spacing.sm },
  photoVoiture: { width: '100%', height: 160, borderRadius: radius.md, resizeMode: 'cover' },
  photoBouton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  photoBoutonTexte: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  couleurs: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  couleur: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  couleurActive: { borderWidth: 3, borderColor: colors.primary },
});
