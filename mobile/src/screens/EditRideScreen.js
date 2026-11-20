import React, { useState } from 'react';
import { Text, View } from 'react-native';
import api from '../api';
import TimeInput from '../components/TimeInput';
import { Button, Card, ConfirmModal, Header, Input, Notice, RouteLine, Row, Screen, Stepper } from '../components/ui';
import { colors, font, spacing } from '../theme';
import { HEURE, court, erreurApi, quand } from '../utils';

/** Modifier l'heure, les places libres ou le prix d'un trajet à venir (module D). */
export default function EditRideScreen({ navigation, route }) {
  const t = route.params.trajet;
  const [heure, setHeure] = useState(t.heureDepart);
  const [places, setPlaces] = useState(t.places);
  const [prix, setPrix] = useState(String(t.prix));
  const [envoi, setEnvoi] = useState(false);
  const [erreurMsg, setErreurMsg] = useState(null);

  const enregistrer = async () => {
    const montant = Number(prix.replace(',', '.'));
    if (!HEURE.test(heure)) return setErreurMsg('Format HH:MM, ex : 07:45');
    if (!Number.isFinite(montant) || montant < 0) return setErreurMsg('Indiquez un montant en DT.');
    if (t && !t.recurrent && t.date) {
      const dateTrajet = new Date(t.date).toISOString().slice(0, 10);
      const aujourd = new Date().toISOString().slice(0, 10);
      if (dateTrajet === aujourd) {
        const d = new Date();
        const heureActuelle = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        if (heure <= heureActuelle) {
          return setErreurMsg(`L'heure de départ (${heure}) est déjà passée pour aujourd'hui (il est ${heureActuelle}). Choisissez une heure future.`);
        }
      }
    }
    setEnvoi(true);
    try {
      await api.patch(`/rides/${t._id}`, { heureDepart: heure, places, prix: montant });
      navigation.goBack();
    } catch (err) {
      setErreurMsg(erreurApi(err));
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <Screen
      header={<Header title="Modifier le trajet" subtitle={quand(t)} onBack={() => navigation.goBack()} />}
      footer={<Button title="Enregistrer les modifications" icon="checkmark" onPress={enregistrer} loading={envoi} />}
      keyboard
    >
      <Card>
        <RouteLine depart={court(t.depart.label)} arrivee={court(t.destination.label)} heureDepart={t.heureDepart} heureArrivee={t.heureArrivee} />
        <Text style={[font.caption, { marginTop: spacing.md, color: colors.muted, lineHeight: 18 }]}>
          L'itinéraire (départ et arrivée) ne peut pas être modifié afin de garantir la réservation des passagers. Pour changer de parcours, annulez ce trajet et publiez-en un nouveau.
        </Text>
      </Card>
      {t.demandesAcceptees > 0 ? (
        <Notice tone="info" text={`${t.demandesAcceptees} passager(s) confirmé(s) seront prévenus si l'heure ou le prix change.`} />
      ) : null}
      <Card>
        <Row style={{ justifyContent: 'space-between', marginBottom: spacing.lg }}>
          <Text style={font.label}>Heure de départ</Text>
          <TimeInput value={heure} onChange={setHeure} />
        </Row>
        <Row style={{ justifyContent: 'space-between', marginBottom: spacing.lg }}>
          <View style={{ flex: 1 }}>
            <Text style={font.label}>Places encore libres</Text>
            <Text style={font.caption}>0 = trajet complet</Text>
          </View>
          <Stepper value={places} onChange={setPlaces} min={0} max={8} />
        </Row>
        <Input label="Prix par passager (DT)" icon="cash-outline" value={prix} onChangeText={setPrix} keyboardType="decimal-pad" style={{ marginBottom: 0 }} />
      </Card>

      <ConfirmModal
        visible={!!erreurMsg}
        icon="alert-circle"
        variant="danger"
        titre="Saisie invalide"
        message={erreurMsg}
        cancelLabel={null}
        onConfirm={() => setErreurMsg(null)}
      />
    </Screen>
  );
}
