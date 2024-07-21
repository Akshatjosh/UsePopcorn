import { useState, useEffect } from "react";
export function useMovie(query) {
  const [loadings, setLoadings] = useState(false);
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    const fetching = async () => {
      try {
        setLoadings(true);
        setError("");
        const res = await fetch(
          `http://www.omdbapi.com/?i=tt3896198&apikey=81e8cda8&s=${query}`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch");
        }

        const data = await res.json();
        console.log(data);
        if (data.Response === "False") {
          throw new Error("Movies not found");
        }
        setMovies(data.Search);
        setError("");
      } catch (error) {
        console.error(error.message);
        setError(error.message);
        if (error.name !== "AbortError") {
          setError(error.name);
        }
      } finally {
        setLoadings(false);
      }
    };

    fetching();
    // Call the fetching function inside useEffect
    return function () {
      controller.abort();
    };
  }, [query]);
  return { movies, error, loadings };
}
