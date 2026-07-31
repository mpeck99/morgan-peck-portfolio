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

function byTitle(a: Movie, b: Movie): number {
  return a.title.localeCompare(b.title, undefined, { sensitivity: "base", numeric: true });
}

export function getMoviesWithBackdrop(): Movie[] {
  return movies.filter((m) => m.backdrop != null).sort(byTitle);
}

export function getAllMovies(): Movie[] {
  return [...movies].sort(byTitle);
}

export function getMoviesByImdbID(imdbID: string): Movie | null {
  return movies.find((m) => m.imdbID === imdbID) ?? null;
}

export function getAllImdbIDs(): string[] {
  return movies.filter((m) => m.imdbID != null).map((m) => m.imdbID as string);
}
