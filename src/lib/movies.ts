import moviesData from "@/data/movies.json";

export type Movie = {
  title: string;
  year: number;
  rated: string | null;
  runtime: number | null;
  genre: string[];
  directors: string[];
  actors: string[];
  country: string[];
  boxOffice: string | null;
  awards: string | null;
  ratings: {
    imdb: number | null;
    rottenTomatoes: string | null;
  };
  poster: string | null;
  backdrop: string | null;
  plot: string | null;
  imdbID: string | null;
};

const movies = moviesData as Movie[];

export function getMoviesWithBackdrop(): Movie[] {
  return movies.filter((m) => m.backdrop != null);
}

export function getAllMovies(): Movie[] {
  return movies;
}
