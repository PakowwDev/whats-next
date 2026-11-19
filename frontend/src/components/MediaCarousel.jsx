import { Link } from 'react-router-dom';

function MediaCard({ item }) {
  return (
    <Link
      to={`/media/${item.source}/${item.type}/${item.id}`}
      className="flex-shrink-0 w-32 sm:w-40 bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden hover:border-violet-400 transition-colors"
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
          <div className="absolute top-2 right-2 bg-violet-600/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
            ★ {item.rating}
          </div>
        )}
      </div>

      <div className="p-2">
        <div className="text-sm font-medium truncate">{item.title}</div>
        <div className="text-xs text-[var(--text-muted)] truncate">
          {item.type} · {item.releaseYear || '—'}
        </div>
      </div>
    </Link>
  );
}

function MediaCarousel({ title, items, subtitle, linkTo, linkLabel = 'Voir tout' }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="px-4 sm:px-7 pb-8">
      <div className="flex items-baseline justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h3
            className="text-lg sm:text-xl font-bold"
            style={{ fontFamily: '"Orbitron", sans-serif', letterSpacing: '0.5px' }}
          >
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-[var(--text-muted)] mt-0.5">{subtitle}</p>
          )}
        </div>

        {linkTo && (
          <Link
            to={linkTo}
            className="text-sm text-violet-400 hover:text-violet-300 whitespace-nowrap shrink-0"
          >
            {linkLabel} →
          </Link>
        )}
      </div>

      <div
        className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent' }}
      >
        {items.map(item => (
          <MediaCard key={`${item.source}-${item.type}-${item.id}`} item={item} />
        ))}
      </div>
    </section>
  );
}

export default MediaCarousel;