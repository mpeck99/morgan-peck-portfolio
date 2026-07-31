import XLSX from "xlsx";
import dotenv from "dotenv";

function loadMoviesFromSheet(filepath) {
  const workbook = XLSX.readFile(filepath);
  const sheet = workbook.Sheets["Movies"];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  return rows
    .filter((row) => row[0] != null && row[1] != null)
    .map((row) => ({
      title: String(row[0]).trim(),
      year: Number(row[1]),
    }));
}

dotenv.config({ path: ".env.local" });

const OMDB_API_KEY = process.env.OMDB_API;

class OMDbRateLimitError extends Error {}

async function omdbFetch(url) {
  const res = await fetch(url);
  const data = await res.json();
  if (data.Error === "Request limit reached!") {
    throw new OMDbRateLimitError("OMDb daily request limit reached");
  }
  return data;
}

function normalizeTitle(title) {
  return title.trim().toLowerCase();
}

// Catches the recurring flavors of non-movie junk that show up in OMDb
// under "movie" type anyway: podcast/recap episodes, making-of shorts,
// special-event broadcasts, trailers, etc. Title-based, so it's a
// best-effort filter, not a guarantee — paired with the runtime/type
// checks below for defense in depth.
const JUNK_TITLE_PATTERN =
  /\b(episode\s*\d+|ep\.?\s*\d+|podcast|special event|featurette|making of|behind the scenes|commentary|bonus (disc|content|feature)|trailer|teaser|recap|fan (edit|film|made)|vlog|reaction)\b/i;

function looksLikeJunkTitle(title) {
  return JUNK_TITLE_PATTERN.test(title);
}

// Shorts, featurettes, and behind-the-scenes content are almost always
// under ~40 minutes. Only rejects when OMDb actually reports a runtime —
// some legitimate obscure entries have no runtime data at all, and we'd
// rather fall through to fuzzy search than wrongly discard those.
function isFeatureLength(omdb) {
  if (!cleanField(omdb.Runtime)) return true;
  const minutes = parseInt(omdb.Runtime, 10);
  return Number.isNaN(minutes) || minutes >= 40;
}

async function lookupOMDbByTitle(title, year) {
  const url = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(title)}&y=${year}&type=movie`;
  const data = await omdbFetch(url);
  if (data.Response !== "True") return null;

  // OMDb's "t=" endpoint sometimes returns Response: "True" for a bogus/junk
  // entry that happens to share the exact title+year (e.g. a RiffTrax
  // riff or a placeholder entry) instead of "no match". Reject anything
  // whose returned title doesn't actually match what we asked for, so the
  // caller falls through to fuzzy search instead of silently saving garbage.
  if (normalizeTitle(data.Title) !== normalizeTitle(title)) return null;

  // Belt-and-suspenders on top of the title match: reject anything that's
  // not actually a feature film even if the title happened to line up
  // exactly (podcast episodes/specials often reuse the movie's own title).
  if (data.Type && data.Type !== "movie") return null;
  if (looksLikeJunkTitle(data.Title)) return null;
  if (!isFeatureLength(data)) return null;

  return data;
}

async function fetchFromOMDbFuzzy(title, year) {
  // OMDb's fuzzy search endpoint, which tolerates missing words/symbols
  // better than the exact-title lookup, but NOT missing apostrophes.
  const searchUrl = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(title)}&type=movie`;
  const searchData = await omdbFetch(searchUrl);

  if (searchData.Response !== "True") {
    return null;
  }

  // OMDb sometimes tracks a limited/festival release year instead of the
  // wide release year my sheet has, so allow a small buffer — but require
  // an exact title match within that window so we don't grab a sequel
  // (e.g. "Open Water 2: Adrift") just because its year happens to be close.
  // Also drop obvious non-movie junk up front so it never even becomes a
  // candidate (the final lookupOMDbByTitle call below re-checks this too,
  // but there's no reason to chase a podcast episode that far).
  const withinTolerance = searchData.Search.filter(
    (m) => Math.abs(Number(m.Year) - year) <= 2 && !looksLikeJunkTitle(m.Title)
  );
  const candidate = withinTolerance.find((m) => m.Title.toLowerCase() === title.toLowerCase());

  if (!candidate) {
    return null;
  }

  // The search endpoint only returns summary fields, so fetch full details by imdbID,
  // using the candidate's own year since it may differ from my sheet's year
  return lookupOMDbByTitle(candidate.Title, candidate.Year);
}

