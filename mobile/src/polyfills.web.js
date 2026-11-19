import { Alert, Platform } from 'react-native';

/**
 * Polyfill moderne de Alert.alert pour React Native Web.
 * Remplace window.alert / window.confirm (qui affichent "localhost:8081 indique")
 * par une boîte de dialogue modale élégante, centrée et stylisée aux couleurs d'UniRide.
 */
if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof document !== 'undefined') {
  Alert.alert = (title, message, buttons) => {
    // Supprimer une boîte d'alerte existante si présente
    const ancien = document.getElementById('uniride-custom-alert');
    if (ancien) ancien.remove();

    const listeBoutons = buttons && buttons.length > 0 ? buttons : [{ text: 'OK' }];

    const conteneur = document.createElement('div');
    conteneur.id = 'uniride-custom-alert';
    Object.assign(conteneur.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      zIndex: '999999',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backgroundColor: 'rgba(15, 23, 42, 0.55)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      opacity: '0',
      transition: 'opacity 0.15s ease-out',
    });

    const carte = document.createElement('div');
    Object.assign(carte.style, {
      backgroundColor: '#ffffff',
      borderRadius: '20px',
      maxWidth: '380px',
      width: '100%',
      padding: '24px 22px 20px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      textAlign: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      transform: 'scale(0.92)',
      transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
    });

    // Titre
    if (title) {
      const h3 = document.createElement('h3');
      h3.textContent = title;
      Object.assign(h3.style, {
        margin: '0 0 10px 0',
        fontSize: '17px',
        fontWeight: '700',
        color: '#0F172A',
        lineHeight: '1.3',
      });
      carte.appendChild(h3);
    }

    // Message
    if (message) {
      const p = document.createElement('p');
      p.textContent = message;
      Object.assign(p.style, {
        margin: '0 0 20px 0',
        fontSize: '14px',
        color: '#475569',
        lineHeight: '1.55',
        whiteSpace: 'pre-wrap',
      });
      carte.appendChild(p);
    }

    // Rangée de boutons
    const rangee = document.createElement('div');
    Object.assign(rangee.style, {
      display: 'flex',
      gap: '10px',
      justifyContent: 'stretch',
    });

    const fermer = () => {
      conteneur.style.opacity = '0';
      carte.style.transform = 'scale(0.92)';
      setTimeout(() => {
        if (conteneur.parentNode) conteneur.remove();
      }, 150);
    };

    listeBoutons.forEach((b) => {
      const btn = document.createElement('button');
      btn.textContent = b.text || 'OK';

      const estAnnuler = b.style === 'cancel';
      const estDestructif = b.style === 'destructive';

      Object.assign(btn.style, {
        flex: '1',
        padding: '12px 16px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        border: estAnnuler ? '1px solid #E2E8F0' : 'none',
        backgroundColor: estDestructif ? '#EF4444' : estAnnuler ? '#F8FAFC' : '#003B95',
        color: estAnnuler ? '#334155' : '#ffffff',
        transition: 'all 0.15s ease',
      });

      btn.onmouseenter = () => {
        btn.style.opacity = '0.9';
        btn.style.transform = 'translateY(-1px)';
      };
      btn.onmouseleave = () => {
        btn.style.opacity = '1';
        btn.style.transform = 'translateY(0)';
      };

      btn.onclick = () => {
        fermer();
        if (typeof b.onPress === 'function') {
          b.onPress();
        }
      };

      rangee.appendChild(btn);
    });

    carte.appendChild(rangee);
    conteneur.appendChild(carte);
    document.body.appendChild(conteneur);

    // Animation d'entrée
    requestAnimationFrame(() => {
      conteneur.style.opacity = '1';
      carte.style.transform = 'scale(1)';
    });
  };
}
