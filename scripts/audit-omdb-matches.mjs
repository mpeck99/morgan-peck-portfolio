// Retroactive audit for the "silent bad match" bug: before fetch-movies.mjs
// validated titles, a direct OMDb lookup could return Response: "True" for
// a junk/placeholder listing (podcast episodes, RiffTrax riffs, parody
// shorts) that happens to share a title+year, and the script would save it
// without complaint. This re-checks every existing entry's imdbID against
// OMDb's current data and flags anything that looks like a bad match —
// either because OMDb's own record for that ID is suspiciously empty, or
// because its title doesn't meaningfully resemble what we have saved.
//
// This does NOT auto-fix anything — it only writes a report. Bad matches
// need a human (or a follow-up conversation) to find the right replacement,
// the same way 300, 1917, Se7en, Kingsman, and Star Wars Episode II were
// fixed by hand.
//
// Run with: node scripts/audit-omdb-matches.mjs

import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const OMDB_API_KEY = process.env.OMDB_API;
const MOVIES_PATH = "./src/data/movies.json";
const REPORT_PATH = "./scripts/omdb-audit-report.json";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Strip punctuation/articles so "Kingsman: The Secret Service" and
// "kingsman the secret service" compare as equivalent, but a genuinely
// unrelated title still won't match.
function normalize(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\b(the|a|an)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function titlesResemble(savedTitle, omdbTitle) {
  const a = normalize(savedTitle);
  const b = normalize(omdbTitle);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;

  // Word-overlap fallback for reordered titles (e.g. "Ace Ventura Jr: Pet
  // Detective" vs "Ace Ventura: Pet Detective Jr.")
  const aWords = new Set(a.split(" ").filter((w) => w.length > 1));
  const bWords = new Set(b.split(" ").filter((w) => w.length > 1));
  if (aWords.size === 0 || bWords.size === 0) return false;
  const shared = [...aWords].filter((w) => bWords.has(w)).length;
  const overlap = shared / Math.min(aWords.size, bWords.size);
  return overlap >= 0.6;
}

// Genuine studio/theatrical releases almost never come back N/A for all of
// these at once — junk listings (podcast episodes, riffs, parody shorts,
// behind-the-scenes featurettes) very often do.
function sparseFieldCount(omdb) {
  const fields = [omdb.Genre, omdb.Director, omdb.Actors, omdb.Plot, omdb.Runtime];
  return fields.filter((f) => !f || f === "N/A").length;
}

// Same non-movie content patterns fetch-movies.mjs now rejects up front —
// applied here retroactively so existing entries get the same "pure
// movies" standard, not just newly fetched ones.
const JUNK_TITLE_PATTERN =
  /\b(episode\s*\d+|ep\.?\s*\d+|podcast|special event|featurette|making of|behind the scenes|commentary|bonus (disc|content|feature)|trailer|teaser|recap|fan (edit|film|made)|vlog|reaction)\b/i;

function isSuspiciousContent(omdb) {
  if (omdb.Type && omdb.Type !== "movie") return `wrong OMDb type ("${omdb.Type}")`;
  if (JUNK_TITLE_PATTERN.test(omdb.Title)) return "title matches non-movie pattern (episode/podcast/featurette/etc.)";
  if (cleanFieldLocal(omdb.Runtime)) {
    const minutes = parseInt(omdb.Runtime, 10);
    if (!Number.isNaN(minutes) && minutes < 40) return `runtime too short for a feature (${minutes} min)`;
  }
  return null;
}

function cleanFieldLocal(value) {
  return value && value !== "N/A" ? value : null;
}

async function run() {
  const movies = JSON.parse(fs.readFileSync(MOVIES_PATH, "utf8"));
  const toCheck = movies.filter((m) => m.imdbID);

  console.log(`Auditing ${toCheck.length} entries with an imdbID against OMDb...`);

  const flagged = [];
  let checked = 0;
  let errored = 0;

  for (const movie of toCheck) {
    checked++;

    let data;
    try {
      const url = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${movie.imdbID}`;
      const res = await fetch(url);
      data = await res.json();
    } catch (err) {
      errored++;
      console.log(`[${checked}/${toCheck.length}] ERROR fetching ${movie.title} (${movie.year}): ${err.message}`);
      await delay(250);
      continue;
    }

    if (data.Error === "Request limit reached!") {
      console.log(`\nHit OMDb's daily request limit at ${checked}/${toCheck.length}. Rerun later to finish — already-flagged entries are saved.`);
      break;
    }

    if (data.Response !== "True") {
      flagged.push({
        title: movie.title,
        year: movie.year,
        imdbID: movie.imdbID,
        reason: `OMDb no longer recognizes this imdbID (${data.Error})`,
      });
      console.log(`[${checked}/${toCheck.length}] FLAGGED (invalid imdbID): ${movie.title} (${movie.year})`);
    } else {
      const resembles = titlesResemble(movie.title, data.Title);
      const sparse = sparseFieldCount(data);
      const contentIssue = isSuspiciousContent(data);

      // Threshold of 3 (not 4) deliberately errs toward over-flagging: the
      // original "300" junk match had Genre/Director/Runtime empty but
      // Actors/Plot filled with RiffTrax joke content, so it only scored
      // 3/5 sparse. This is a review report, not an auto-fix — a few false
      // positives on genuinely obscure films are a fine trade for not
      // missing another partial-junk match like that one.
      if (!resembles || sparse >= 3 || contentIssue) {
        const reason = contentIssue ?? (!resembles ? "title mismatch" : "OMDb data too sparse to be a real match");
        flagged.push({
          title: movie.title,
          year: movie.year,
          imdbID: movie.imdbID,
          omdbTitle: data.Title,
          omdbYear: data.Year,
          reason,
          sparseFieldCount: sparse,
        });
        console.log(`[${checked}/${toCheck.length}] FLAGGED: "${movie.title}" (${movie.year}) -> OMDb has "${data.Title}" (${data.Year}) [${reason}]`);
      } else if (checked % 50 === 0) {
        console.log(`[${checked}/${toCheck.length}] checked, ${flagged.length} flagged so far...`);
      }
    }

    fs.writeFileSync(REPORT_PATH, JSON.stringify(flagged, null, 2) + "\n");
    await delay(250);
  }

  console.log(`\nDone. Checked ${checked}/${toCheck.length}. Flagged ${flagged.length} for review (errors: ${errored}).`);
  console.log(`Report written to ${REPORT_PATH}`);
}

run();