async function fetchFromOMDb(title, year, tmdbTitle) {
  const direct = await lookupOMDbByTitle(title, year);
  if (direct) return direct;

  console.log(`  OMDb direct lookup failed — trying fuzzy search...`);
  const fuzzy = await fetchFromOMDbFuzzy(title, year);
  if (fuzzy) return fuzzy;

  // Apostrophes ("knights" vs "Knight's") trip up OMDb's own matching, but
  // TMDb's search is more forgiving and often already resolved the correct,
  // properly-punctuated title — so try OMDb one more time with that.
  if (tmdbTitle && tmdbTitle.toLowerCase() !== title.toLowerCase()) {
    console.log(`  Retrying OMDb with TMDb's title: "${tmdbTitle}"...`);
    const viaTmdbTitle = await lookupOMDbByTitle(tmdbTitle, year);
    if (viaTmdbTitle) return viaTmdbTitle;
  }

  // Diagnostic only: search with no year filter to see if OMDb has this
  // movie at all, and if so, under what year(s) — tells us whether this is
  // a year mismatch vs. genuinely missing from OMDb.
  const bareSearchUrl = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(tmdbTitle || title)}&type=movie`;
  const bareData = await omdbFetch(bareSearchUrl);
  if (bareData.Response === "True") {
    console.log(
      `  Still no match. OMDb has candidates:`,
      bareData.Search.map((m) => `${m.Title} (${m.Year})`).join(", ")
    );
  } else {
    console.log(`  Still no match. OMDb says: "${bareData.Error}"`);
  }

  return null;
}

const TMDB_API_KEY = process.env.TMDB_API;

// Loose title check for TMDb matches — normalizes away punctuation/articles
// and accepts either a substring match or majority word overlap, so
// "AVP: Alien vs. Predator" still matches TMDb's "Alien vs. Predator" but a
// same-year unrelated title won't slip through on year alone.
function titlesResemble(a, b) {
  const normalize = (t) =>
    t
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\b(the|a|an)\b/g, "")
      .replace(/\s+/g, " ")
      .trim();
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return false;
  if (na === nb || na.includes(nb) || nb.includes(na)) return true;
  const aWords = new Set(na.split(" ").filter((w) => w.length > 1));
  const bWords = new Set(nb.split(" ").filter((w) => w.length > 1));
  if (aWords.size === 0 || bWords.size === 0) return false;
  const shared = [...aWords].filter((w) => bWords.has(w)).length;
  return shared / Math.min(aWords.size, bWords.size) >= 0.6;
}

async function fetchFromTMDb(title, year) {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&year=${year}`;
  const res = await fetch(url);
  const data = await res.json();

  // Allow a 1-year buffer since TMDb's release_date sometimes reflects a
  // different country's release than the year in my sheet (e.g. a UK
  // release the year before the US release). `video: true` is TMDb's own
  // flag for bonus/making-of/featurette content bundled alongside a real
  // movie, and titlesResemble guards against grabbing a same-year, similarly
  // ranked but unrelated title.
  const match = data.results?.find((r) => {
    if (!r.release_date || r.video) return false;
    const releaseYear = Number(r.release_date.slice(0, 4));
    return Math.abs(releaseYear - year) <= 1 && titlesResemble(title, r.title);
  });

  return match ?? null;
}

// The search endpoint above only returns a summary (overview, poster,
// backdrop, vote_average). These two hit TMDb's fuller endpoints so we have
// somewhere to fall back to when OMDb is missing runtime/genre/country/
// boxOffice/cast/crew — but we only call them when OMDb actually came up
// short, to avoid doubling API calls for the common case.
async function fetchTMDbDetails(tmdbId) {
  const url = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}`;
  const res = await fetch(url);
  return res.json();
}

async function fetchTMDbCredits(tmdbId) {
  const url = `https://api.themoviedb.org/3/movie/${tmdbId}/credits?api_key=${TMDB_API_KEY}`;
  const res = await fetch(url);
  return res.json();
}

