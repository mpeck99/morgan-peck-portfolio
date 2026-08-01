import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllImdbIDs, getMoviesByImdbID } from "@/lib/movies";
import TomatoScore from "@/components/movies/TomatoScore/TomatoScore";
import Badge from "@/components/ui/Badge";
import styles from "./page.module.scss";
import Grid from "@/components/layout/Grid/Grid";
import Section from "@/components/layout/Section/Section";
import Container from "@/components/layout/Container/Container";
import { Star } from "lucide-react";

// IMDb's own brand yellow — same constant MovieHeroBanner uses, so the
// star reads consistently as "IMDb rating" everywhere it shows up.
const IMDB_GOLD = "#f5c518";

type MoviePageProps = {
  params: Promise<{ imdbID: string }>;
};

export function generateStaticParams() {
  return getAllImdbIDs().map((imdbID) => ({ imdbID }));
}

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const { imdbID } = await params;
  const movie = getMoviesByImdbID(imdbID);

  if (!movie) return {};

  return {
    title: `${movie.title} | Movies | Morgan Peck`,
    description: movie.plot ?? undefined,
  };
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { imdbID } = await params;
  const movie = getMoviesByImdbID(imdbID);

  if (!movie) {
    notFound();
  }

  return (
    <main className={styles["movie-page"]} style={{ backgroundImage: `url(${movie.backdrop})` }}>
      <Section>
        <Container>
          <Grid>
            {movie.poster && <img src={movie.poster} alt="" className={styles["poster"]} />}
            <div className={styles["details"]}>
              <h1 className={styles["title"]}>{movie.title}</h1>
              <p className={styles["meta"]}>
                {movie.year} · {movie.runtime} min · {movie.rated ?? "Not Rated"}
              </p>
              <div className={styles["genres"]}>
                {movie.genre.map((g) => (
                  <Badge key={g}>{g}</Badge>
                ))}
              </div>
              <div className={styles["ratings"]}>
                {movie.ratings.imdb != null && (
                  <span className={styles["rating"]}>
                    <Star size={24} fill={IMDB_GOLD} stroke={IMDB_GOLD} />
                    {movie.ratings.imdb}
                  </span>
                )}
                <TomatoScore score={movie.ratings.rottenTomatoes} />
              </div>
              {movie.plot && <p className={styles["plot"]}>{movie.plot}</p>}
              <dl className={styles["facts"]}>
                <dt>Director</dt>
                <dd>{movie.directors.join(", ") || "Unknown"}</dd>
                <dt>Cast</dt>
                <dd>{movie.actors.join(", ") || "Unknown"}</dd>
                <dt>Country</dt>
                <dd>{movie.country.join(", ") || "Unknown"}</dd>
                <dt>Box Office</dt>
                <dd>{movie.boxOffice ?? "Unknown"}</dd>
                <dt>Awards</dt>
                <dd>{movie.awards ?? "None listed"}</dd>
              </dl>
            </div>
          </Grid>
        </Container>
      </Section>
    </main>
  );
}
