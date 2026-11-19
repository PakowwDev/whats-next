import { Link } from 'react-router-dom';
import Header from '../components/Header';

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold mb-3">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-[var(--text-muted)]">
        {children}
      </div>
    </section>
  );
}

function Legal() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Header />

      <main className="px-4 sm:px-7 py-10 max-w-3xl mx-auto">
        <h1
          className="text-3xl sm:text-4xl font-bold mb-3"
          style={{ fontFamily: '"Orbitron", sans-serif' }}
        >
          Mentions légales
        </h1>
        <p className="text-[var(--text-muted)] mb-10">
          Informations sur le site, ses données et vos droits.
        </p>

        {/* Bandeau projet scolaire */}
        <div
          className="rounded-xl px-5 py-4 mb-10 border"
          style={{
            borderColor: 'rgba(167, 139, 255, 0.35)',
            background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.10), rgba(217, 70, 239, 0.06))'
          }}
        >
          <p className="text-sm leading-relaxed">
            <span className="font-medium">What's Next?</span> est un projet d'études
            réalisé dans le cadre du Baccalauréat Professionnel CIEL. Le site n'a aucune
            activité commerciale, ne vend aucun produit ou service et ne diffuse aucune
            publicité.
          </p>
        </div>

        <Section title="Éditeur du site">
          <p>
            Site édité par Louis DALARUN--MONTE, élève en Baccalauréat Professionnel CIEL
            (Cybersécurité, Informatique et Réseaux, Électronique), à titre pédagogique et
            non commercial.
          </p>
          <p>
            Pour toute question concernant le site ou vos données, vous pouvez écrire à
            l'adresse indiquée dans la section « Contact ».
          </p>
        </Section>

        <Section title="Hébergement">
          <p>
            L'interface du site est hébergée par Vercel Inc. Le serveur applicatif est
            hébergé par Render Services, Inc. La base de données est hébergée par Supabase,
            sur des serveurs situés dans l'Union européenne.
          </p>
        </Section>

        <Section title="Sources des données">
          <p>
            What's Next? n'héberge aucune donnée relative aux œuvres. Les fiches, visuels,
            notes et bandes-annonces sont fournis en temps réel par trois bases de données
            publiques : TMDB pour les films et séries, IGDB pour les jeux vidéo, et Jikan
            pour les animes.
          </p>
          <p>
            Les titres, visuels et marques présentés appartiennent à leurs ayants droit
            respectifs. Le site ne diffuse aucune œuvre : il oriente vers les plateformes
            qui les proposent.
          </p>
          <p>
            Ce produit utilise l'API TMDB mais n'est ni approuvé ni certifié par TMDB.
          </p>
        </Section>

        <Section title="Données personnelles">
          <p>
            Le site est utilisable sans créer de compte. Dans ce cas, aucune donnée
            personnelle n'est collectée.
          </p>
          <p>
            La création d'un compte entraîne l'enregistrement d'une adresse email, d'un
            pseudonyme et d'un mot de passe. Le mot de passe n'est jamais conservé en
            clair : il est chiffré par la fonction bcrypt avant enregistrement.
          </p>
          <p>
            Sont également enregistrées les préférences renseignées à l'inscription
            (genres et plateformes) ainsi que les listes constituées par l'utilisateur :
            œuvres à découvrir, favorites, déjà vues et masquées. Ces informations servent
            uniquement au calcul des recommandations.
          </p>
          <p>
            Aucune donnée n'est vendue, cédée ou transmise à un tiers. Aucun traceur
            publicitaire n'est utilisé.
          </p>
        </Section>

        <Section title="Vos droits">
          <p>
            Conformément au Règlement général sur la protection des données (RGPD), vous
            disposez à tout moment d'un droit d'accès, de rectification et de suppression
            de vos données.
          </p>
          <p>
            Ces droits s'exercent directement depuis l'onglet « Compte » de votre profil :
          </p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="text-violet-400">·</span>
              <span>
                <span className="text-[var(--text)]">Accès et rectification</span> —
                modification du pseudonyme, de l'adresse email, du mot de passe et des
                préférences.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-violet-400">·</span>
              <span>
                <span className="text-[var(--text)]">Réinitialisation</span> — suppression
                de toutes vos listes et de votre historique, le compte étant conservé.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-violet-400">·</span>
              <span>
                <span className="text-[var(--text)]">Suppression</span> — effacement
                définitif du compte et de l'ensemble des données associées, en une seule
                action et sans délai.
              </span>
            </li>
          </ul>
        </Section>

        <Section title="Cookies et stockage local">
          <p>
            Le site n'utilise aucun cookie publicitaire ni aucun outil de mesure
            d'audience.
          </p>
          <p>
            Le navigateur conserve localement un jeton de connexion, qui maintient votre
            session ouverte, ainsi que vos réglages d'affichage (thème, taille du texte,
            mode dyslexique, contraste). Ces informations restent sur votre appareil et ne
            sont transmises à aucun serveur. La déconnexion efface le jeton.
          </p>
        </Section>

        <Section title="Accessibilité">
          <p>
            Le site propose plusieurs réglages accessibles depuis l'icône en haut à
            droite : choix du thème clair ou sombre, trois tailles de texte, police adaptée
            à la dyslexie et mode contraste élevé.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Pour toute question relative au site ou à vos données, vous pouvez utiliser
            l'adresse email associée à votre compte pour écrire à l'éditeur, ou contacter
            l'établissement dans le cadre duquel ce projet a été réalisé.
          </p>
        </Section>

        <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between flex-wrap gap-3">
          <Link to="/" className="text-sm text-violet-400 hover:text-violet-300">
            ← Retour à l'accueil
          </Link>
          <span className="text-xs text-[var(--text-dim)]">
            Dernière mise à jour : octobre 2026
          </span>
        </div>
      </main>
    </div>
  );
}

export default Legal;