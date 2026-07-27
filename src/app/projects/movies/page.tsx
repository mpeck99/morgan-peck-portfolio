import { getAllMovies, getMoviesWithBackdrop } from "@/lib/movies";
import MovieHeroBanner from "@/components/movies/MovieHeroBanner/MovieHeroBanner";
import MovieCard from "@/components/movies/MovieCard/MovieCard";
import styles from "./page.module.scss";

export default function MoviesHomePage() {
  const moviesWithBackdrop = getMoviesWithBackdrop();
  const allMovies = getAllMovies();

  return (
    <main>
      <MovieHeroBanner movies={moviesWithBackdrop} />
      <div className={styles["movie-grid"]}>
        {allMovies.map((movie) => (
          <MovieCard key={movie.year + movie.title} movie={movie} />
        ))}
      </div>
    </main>
  );
}
