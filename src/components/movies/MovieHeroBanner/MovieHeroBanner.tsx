"use client";

import { useEffect, useState } from "react";
import type { Movie } from "@/lib/movies";
import styles from "./MovieHeroBanner.module.scss";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import TomatoScore from "@/components/movies/TomatoScore/TomatoScore";
import { Star } from "lucide-react";

// IMDb's own brand yellow, so the filled star reads as "IMDb rating" the
// same way the tomato icon reads as "Rotten Tomatoes score."
const IMDB_GOLD = "#f5c518";

export default function MovieHeroBanner({ movies }: { movies: Movie[] }) {
  const [movie, setMovie] = useState<Movie | null>(null);

  useEffect(() => {
    const random = movies[Math.floor(Math.random() * movies.length)];
    setMovie(random);
  }, [movies]);

  if (!movie) {
    return <div className={styles["hero"]} aria-hidden="true" />;
  }

  return (
    <section className={styles["hero-banner"]}>
      <div className={styles["content"]}>
        {movie.genre[0] && <Badge solid>{movie.genre[0]}</Badge>}
        <h1 className={styles["title"]}>{movie.title}</h1>
        <p className={styles["meta"]}>
          <span>
            {movie.year} · {movie.runtime} min · {movie.genre[0]}
          </span>
          <span className={styles["ratings"]}>
            {movie.ratings.imdb != null && (
              <span className={styles["rating"]}>
                <Star size={24} fill={IMDB_GOLD} stroke={IMDB_GOLD} />
                {movie.ratings.imdb}
              </span>
            )}
            <TomatoScore score={movie.ratings.rottenTomatoes} />
          </span>
        </p>
        {movie.plot && <p>{movie.plot}</p>}
        {movie.imdbID && <Button href={`/projects/movies/${movie.imdbID}`}>View details</Button>}
      </div>
      {movie.backdrop && (
        <img src={movie.backdrop} alt="" aria-hidden="true" className={styles.backdrop} />
      )}
      <div className={styles["overlay"]}> </div>
    </section>
  );
}
