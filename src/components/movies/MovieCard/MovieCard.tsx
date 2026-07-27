import Link from "next/link";
import { Film } from "lucide-react";
import type { Movie } from "@/lib/movies";
import styles from "./MovieCard.module.scss";
import { Card } from "@/components/ui";

type MovieCardProps = {
  movie: Movie;
};

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link href={`/projects/movies/${movie.imdbID}`} className={styles["card--movie"]}>
      <Card className={styles["card"]}>
        {movie.poster ? (
          <img src={movie.poster} alt="" className={styles["poster"]} />
        ) : (
          <div className={styles["poster-fallback"]} aria-hidden="true">
            <Film className={styles["poster-fallback-icon"]} strokeWidth={1.5} />
            <span className={styles["poster-fallback-text"]}>Movie poster not found</span>
          </div>
        )}
        <h3 className={styles["title"]}>{movie.title}</h3>
        <p className={styles["meta"]}>
          {movie.year} · {movie.runtime} min · {movie.genre[0]}
        </p>
      </Card>
    </Link>
  );
}
