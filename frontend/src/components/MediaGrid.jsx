import { Link } from 'react-router-dom';

function MediaGrid({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {items.map(item => (
        <Link
          key={`${item.source}-${item.type}-${item.id}`}
          to={`/media/${item.source}/${item.type}/${item.id}`}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden hover:border-violet-400 transition-colors"
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
      ))}
    </div>
  );
}

export default MediaGrid;