function needsTmdbDetails(omdb) {
  return (
    !cleanField(omdb.Plot) ||
    !cleanField(omdb.Poster) ||
    splitList(omdb.Genre).length === 0 ||
    !cleanField(omdb.Runtime) ||
    splitList(omdb.Country).length === 0 ||
    !cleanField(omdb.BoxOffice) ||
    !omdb.imdbID
  );
}

function needsTmdbCredits(omdb) {
  return splitList(omdb.Director).length === 0 || splitList(omdb.Actors).length === 0;
}

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w1280";

function cleanField(value) {
  return value && value !== "N/A" ? value : null;
}

function splitList(value) {
  const cleaned = cleanField(value);
  return cleaned ? cleaned.split(", ") : [];
}

function shapeMovie({ title, year }, omdb, tmdb, tmdbDetails, tmdbCredits) {
  const rottenTomatoes = omdb.Ratings?.find((r) => r.Source === "Rotten Tomatoes")?.Value ?? null;

  // OMDb is the primary source for all of this, but any field it comes back
  // with empty/N/A falls back to whatever TMDb has instead of being saved
  // as blank — the two sources rarely miss the same thing at once.
  const genre = splitList(omdb.Genre);
  const country = splitList(omdb.Country);
  const directors = splitList(omdb.Director);
  const actors = splitList(omdb.Actors);

  const tmdbGenre = tmdbDetails?.genres?.map((g) => g.name) ?? [];
  const tmdbCountry = tmdbDetails?.production_countries?.map((c) => c.name) ?? [];
  const tmdbDirectors =
    tmdbCredits?.crew?.filter((c) => c.job === "Director").map((c) => c.name) ?? [];
  const tmdbActors = tmdbCredits?.cast?.slice(0, 3).map((c) => c.name) ?? [];

  return {
    title,
    year,
    rated: cleanField(omdb.Rated),
    runtime: cleanField(omdb.Runtime) ? parseInt(omdb.Runtime, 10) : (tmdbDetails?.runtime ?? null),
    genre: genre.length ? genre : tmdbGenre,
    directors: directors.length ? directors : tmdbDirectors,
    actors: actors.length ? actors : tmdbActors,
    country: country.length ? country : tmdbCountry,
    boxOffice:
      cleanField(omdb.BoxOffice) ??
      (tmdbDetails?.revenue ? `$${tmdbDetails.revenue.toLocaleString("en-US")}` : null),
    awards: cleanField(omdb.Awards),
    ratings: {
      imdb: omdb.imdbRating && omdb.imdbRating !== "N/A" ? parseFloat(omdb.imdbRating) : null,
      rottenTomatoes,
    },
    poster:
      cleanField(omdb.Poster) ??
      (tmdb?.poster_path ? `${TMDB_IMAGE_BASE}${tmdb.poster_path}` : null),
    backdrop: tmdb?.backdrop_path ? `${TMDB_IMAGE_BASE}${tmdb.backdrop_path}` : null,
    plot: cleanField(omdb.Plot) ?? cleanField(tmdb?.overview) ?? null,
    imdbID: omdb.imdbID ?? tmdbDetails?.imdb_id ?? null,
  };
}

import fs from "fs";

