/**
 * Service d'envoi d'e-mails UniRide (US1 — Mot de passe oublié).
 *
 * Configuration dans backend/.env :
 *   EMAIL_FROM=uniride.isetnabeul@gmail.com
 *   EMAIL_PASS=xxxx xxxx xxxx xxxx   ← Mot de passe d'application Gmail (16 caractères)
 *
 * Pour créer un mot de passe d'application Gmail :
 *   1. Activez la validation en 2 étapes sur votre compte Google.
 *   2. Allez sur https://myaccount.google.com/apppasswords
 *   3. Créez une application "UniRide Backend" → copiez le mot de passe généré.
 *   4. Collez-le dans EMAIL_PASS dans votre .env (sans espaces).
 */

const nodemailer = require('nodemailer');

function creerTransporteur() {
  const user = process.env.EMAIL_FROM;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass || pass === 'votre-mot-de-passe-application-gmail') {
    // Pas de configuration email : on utilise Ethereal (email fictif, visible dans la console)
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

/**
 * Envoie un e-mail de réinitialisation de mot de passe.
 * @returns {Promise<boolean>} true si envoyé, false si non configuré (mode demo)
 */
async function envoyerCodeReinitialisation(destinataire, code) {
  const transporteur = creerTransporteur();

  if (!transporteur) {
    console.log(`\n📧 [EMAIL NON CONFIGURÉ] Code de réinitialisation pour ${destinataire} : ${code}\n`);
    console.log(`   → Pour activer l'envoi d'e-mails, ajoutez EMAIL_FROM et EMAIL_PASS dans backend/.env`);
    return false; // indique que l'email n'a pas été envoyé (mode demo)
  }

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F8FAFC;margin:0;padding:20px;">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <!-- En-tête -->
    <div style="background:#003B95;padding:28px 32px;text-align:center;">
      <div style="font-size:36px;margin-bottom:8px;">🚗</div>
      <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">UniRide</h1>
      <p style="color:rgba(255,255,255,0.75);margin:4px 0 0;font-size:13px;">Covoiturage étudiant · ISET Nabeul</p>
    </div>
    <!-- Corps -->
    <div style="padding:32px;">
      <h2 style="color:#0F172A;margin:0 0 12px;font-size:18px;">Réinitialisation de mot de passe</h2>
      <p style="color:#475569;margin:0 0 24px;line-height:1.6;">
        Vous avez demandé à réinitialiser votre mot de passe UniRide.<br>
        Voici votre code de vérification à 6 chiffres :
      </p>
      <!-- Code -->
      <div style="background:#F1F5F9;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
        <span style="font-size:40px;font-weight:900;color:#003B95;letter-spacing:10px;">${code}</span>
      </div>
      <p style="color:#94A3B8;font-size:13px;margin:0 0 8px;">⏱ Ce code est valable <strong>15 minutes</strong>.</p>
      <p style="color:#94A3B8;font-size:13px;margin:0;">Si vous n'avez pas demandé de réinitialisation, ignorez cet e-mail — votre compte reste sécurisé.</p>
    </div>
    <!-- Pied de page -->
    <div style="background:#F8FAFC;padding:16px 32px;border-top:1px solid #E2E8F0;text-align:center;">
      <p style="color:#94A3B8;font-size:12px;margin:0;">UniRide · ISET Nabeul · uniride.isetnabeul@gmail.com</p>
    </div>
  </div>
</body>
</html>`;

  await transporteur.sendMail({
    from: `"UniRide ISET Nabeul" <${process.env.EMAIL_FROM}>`,
    to: destinataire,
    subject: `${code} — Votre code UniRide`,
    html,
    text: `Votre code de réinitialisation UniRide : ${code}\n\nCe code est valable 15 minutes.\n\nSi vous n'avez pas demandé de réinitialisation, ignorez ce message.`,
  });

  return true; // email envoyé avec succès
}

module.exports = { envoyerCodeReinitialisation };
