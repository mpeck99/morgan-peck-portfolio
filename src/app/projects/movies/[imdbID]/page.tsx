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
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Stack from "@/components/layout/Stack/Stack";

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
  const breadcrumbs = [
    { path: "/", title: "Home" },
    { path: "/projects", title: "Projects" },
    { path: "/projects/movies", title: "Movies" },
    { path: `/projects/movies/${movie.imdbID}`, title: movie.title },
  ];

  return (
    <main className={styles["movie-page"]} style={{ backgroundImage: `url(${movie.backdrop})` }}>
      <Section>
        <Container>
          <Stack>
            <Breadcrumbs breadcrumbs={breadcrumbs} />
            <Grid>
              {movie.poster && <img src={movie.poster} alt="" className={styles["poster"]} />}
              <div className={styles["details"]}>
                <h1 className={styles["title"]}>{movie.title}</h1>
                <p className={styles["meta"]}>
                  {movie.year} · {movie.runtime} min · {movie.rated ?? "Not Rated"}
                </p>
                <ul className={styles["genres"]} aria-label="Genre">
                  {movie.genre.map((g) => (
                    <li key={g}>
                      <Badge solid>{g}</Badge>
                    </li>
                  ))}
                </ul>
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
                  <div className={styles["fact"]}>
                    <dt>Director</dt>
                    <dd>{movie.directors.join(", ") || "Unknown"}</dd>
                  </div>
                  <div className={styles["fact"]}>
                    <dt>Cast</dt>
                    <dd>{movie.actors.join(", ") || "Unknown"}</dd>
                  </div>
                  <div className={styles["fact"]}>
                    <dt>Country</dt>
                    <dd>{movie.country.join(", ") || "Unknown"}</dd>
                  </div>
                  <div className={styles["fact"]}>
                    <dt>Box Office</dt>
                    <dd>{movie.boxOffice ?? "Unknown"}</dd>
                  </div>
                  <div className={styles["fact"]}>
                    <dt>Awards</dt>
                    <dd>{movie.awards ?? "None listed"}</dd>
                  </div>
                </dl>
              </div>
            </Grid>
          </Stack>
        </Container>
      </Section>
    </main>
  );
}
