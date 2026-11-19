// =====================================================
// Module pour récupérer les détails d'une œuvre
// (depuis TMDB, IGDB ou Jikan selon la source)
// =====================================================
import { igdbQuery } from './igdb.js';

// =====================================================
// Détails d'un film/série depuis TMDB
// =====================================================
async function getTmdbDetail(type, id) {
  const apiKey = process.env.TMDB_API_KEY;
  const endpoint = type === 'MOVIE' ? 'movie' : 'tv';

  const detailUrl = `https://api.themoviedb.org/3/${endpoint}/${id}?api_key=${apiKey}&language=fr-FR&append_to_response=videos,watch/providers,recommendations`;
  const detailRes = await fetch(detailUrl);
  const detail = await detailRes.json();

  if (detail.status_code) {
    throw new Error(detail.status_message || 'Œuvre introuvable');
  }

  // Trailer YouTube si dispo
  const trailer = detail.videos?.results?.find(
    v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
  );

  // Plateformes de streaming en France
  const providers = detail['watch/providers']?.results?.FR;
  const streamingPlatforms = [
    ...(providers?.flatrate || []),
    ...(providers?.rent || [])
  ].slice(0, 8).map(p => ({
    name: p.provider_name,
    logoUrl: `https://image.tmdb.org/t/p/w92${p.logo_path}`
  }));

  // Avis externes
  const externalRatings = [];
  if (detail.vote_average > 0) {
    externalRatings.push({
      source: 'TMDB',
      label: 'The Movie Database',
      score: (Math.round(detail.vote_average * 10) / 10).toFixed(1),
      scale: '/10',
      count: detail.vote_count,
      countLabel: 'votes',
      url: `https://www.themoviedb.org/${endpoint}/${detail.id}`
    });
  }
  if (detail.popularity) {
    externalRatings.push({
      source: 'POPULARITÉ',
      label: 'Indice TMDB',
      score: Math.round(detail.popularity).toLocaleString('fr-FR'),
      scale: '',
      count: null,
      countLabel: 'Mesure de l\'intérêt actuel du public',
      url: null
    });
  }

  // Œuvres similaires
  const similar = (detail.recommendations?.results || [])
    .filter(r => r.poster_path)
    .slice(0, 10)
    .map(r => ({
      id: String(r.id),
      source: 'TMDB',
      type,
      title: r.title || r.name,
      releaseYear: (r.release_date || r.first_air_date)?.slice(0, 4) || null,
      rating: r.vote_average ? Math.round(r.vote_average * 10) / 10 : null,
      posterUrl: `https://image.tmdb.org/t/p/w500${r.poster_path}`
    }));

  return {
    id: String(detail.id),
    source: 'TMDB',
    type,
    title: detail.title || detail.name,
    description: detail.overview || '',
    releaseYear: (detail.release_date || detail.first_air_date)?.slice(0, 4) || null,
    rating: detail.vote_average ? Math.round(detail.vote_average * 10) / 10 : null,
    voteCount: detail.vote_count,
    posterUrl: detail.poster_path
      ? `https://image.tmdb.org/t/p/w500${detail.poster_path}`
      : null,
    backdropUrl: detail.backdrop_path
      ? `https://image.tmdb.org/t/p/original${detail.backdrop_path}`
      : null,
    genres: (detail.genres || []).map(g => g.name),
    runtime: detail.runtime || (detail.episode_run_time?.[0]) || null,
    studio: detail.production_companies?.[0]?.name || null,
    trailerUrl: trailer
      ? `https://www.youtube.com/embed/${trailer.key}`
      : null,
    platforms: streamingPlatforms,
    externalRatings,
    similar
  };
}