const OUTPUT_PATH = "./src/data/movies.json";
const REPORT_PATH = "./scripts/movie-fetch-report.json";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadExisting(path) {
  if (!fs.existsSync(path)) return [];
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

// Case-sensitive dedup let the same movie in twice when the spreadsheet's
// title casing changed between runs (e.g. "ace ventura jr: pet detective"
// -> "Ace Ventura Jr: Pet Detective") — the new casing looked "new" even
// though it was already saved. Reusing normalizeTitle (already used for
// OMDb match-checking) here means dedup is case/whitespace-insensitive, so
// only a genuinely different title+year counts as a new movie.
function dedupeKey(title, year) {
  return `${normalizeTitle(title)}::${year}`;
}

// Guards against the spreadsheet itself having two rows for the same movie
// (differing only in title casing/whitespace) — without this, both rows
// would independently pass the existingKeys check and both get fetched.
function dedupeSheetRows(movies) {
  const seen = new Set();
  const deduped = [];
  for (const m of movies) {
    const key = dedupeKey(m.title, m.year);
    if (seen.has(key)) {
      console.log(`Skipping duplicate row in spreadsheet: "${m.title}" (${m.year})`);
      continue;
    }
    seen.add(key);
    deduped.push(m);
  }
  return deduped;
}

async function run() {
  const allMovies = dedupeSheetRows(loadMoviesFromSheet("./scripts/data/movie-data.xlsx"));
  const existing = loadExisting(OUTPUT_PATH);
  const existingKeys = new Set(existing.map((m) => dedupeKey(m.title, m.year)));

  const toFetch = allMovies.filter((m) => !existingKeys.has(dedupeKey(m.title, m.year)));

  // One-time migration: existing movies saved before we added `plot`/`imdbID`
  // won't have those fields at all, so re-look them up (OMDb only — we
  // already have their backdrop from TMDb) and merge the new fields in.
  const toBackfill = existing.filter((m) => m.plot === undefined);
  const alreadyBackfilled = existing.filter((m) => m.plot !== undefined);

  console.log(
    `${toFetch.length} new to fetch, ${toBackfill.length} existing to backfill with plot/imdbID`
  );

  const results = [...alreadyBackfilled];

  const toFetchKeys = new Set(toFetch.map((m) => dedupeKey(m.title, m.year)));
  const failures = loadExisting(REPORT_PATH).filter(
    (f) => !toFetchKeys.has(dedupeKey(f.title, f.year))
  );

  function saveProgress() {
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2));
    fs.writeFileSync(REPORT_PATH, JSON.stringify(failures, null, 2));
  }

  function stopForRateLimit(unprocessed) {
    results.push(...unprocessed);
    saveProgress();
    console.log(
      `\nHit OMDb's daily request limit. Stopping here — rerun this script later to continue.`
    );
  }

  for (const [i, movie] of toBackfill.entries()) {
    console.log(`[backfill ${i + 1}/${toBackfill.length}] ${movie.title} (${movie.year})`);

    let omdb, tmdb;
    try {
      omdb = await fetchFromOMDb(movie.title, movie.year);
      tmdb = await fetchFromTMDb(movie.title, movie.year);
    } catch (err) {
      if (err instanceof OMDbRateLimitError) {
        stopForRateLimit(toBackfill.slice(i));
        return;
      }
      throw err;
    }

    if (omdb) {
      results.push({
        ...movie,
        plot: cleanField(omdb.Plot) ?? cleanField(tmdb?.overview) ?? null,
        imdbID: omdb.imdbID ?? null,
      });
    } else {
      console.log(
        `  Could not re-match "${movie.title}" for backfill — falling back to TMDb for plot.`
      );
      results.push({ ...movie, plot: cleanField(tmdb?.overview) ?? null });
    }

    saveProgress();
    await delay(300);
  }

  for (const [i, movie] of toFetch.entries()) {
    console.log(`[${i + 1}/${toFetch.length}] ${movie.title} (${movie.year})`);

    let tmdb, omdb;
    try {
      tmdb = await fetchFromTMDb(movie.title, movie.year);
      omdb = await fetchFromOMDb(movie.title, movie.year, tmdb?.title);
    } catch (err) {
      if (err instanceof OMDbRateLimitError) {
        stopForRateLimit([]);
        return;
      }
      throw err;
    }

    if (!omdb || !tmdb) {
      failures.push({ title: movie.title, year: movie.year, omdbFailed: !omdb, tmdbFailed: !tmdb });
    } else {
      let tmdbDetails = null;
      let tmdbCredits = null;
      try {
        if (needsTmdbDetails(omdb)) tmdbDetails = await fetchTMDbDetails(tmdb.id);
        if (needsTmdbCredits(omdb)) tmdbCredits = await fetchTMDbCredits(tmdb.id);
      } catch {
        // TMDb fallback lookups are best-effort — if they fail, we still
        // have everything OMDb gave us, so don't let this sink the movie.
      }
      results.push(shapeMovie(movie, omdb, tmdb, tmdbDetails, tmdbCredits));
    }

    saveProgress();
    await delay(300);
  }

  console.log(`Done. ${results.length} movies saved. ${failures.length} failures logged.`);
}

run();
