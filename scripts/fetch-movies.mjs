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

async function lookupOMDbByTitle(title, year) {
  const url = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(title)}&y=${year}`;
  const data = await omdbFetch(url);
  return data.Response === "True" ? data : null;
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
  // wide release year your sheet has, so allow a small buffer — but require
  // an exact title match within that window so we don't grab a sequel
  // (e.g. "Open Water 2: Adrift") just because its year happens to be close.
  const withinTolerance = searchData.Search.filter((m) => Math.abs(Number(m.Year) - year) <= 2);
  const candidate = withinTolerance.find((m) => m.Title.toLowerCase() === title.toLowerCase());

  if (!candidate) {
    return null;
  }

  // The search endpoint only returns summary fields, so fetch full details by imdbID,
  // using the candidate's own year since it may differ from your sheet's year
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

async function fetchFromTMDb(title, year) {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&year=${year}`;
  const res = await fetch(url);
  const data = await res.json();

  // Allow a 1-year buffer since TMDb's release_date sometimes reflects a
  // different country's release than the year in your sheet (e.g. a UK
  // release the year before the US release).
  const match = data.results?.find((r) => {
    if (!r.release_date) return false;
    const releaseYear = Number(r.release_date.slice(0, 4));
    return Math.abs(releaseYear - year) <= 1;
  });

  return match ?? null;
}

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w1280";

function cleanField(value) {
  return value && value !== "N/A" ? value : null;
}

function splitList(value) {
  const cleaned = cleanField(value);
  return cleaned ? cleaned.split(", ") : [];
}

function shapeMovie({ title, year }, omdb, tmdb) {
  const rottenTomatoes = omdb.Ratings?.find((r) => r.Source === "Rotten Tomatoes")?.Value ?? null;

  return {
    title,
    year,
    rated: cleanField(omdb.Rated),
    runtime: cleanField(omdb.Runtime) ? parseInt(omdb.Runtime, 10) : null,
    genre: splitList(omdb.Genre),
    directors: splitList(omdb.Director),
    actors: splitList(omdb.Actors),
    country: splitList(omdb.Country),
    boxOffice: cleanField(omdb.BoxOffice),
    awards: cleanField(omdb.Awards),
    ratings: {
      imdb: omdb.imdbRating && omdb.imdbRating !== "N/A" ? parseFloat(omdb.imdbRating) : null,
      rottenTomatoes,
    },
    poster: cleanField(omdb.Poster),
    backdrop: tmdb?.backdrop_path ? `${TMDB_IMAGE_BASE}${tmdb.backdrop_path}` : null,
    plot: cleanField(omdb.Plot),
    imdbID: omdb.imdbID ?? null,
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

async function run() {
  const allMovies = loadMoviesFromSheet("./scripts/data/movie-data.xlsx");
  const existing = loadExisting(OUTPUT_PATH);
  const existingKeys = new Set(existing.map((m) => `${m.title}::${m.year}`));

  const toFetch = allMovies.filter((m) => !existingKeys.has(`${m.title}::${m.year}`));

  // One-time migration: existing movies saved before we added `plot`/`imdbID`
  // won't have those fields at all, so re-look them up (OMDb only — we
  // already have their backdrop from TMDb) and merge the new fields in.
  const toBackfill = existing.filter((m) => m.plot === undefined);
  const alreadyBackfilled = existing.filter((m) => m.plot !== undefined);

  console.log(
    `${toFetch.length} new to fetch, ${toBackfill.length} existing to backfill with plot/imdbID`
  );

  const results = [...alreadyBackfilled];

  const toFetchKeys = new Set(toFetch.map((m) => `${m.title}::${m.year}`));
  const failures = loadExisting(REPORT_PATH).filter(
    (f) => !toFetchKeys.has(`${f.title}::${f.year}`)
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

    let omdb;
    try {
      omdb = await fetchFromOMDb(movie.title, movie.year);
    } catch (err) {
      if (err instanceof OMDbRateLimitError) {
        stopForRateLimit(toBackfill.slice(i));
        return;
      }
      throw err;
    }

    if (omdb) {
      results.push({ ...movie, plot: cleanField(omdb.Plot), imdbID: omdb.imdbID ?? null });
    } else {
      console.log(`  Could not re-match "${movie.title}" for backfill — leaving without plot.`);
      results.push(movie);
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
      results.push(shapeMovie(movie, omdb, tmdb));
    }

    saveProgress();
    await delay(300);
  }

  console.log(`Done. ${results.length} movies saved. ${failures.length} failures logged.`);
}

run();
