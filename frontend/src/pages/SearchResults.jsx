import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchMedia } from '../lib/api';
import Header from '../components/Header';

const TYPES = [
  { id: 'GAME', label: 'Jeux vidéo' },
  { id: 'MOVIE', label: 'Films' },
  { id: 'SERIES', label: 'Séries' },
  { id: 'ANIME', label: 'Animes' }
];

const RATINGS = [
  { value: 0, stars: 0, label: 'Toutes les notes' },
  { value: 5, stars: 3, label: 'et plus' },
  { value: 7, stars: 4, label: 'et plus' },
  { value: 9, stars: 5, label: '' }
];

const PERIODS = [
  { id: 'all', label: 'Toutes les années' },
  { id: '2020', label: '2020 et après' },
  { id: '2010', label: '2010 à 2019' },
  { id: '2000', label: '2000 à 2009' },
  { id: 'old', label: 'Avant 2000' }
];

const SORTS = [
  { id: 'relevance', label: 'Pertinence' },
  { id: 'rating', label: 'Meilleure note' },
  { id: 'recent', label: 'Plus récent' },
  { id: 'title', label: 'Titre (A à Z)' }
];

const TYPE_LABEL = {
  GAME: 'Jeu',
  MOVIE: 'Film',
  SERIES: 'Série',
  ANIME: 'Anime'
};

const PER_PAGE = 12;

