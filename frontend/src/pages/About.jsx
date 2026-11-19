import { Link } from 'react-router-dom';
import Header from '../components/Header';

const SOURCES = [
  {
    name: 'TMDB',
    full: 'The Movie Database',
    desc: 'Films et séries : fiches, affiches, bandes-annonces et notes.',
    url: 'https://www.themoviedb.org/'
  },
  {
    name: 'IGDB',
    full: 'Internet Game Database',
    desc: 'Jeux vidéo : fiches, jaquettes, plateformes et notes.',
    url: 'https://www.igdb.com/'
  },
  {
    name: 'Jikan',
    full: 'API MyAnimeList',
    desc: 'Animes : fiches, visuels, scores et plateformes de diffusion.',
    url: 'https://jikan.moe/'
  }
];

const STACK = [
  { label: 'Interface', value: 'React, Vite, Tailwind CSS' },
  { label: 'Serveur', value: 'Node.js, Express' },
  { label: 'Base de données', value: 'PostgreSQL, Prisma' },
  { label: 'Authentification', value: 'JWT, bcrypt' }
];

function About() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Header />

      <main className="px-4 sm:px-7 py-10 max-w-3xl mx-auto">
        <h1
          className="text-3xl sm:text-4xl font-bold mb-3"
          style={{ fontFamily: '"Orbitron", sans-serif' }}
        >
          À propos
        </h1>
        <p className="text-[var(--text-muted)] mb-10">
          Ce que fait ce site, d'où viennent ses données et comment il est construit.
        </p>

        {/* Le projet */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-3">Le projet</h2>
          <div className="space-y-3 text-sm leading-relaxed text-[var(--text-muted)]">
            <p>
              Trouver une nouvelle œuvre à découvrir demande aujourd'hui de passer d'un
              site à l'autre : un pour les films, un autre pour les jeux, un troisième
              pour les animes. Chacun ne couvre qu'une seule catégorie, et les
              suggestions des plateformes de diffusion mettent surtout en avant leur
              propre catalogue.
            </p>
            <p>
              <span className="text-[var(--text)] font-medium">What's Next?</span> réunit
              les quatre catégories au même endroit et propose des recommandations
              fondées sur les goûts de la personne qui l'utilise, pas sur un catalogue à
              promouvoir.
            </p>
            <p>
              Le site s'utilise sans compte, pour chercher une œuvre ou parcourir les
              tendances. Avec un compte, il propose des recommandations personnalisées et
              permet de tenir ses listes : à découvrir, favoris, déjà vu, masqué.
            </p>
          </div>
        </section>

        {/* Sources */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-2">D'où viennent les données</h2>
          <p className="text-sm text-[var(--text-muted)] mb-4 leading-relaxed">
            What's Next? n'héberge aucune donnée sur les œuvres. Les fiches, visuels et
            notes proviennent de trois bases publiques, interrogées en direct.
          </p>

          <div className="space-y-2.5">
            {SOURCES.map(s => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 hover:border-violet-400 transition-colors"
              >
                <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                  <span className="font-medium text-violet-400">{s.name}</span>
                  <span className="text-xs text-[var(--text-dim)]">{s.full}</span>
                </div>
                <p className="text-sm text-[var(--text-muted)]">{s.desc}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Technologies */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-2">Comment c'est construit</h2>
          <p className="text-sm text-[var(--text-muted)] mb-4 leading-relaxed">
            Une application web complète, développée du serveur à l'interface.
          </p>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl divide-y divide-[var(--border)]">
            {STACK.map(item => (
              <div
                key={item.label}
                className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 p-4"
              >
                <span className="text-xs text-[var(--text-dim)] sm:w-40 shrink-0">
                  {item.label}
                </span>
                <span className="text-sm">{item.value}</span>
              </div>
            ))}
          </div>

          <p className="text-sm text-[var(--text-muted)] mt-4 leading-relaxed">
            Les recommandations reposent sur un calcul de correspondance entre les genres
            choisis par l'utilisateur et ceux des œuvres remontées par les trois API. Les
            œuvres déjà vues ou masquées sont écartées des suggestions.
          </p>
        </section>

        {/* Auteur */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Qui est derrière</h2>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 flex items-center gap-4">
            <div className="w-14 h-14 shrink-0 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center text-xl font-bold text-white">
              L
            </div>
            <div>
              <div className="font-medium mb-0.5">Louis DALARUN--MONTE</div>
              <div className="text-sm text-[var(--text-muted)]">
                Conception et développement
              </div>
              <div className="text-xs text-[var(--text-dim)] mt-1">
                Projet réalisé dans le cadre du Bac Professionnel CIEL
              </div>
            </div>
          </div>
        </section>

        {/* Retour */}
        <div className="pt-4 border-t border-[var(--border-subtle)]">
          <Link to="/" className="text-sm text-violet-400 hover:text-violet-300">
            ← Retour à l'accueil
          </Link>
        </div>
      </main>
    </div>
  );
}

export default About;