"use client";

import { useEffect, useState } from "react";
import type { Movie } from "@/lib/movies";
import styles from "./MovieHeroBanner.module.scss";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

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
          {movie.year} · {movie.runtime} min · {movie.genre[0]} · IMDb {movie.ratings.imdb}
        </p>
        {movie.plot && <p>{movie.plot}</p>}
        <Button href={`/projects/movies/${movie.title}`}>View details</Button>
      </div>
      {movie.backdrop && (
        <img src={movie.backdrop} alt="" aria-hidden="true" className={styles.backdrop} />
      )}
      <div className={styles["overlay"]}> </div>
    </section>
  );
}
