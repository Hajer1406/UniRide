import React, { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import api, { clearApiToken, loadApiToken, setApiToken, surJetonExpire } from './src/api';
import { connecterSocket, deconnecterSocket, getSocket } from './src/socket';
import { AuthContext, RealtimeProvider } from './src/context/AuthContext';
import { Loader } from './src/components/ui';
import NotificationBanner from './src/components/NotificationBanner';
import { ouvrirNotification } from './src/notifications';
import { colors } from './src/theme';

import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import MainScreen from './src/screens/MainScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import VehicleScreen from './src/screens/VehicleScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import MyRidesScreen from './src/screens/MyRidesScreen';
import PublishRideScreen from './src/screens/PublishRideScreen';
import EditRideScreen from './src/screens/EditRideScreen';
import RideResultsScreen from './src/screens/RideResultsScreen';
import RideDetailScreen from './src/screens/RideDetailScreen';
import BookingRequestsScreen from './src/screens/BookingRequestsScreen';
import MyBookingsScreen from './src/screens/MyBookingsScreen';
import MatchingDetailScreen from './src/screens/MatchingDetailScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import ActiveRideScreen from './src/screens/ActiveRideScreen';
import ChatScreen from './src/screens/ChatScreen';
import RateRideScreen from './src/screens/RateRideScreen';
import ReportScreen from './src/screens/ReportScreen';
import StatsScreen from './src/screens/StatsScreen';
import SosScreen from './src/screens/SosScreen';
import AdminMainScreen from './src/screens/admin/AdminMainScreen';
import AdminUserDetailScreen from './src/screens/admin/AdminUserDetailScreen';

const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();

export default function App() {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [chargement, setChargement] = useState(true);

  const deconnecter = useCallback(async (message) => {
    deconnecterSocket();
    await clearApiToken();
    setToken(null);
    setRole(null);
    if (typeof message === 'string' && message) Alert.alert('Compte suspendu', message);
  }, []);

  /** Ouvre la session : le rôle décide de l'espace affiché (étudiant ou administration). */
  const connecter = useCallback(async (nouveauToken) => {
    await setApiToken(nouveauToken);
    const { data } = await api.get('/auth/me');
    connecterSocket(nouveauToken);
    setRole(data.role);
    setToken(nouveauToken);
  }, []);

  useEffect(() => {
    surJetonExpire(deconnecter);
    loadApiToken()
      .then(async (t) => {
        if (!t) return;
        try {
          await connecter(t);
        } catch (err) {
          // Hors ligne : on garde la session, l'écran affichera l'erreur réseau
          if (!err.response) {
            connecterSocket(t);
            setToken(t);
            setRole('utilisateur');
          }
        }
      })
      .finally(() => setChargement(false));
  }, [deconnecter, connecter]);

  // Compte bloqué ou supprimé par l'administration pendant l'utilisation
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;
    const surBlocage = ({ raison }) => deconnecter(`Votre compte a été bloqué par l'administration : ${raison}`);
    socket.on('compte:bloque', surBlocage);
    return () => socket.off('compte:bloque', surBlocage);
  }, [token, deconnecter]);

  if (chargement) {
    return (
      <SafeAreaProvider>
        <Loader />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthContext.Provider value={{ token, connecter, deconnecter }}>
        <RealtimeProvider token={token}>
          <NavigationContainer ref={navigationRef}>
            <StatusBar style="dark" />
            <Stack.Navigator
              screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: colors.background } }}
            >
              {token && role === 'admin' ? (
                <>
                  <Stack.Screen name="Main" component={AdminMainScreen} options={{ title: 'UniRide — Administration' }} />
                  <Stack.Screen name="AdminUserDetail" component={AdminUserDetailScreen} options={{ title: 'UniRide — Détail utilisateur' }} />
                  <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'UniRide — Notifications' }} />
                </>
              ) : token ? (
                <>
                  <Stack.Screen name="Main" component={MainScreen} options={{ title: 'UniRide' }} />
                  <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'UniRide — Mon profil' }} />
                  <Stack.Screen name="Vehicle" component={VehicleScreen} options={{ title: 'UniRide — Mon véhicule' }} />
                  <Stack.Screen name="Schedule" component={ScheduleScreen} options={{ title: 'UniRide — Emploi du temps' }} />
                  <Stack.Screen name="MyRides" component={MyRidesScreen} options={{ title: 'UniRide — Mes trajets' }} />
                  <Stack.Screen name="PublishRide" component={PublishRideScreen} options={{ title: 'UniRide — Publier un trajet' }} />
                  <Stack.Screen name="EditRide" component={EditRideScreen} options={{ title: 'UniRide — Modifier le trajet' }} />
                  <Stack.Screen name="RideResults" component={RideResultsScreen} options={{ title: 'UniRide — Résultats' }} />
                  <Stack.Screen name="RideDetail" component={RideDetailScreen} options={{ title: 'UniRide — Détail du trajet' }} />
                  <Stack.Screen name="BookingRequests" component={BookingRequestsScreen} options={{ title: 'UniRide — Demandes' }} />
                  <Stack.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: 'UniRide — Mes réservations' }} />
                  <Stack.Screen name="MatchingDetail" component={MatchingDetailScreen} options={{ title: 'UniRide — Compatibilité' }} />
                  <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'UniRide — Notifications' }} />
                  <Stack.Screen name="ActiveRide" component={ActiveRideScreen} options={{ title: 'UniRide — Trajet en cours' }} />
                  <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'UniRide — Messages' }} />
                  <Stack.Screen name="RateRide" component={RateRideScreen} options={{ title: 'UniRide — Évaluation' }} />
                  <Stack.Screen name="Report" component={ReportScreen} options={{ presentation: 'modal', title: 'UniRide — Signalement' }} />
                  <Stack.Screen name="Stats" component={StatsScreen} options={{ title: 'UniRide — Statistiques' }} />
                  <Stack.Screen name="Sos" component={SosScreen} options={{ presentation: 'modal', title: 'UniRide — Urgence SOS' }} />
                </>
              ) : (
                <>
                  <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ title: 'UniRide — Covoiturage étudiant' }} />
                  <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'UniRide — Connexion' }} />
                  <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'UniRide — Inscription' }} />
                  <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'UniRide — Mot de passe oublié' }} />
                </>
              )}
            </Stack.Navigator>
          </NavigationContainer>
          {token ? (
            <NotificationBanner onOpen={(n) => navigationRef.isReady() && ouvrirNotification(navigationRef, n)} />
          ) : null}
        </RealtimeProvider>
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}
