// Amazon's CDN (m.media-amazon.com) is where OMDb hosts poster images, and
// those links quietly go dead over time even though OMDb's API still
// reports them as valid. This walks every movie in movies.json, HEAD-checks
// its poster URL, and swaps in a TMDb poster for anything that's broken.
// Run with: node scripts/check-posters.mjs

import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const TMDB_API_KEY = process.env.TMDB_API;
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w1280";

const MOVIES_PATH = "./src/data/movies.json";
const REPORT_PATH = "./scripts/broken-poster-report.json";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isPosterAlive(url) {
  try {
    // Some CDNs don't support HEAD properly, so fall back to a ranged GET
    // rather than downloading the whole image.
    let res = await fetch(url, { method: "HEAD" });
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, { headers: { Range: "bytes=0-0" } });
    }
    return res.ok;
  } catch {
    return false;
  }
}

async function findTmdbPoster(title, year) {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&year=${year}`;
  const res = await fetch(url);
  const data = await res.json();

  const match = data.results?.find((r) => {
    if (!r.release_date) return false;
    const releaseYear = Number(r.release_date.slice(0, 4));
    return Math.abs(releaseYear - year) <= 1;
  });

  return match?.poster_path ? `${TMDB_IMAGE_BASE}${match.poster_path}` : null;
}

async function run() {
  const movies = JSON.parse(fs.readFileSync(MOVIES_PATH, "utf8"));
  const toCheck = movies.filter((m) => m.poster && m.poster.includes("media-amazon.com"));

  console.log(`Checking ${toCheck.length} Amazon-hosted posters...`);

  let checked = 0;
  let broken = 0;
  let fixed = 0;
  const stillBroken = [];

  function saveProgress() {
    fs.writeFileSync(MOVIES_PATH, JSON.stringify(movies, null, 2) + "\n");
    fs.writeFileSync(REPORT_PATH, JSON.stringify(stillBroken, null, 2) + "\n");
  }

  for (const movie of toCheck) {
    checked++;
    const alive = await isPosterAlive(movie.poster);

    if (!alive) {
      broken++;
      console.log(`[${checked}/${toCheck.length}] BROKEN: ${movie.title} (${movie.year})`);

      const replacement = await findTmdbPoster(movie.title, movie.year);
      if (replacement) {
        movie.poster = replacement;
        fixed++;
        console.log(`  -> replaced with TMDb poster`);
      } else {
        movie.poster = null;
        stillBroken.push({ title: movie.title, year: movie.year });
        console.log(`  -> no TMDb poster found either, cleared to null`);
      }

      saveProgress();
    } else if (checked % 50 === 0) {
      console.log(`[${checked}/${toCheck.length}] checked, ${broken} broken so far...`);
    }

    await delay(150);
  }

  saveProgress();
  console.log(
    `\nDone. Checked ${checked}, found ${broken} broken, fixed ${fixed} with TMDb, ${stillBroken.length} left with no poster.`
  );
}

run();