// Carte d'un résultat
function ResultCard({ item }) {
  return (
    <Link
      to={`/media/${item.source}/${item.type}/${item.id}`}
      className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-violet-400 transition-colors flex flex-col"
    >
      <div className="relative">
        {item.posterUrl ? (
          <img
            src={item.posterUrl}
            alt={item.title}
            className="w-full aspect-[2/3] object-cover"
          />
        ) : (
          <div className="w-full aspect-[2/3] bg-[var(--surface-2)] flex items-center justify-center text-xs text-[var(--text-dim)]">
            Pas d'image
          </div>
        )}

        {item.rating && (
          <div className="absolute top-2.5 right-2.5 bg-violet-600/90 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">
            ★ {item.rating}
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="font-medium truncate mb-1.5">{item.title}</div>
        <div className="flex gap-1.5 flex-wrap">
          <span className="text-[11px] bg-violet-500/15 text-violet-400 border border-violet-500/30 px-2 py-0.5 rounded-full">
            {TYPE_LABEL[item.type] || item.type}
          </span>
          {item.releaseYear && (
            <span className="text-[11px] bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)] px-2 py-0.5 rounded-full">
              {item.releaseYear}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [input, setInput] = useState(query);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filtres
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [period, setPeriod] = useState('all');
  const [sort, setSort] = useState('relevance');
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setInput(query);
  }, [query]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    setPage(1);
    searchMedia(query)
      .then(data => setResults(data.results))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [selectedTypes, minRating, period, sort]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim().length < 2) return;
    setSearchParams({ q: input.trim() });
  };

  const toggleType = (typeId) => {
    setSelectedTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    );
  };

  const resetFilters = () => {
    setSelectedTypes([]);
    setMinRating(0);
    setPeriod('all');
    setSort('relevance');
  };

  const typeCounts = useMemo(() => {
    const counts = {};
    results.forEach(item => {
      counts[item.type] = (counts[item.type] || 0) + 1;
    });
    return counts;
  }, [results]);

  const filtered = useMemo(() => {
    let list = [...results];

    if (selectedTypes.length > 0) {
      list = list.filter(item => selectedTypes.includes(item.type));
    }

    if (minRating > 0) {
      list = list.filter(item => (item.rating || 0) >= minRating);
    }

    if (period !== 'all') {
      list = list.filter(item => {
        const year = item.releaseYear;
        if (!year) return false;
        if (period === '2020') return year >= 2020;
        if (period === '2010') return year >= 2010 && year <= 2019;
        if (period === '2000') return year >= 2000 && year <= 2009;
        if (period === 'old') return year < 2000;
        return true;
      });
    }

    if (sort === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === 'recent') {
      list.sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0));
    } else if (sort === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title, 'fr'));
    }

    return list;
  }, [results, selectedTypes, minRating, period, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const activeFilters =
    selectedTypes.length > 0 || minRating > 0 || period !== 'all';

  const sectionTitle = "text-[10px] text-violet-400 tracking-widest font-semibold mb-2.5";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Header sticky />

      {/* Barre de recherche centrée */}
      <section className="px-4 sm:px-7 py-5 border-b border-[var(--border-subtle)]">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Cherchez une œuvre ou un genre"
            className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-full px-5 py-2.5 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30"
          />
          <button
            type="submit"
            disabled={input.trim().length < 2}
            className="bg-gradient-to-br from-violet-600 to-violet-400 px-6 py-2.5 rounded-full text-sm font-medium shadow-md shadow-violet-500/30 disabled:opacity-50"
          >
            Rechercher
          </button>
        </form>
      </section>

      {/* Titre des résultats + tri */}
      <section className="px-4 sm:px-7 pt-6 pb-4 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: '"Orbitron", sans-serif' }}>
            Résultats pour{' '}
            <span className="italic bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
              « {query} »
            </span>
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {loading
              ? 'Recherche en cours…'
              : `${filtered.length} œuvre${filtered.length > 1 ? 's' : ''} trouvée${filtered.length > 1 ? 's' : ''}`}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-full px-4 py-1.5">
          <span className="text-xs text-[var(--text-dim)] shrink-0">Trier :</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-transparent text-sm focus:outline-none cursor-pointer"
          >
            {SORTS.map(s => (
              <option key={s.id} value={s.id} className="bg-[var(--surface)]">
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Corps : sidebar + résultats */}
      <div className="px-4 sm:px-7 pb-10 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 items-start">

        {/* ===== SIDEBAR FILTRES ===== */}
        <aside className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
          <div className="flex items-center justify-between lg:mb-5">
            <button
              onClick={() => setFiltersOpen(o => !o)}
              className="lg:hidden flex items-center gap-2 text-base font-bold"
            >
              <span>Filtres</span>
              {activeFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500"></span>
              )}
              <span className="text-[var(--text-muted)] text-xs">
                {filtersOpen ? '▲' : '▼'}
              </span>
            </button>

            <h2 className="hidden lg:block text-base font-bold">Filtres</h2>
          </div>

          <div className={`${filtersOpen ? 'block mt-5' : 'hidden'} lg:block`}>

            {/* Type de média */}
            <div className="mb-6">
              <div className={sectionTitle}>TYPE DE MÉDIA</div>
              <div className="space-y-2">
                {TYPES.map(type => (
                  <label key={type.id} className="flex items-center gap-2.5 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type.id)}
                      onChange={() => toggleType(type.id)}
                      className="w-4 h-4 accent-violet-500 cursor-pointer"
                    />
                    <span className="flex-1">{type.label}</span>
                    <span className="text-xs text-[var(--text-dim)]">
                      {typeCounts[type.id] || 0}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Note minimale */}
            <div className="mb-6">
              <div className={sectionTitle}>NOTE MIN.</div>
              <div className="space-y-2">
                {RATINGS.map(r => (
                  <label key={r.value} className="flex items-center gap-2.5 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      checked={minRating === r.value}
                      onChange={() => setMinRating(r.value)}
                      className="w-4 h-4 accent-violet-500 cursor-pointer"
                    />
                    {r.stars > 0 ? (
                      <span className="flex items-center gap-1">
                        <span className="text-violet-400 tracking-tight">
                          {'★'.repeat(r.stars)}
                        </span>
                        <span className="text-[var(--text-muted)] text-xs">{r.label}</span>
                      </span>
                    ) : (
                      <span>{r.label}</span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Période */}
            <div className="mb-6">
              <div className={sectionTitle}>PÉRIODE</div>
              <div className="space-y-2">
                {PERIODS.map(p => (
                  <label key={p.id} className="flex items-center gap-2.5 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="period"
                      checked={period === p.id}
                      onChange={() => setPeriod(p.id)}
                      className="w-4 h-4 accent-violet-500 cursor-pointer"
                    />
                    <span>{p.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Réinitialiser */}
            <button
              onClick={resetFilters}
              disabled={!activeFilters && sort === 'relevance'}
              className="w-full bg-transparent text-violet-400 border border-violet-400/50 py-2 rounded-lg text-sm hover:bg-violet-500/10 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Réinitialiser filtres
            </button>

          </div>
        </aside>

        {/* ===== RÉSULTATS ===== */}
        <main>
          {error && (
            <p className="text-red-400 py-8 text-center">{error}</p>
          )}

          {loading && (
            <p className="text-center text-[var(--text-muted)] py-16">Chargement…</p>
          )}

          {!loading && !error && filtered.length === 0 && query && (
            <div className="text-center py-16">
              <p className="text-[var(--text-muted)] mb-3">
                {results.length > 0
                  ? 'Aucun résultat ne correspond à vos filtres.'
                  : `Aucune œuvre trouvée pour « ${query} ».`}
              </p>
              {results.length > 0 ? (
                <button onClick={resetFilters} className="text-violet-400 underline">
                  Réinitialiser les filtres
                </button>
              ) : (
                <Link to="/" className="text-violet-400 underline">
                  Retour à l'accueil
                </Link>
              )}
            </div>
          )}

          {!loading && pageItems.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pageItems.map(item => (
                  <ResultCard key={`${item.source}-${item.type}-${item.id}`} item={item} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-all ${
                        n === page
                          ? 'bg-gradient-to-br from-violet-600 to-violet-400 text-white shadow-md shadow-violet-500/30'
                          : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] hover:border-violet-400'
                      }`}
                    >
                      {n}
                    </button>
                  ))}

                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--text-muted)] disabled:opacity-30 hover:border-violet-400"
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default SearchResults;