// =====================================================
// Détails d'un jeu depuis IGDB
// =====================================================
async function getIgdbDetail(id) {
  const query = `
    fields name, summary, storyline, first_release_date,
           rating, rating_count, aggregated_rating, aggregated_rating_count,
           total_rating, total_rating_count,
           cover.image_id, screenshots.image_id, videos.video_id,
           genres.name, platforms.name, involved_companies.company.name,
           similar_games.name, similar_games.cover.image_id,
           similar_games.rating, similar_games.total_rating,
           similar_games.first_release_date;
    where id = ${parseInt(id)};
  `;

  const games = await igdbQuery('games', query);

  if (!Array.isArray(games) || games.length === 0) {
    throw new Error('Jeu introuvable');
  }

  const game = games[0];
  const trailerKey = game.videos?.[0]?.video_id;

  const platforms = (game.platforms || []).slice(0, 8).map(p => ({
    name: p.name
  }));

  // Avis externes : joueurs et presse séparément
  const externalRatings = [];
  if (game.rating) {
    externalRatings.push({
      source: 'JOUEURS',
      label: 'Communauté IGDB',
      score: (Math.round(game.rating) / 10).toFixed(1),
      scale: '/10',
      count: game.rating_count,
      countLabel: 'évaluations',
      url: `https://www.igdb.com/games/${game.id}`
    });
  }
  if (game.aggregated_rating) {
    externalRatings.push({
      source: 'PRESSE',
      label: 'Critiques spécialisées',
      score: Math.round(game.aggregated_rating),
      scale: '/100',
      count: game.aggregated_rating_count,
      countLabel: 'critiques',
      url: null
    });
  }
  if (game.total_rating && externalRatings.length > 0) {
    externalRatings.push({
      source: 'GLOBAL',
      label: 'Moyenne pondérée',
      score: (Math.round(game.total_rating) / 10).toFixed(1),
      scale: '/10',
      count: game.total_rating_count,
      countLabel: 'au total',
      url: null
    });
  }

  // Jeux similaires
  const similar = (game.similar_games || [])
    .filter(g => g.cover)
    .slice(0, 10)
    .map(g => ({
      id: String(g.id),
      source: 'IGDB',
      type: 'GAME',
      title: g.name,
      releaseYear: g.first_release_date
        ? new Date(g.first_release_date * 1000).getFullYear()
        : null,
      rating: (g.total_rating || g.rating)
        ? Math.round(g.total_rating || g.rating) / 10
        : null,
      posterUrl: `https://images.igdb.com/igdb/image/upload/t_cover_big/${g.cover.image_id}.jpg`
    }));

  return {
    id: String(game.id),
    source: 'IGDB',
    type: 'GAME',
    title: game.name,
    description: game.summary || game.storyline || '',
    releaseYear: game.first_release_date
      ? new Date(game.first_release_date * 1000).getFullYear()
      : null,
    rating: (game.total_rating || game.rating)
      ? Math.round(game.total_rating || game.rating) / 10
      : null,
    voteCount: game.total_rating_count || game.rating_count,
    posterUrl: game.cover
      ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
      : null,
    backdropUrl: game.screenshots?.[0]
      ? `https://images.igdb.com/igdb/image/upload/t_screenshot_huge/${game.screenshots[0].image_id}.jpg`
      : null,
    genres: (game.genres || []).map(g => g.name),
    runtime: null,
    studio: game.involved_companies?.[0]?.company?.name || null,
    trailerUrl: trailerKey
      ? `https://www.youtube.com/embed/${trailerKey}`
      : null,
    platforms,
    externalRatings,
    similar
  };
}

// =====================================================
// Détails d'un anime depuis Jikan
// =====================================================
async function getJikanDetail(id) {
  const url = `https://api.jikan.moe/v4/anime/${id}/full`;
  const response = await fetch(url);
  const data = await response.json();

  if (!data.data) {
    throw new Error('Anime introuvable');
  }

  const anime = data.data;
  const trailerKey = anime.trailer?.youtube_id;

  const platforms = (anime.streaming || []).slice(0, 8).map(p => ({
    name: p.name,
    url: p.url
  }));

  // Avis externes
  const externalRatings = [];
  if (anime.score) {
    externalRatings.push({
      source: 'MYANIMELIST',
      label: 'Note de la communauté',
      score: anime.score.toFixed(2),
      scale: '/10',
      count: anime.scored_by,
      countLabel: 'votes',
      url: anime.url || null
    });
  }
  if (anime.rank) {
    externalRatings.push({
      source: 'CLASSEMENT',
      label: 'Parmi tous les animes',
      score: `#${anime.rank.toLocaleString('fr-FR')}`,
      scale: '',
      count: null,
      countLabel: 'Position au classement général',
      url: null
    });
  }
  if (anime.members) {
    externalRatings.push({
      source: 'COMMUNAUTÉ',
      label: 'Membres MyAnimeList',
      score: anime.members.toLocaleString('fr-FR'),
      scale: '',
      count: null,
      countLabel: 'ont ajouté cet anime à leur liste',
      url: null
    });
  }

  // Animes similaires (appel séparé, Jikan ne les donne pas dans /full)
  let similar = [];
  try {
    const recoRes = await fetch(`https://api.jikan.moe/v4/anime/${id}/recommendations`);
    const recoData = await recoRes.json();
    similar = (recoData.data || [])
      .slice(0, 10)
      .map(r => ({
        id: String(r.entry.mal_id),
        source: 'ANILIST',
        type: 'ANIME',
        title: r.entry.title,
        releaseYear: null,
        rating: null,
        posterUrl: r.entry.images?.jpg?.large_image_url || null
      }))
      .filter(r => r.posterUrl);
  } catch (err) {
    console.error('Erreur recommandations Jikan :', err.message);
  }

  return {
    id: String(anime.mal_id),
    source: 'ANILIST',
    type: 'ANIME',
    title: anime.title,
    description: anime.synopsis || '',
    releaseYear: anime.year,
    rating: anime.score,
    voteCount: anime.scored_by,
    posterUrl: anime.images?.jpg?.large_image_url || null,
    backdropUrl: anime.images?.jpg?.large_image_url || null,
    genres: (anime.genres || []).map(g => g.name),
    runtime: anime.duration ? parseInt(anime.duration) : null,
    episodes: anime.episodes,
    studio: anime.studios?.[0]?.name || null,
    trailerUrl: trailerKey
      ? `https://www.youtube.com/embed/${trailerKey}`
      : null,
    platforms,
    externalRatings,
    similar
  };
}

// =====================================================
// Fonction publique : aiguillage selon la source
// =====================================================
export async function getMediaDetail(source, type, id) {
  if (source === 'TMDB') {
    return getTmdbDetail(type, id);
  }
  if (source === 'IGDB') {
    return getIgdbDetail(id);
  }
  if (source === 'ANILIST') {
    return getJikanDetail(id);
  }
  throw new Error(`Source inconnue : ${source}`);
}