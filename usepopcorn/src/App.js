import { useState, useEffect, useRef } from "react";
import StarRating from "./Components/StarRating";
import { useMovie } from "./useMovie";
// const tempMovieData = [
//   {
//     imdbID: "tt1375666",
//     Title: "Inception",
//     Year: "2010",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//   },
//   {
//     imdbID: "tt0133093",
//     Title: "The Matrix",
//     Year: "1999",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
//   },
//   {
//     imdbID: "tt6751668",
//     Title: "Parasite",
//     Year: "2019",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
//   },
// ];

// const tempWatchedData = [
//   {
//     imdbID: "tt1375666",
//     Title: "Inception",
//     Year: "2010",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//     runtime: 148,
//     imdbRating: 8.8,
//     userRating: 10,
//   },
//   {
//     imdbID: "tt0088763",
//     Title: "Back to the Future",
//     Year: "1985",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
//     runtime: 116,
//     imdbRating: 8.5,
//     userRating: 9,
//   },
// ];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
export default function App() {
  const [query, setQuery] = useState("");
  const [selectId, setSelectId] = useState(null);
  const { movies, error, loadings } = useMovie(query);
  const [watched, setWatched] = useState(function () {
    const stored = localStorage.getItem("watched");
    return JSON.parse(stored);
  });
  const handleSelect = (id) => {
    setSelectId((selectId) => (selectId === id ? null : id));
  };
  const handleClose = () => {
    setSelectId();
  };
  const handleAddwatch = (movie) => {
    setWatched((watched) => [...watched, movie]);
  };
  const handleDelete = (id) => {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  };

  // Empty dependency array means this effect runs only once, similar to componentDidMount
  useEffect(() => {
    localStorage.setItem("watched", JSON.stringify(watched));
  }, [watched]);
  return (
    <>
      <Navbar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <Numresults movies={movies} />
      </Navbar>
      <Main>
        <Box>
          {loadings && <Loader />}
          {!loadings && !error && (
            <MovieList movies={movies} onSelect={handleSelect} />
          )}
          {error && <ErrorHandler message={error} />}
        </Box>
        <Box>
          {selectId ? (
            <MovieDetail
              selectId={selectId}
              onClose={handleClose}
              onAddWatched={handleAddwatch}
              watched={watched}
            />
          ) : (
            <>
              <WatchSummary watched={watched} />
              <WatchedList watched={watched} onDelete={handleDelete} />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
const Navbar = ({ children }) => {
  return <nav className="nav-bar">{children}</nav>;
};
const Logo = () => {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
};
const Search = ({ query, setQuery }) => {
  const inputEl = useRef(null);
  useEffect(() => {
    function callback(e) {
      if (document.activeElement === inputEl.current) return;
      if (e.code === "Enter") {
        inputEl.current.focus();
        setQuery("");
      }
    }
    document.addEventListener("keydown", callback);
    return () => {
      document.addEventListener("keydown", callback);
    };
  }, [setQuery]);

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
};
const Numresults = ({ movies }) => {
  return (
    <p className="num-results">
      Found <strong>{movies?.length ? movies.length : 0}</strong> results
    </p>
  );
};
const Main = ({ children }) => {
  return <main className="main">{children}</main>;
};
const Box = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
};
const MovieList = ({ movies, onSelect }) => {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelect={onSelect} />
      ))}
    </ul>
  );
};
const Movie = ({ movie, onSelect }) => {
  return (
    <li onClick={() => onSelect(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Tear}</span>
        </p>
      </div>
    </li>
  );
};
const MovieDetail = ({ selectId, onClose, onAddWatched, watched }) => {
  const [movie, setMovie] = useState({});
  const [userRating, setUserRating] = useState("");
  const isWatched = watched.map((movie) => movie.imdbID).includes(selectId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectId
  )?.userRating;
  useEffect(() => {
    async function getMovie() {
      try {
        const res = await fetch(
          `http://www.omdbapi.com/?i=${selectId}&plot=full&apikey=81e8cda8`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch movie data");
        }
        const data = await res.json();
        setMovie(data);
      } catch (error) {
        console.error("Error fetching movie:", error);
      }
    }
    getMovie();
  }, [selectId]);
  useEffect(
    function () {
      if (!movie.Title) return;
      document.title = `Movie | ${movie.Title}`;
      return function () {
        document.title = "usePopcorn";
      };
    },
    [movie.Title]
  );
  useEffect(() => {
    function callback(e) {
      if (e.code === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", callback);

    return () => {
      document.removeEventListener("keydown", callback);
    };
  }, [onClose]);

  function handleAdd() {
    const newWatchedMovie = {
      imdbRating: movie.imdbRating,
      title: movie.Title,
      year: movie.Year,
      poster: movie.Poster,
      ImdbRating: Number(movie.imdbRating),
      runtime: Number(movie.Runtime.split(" ")[0]),
      userRating: movie.UserRating,
    };
    onAddWatched(newWatchedMovie);
    onClose();
  }

  return (
    <div className="details">
      <header>
        <button className="btn-back" onClick={onClose}>
          &larr;
        </button>
        <img src={movie?.Poster} alt={`${movie?.Title} poster`} />
        <div className="details-overview">
          <h2>{movie.title}</h2>
          <p>
            {movie.Released}&bull; {movie.runtime} min
          </p>
          <p>{movie.Genre}</p>
          <p>
            <span>⭐</span>
            {movie.imdbRating} IMDb Rating
          </p>
        </div>
      </header>
      <section>
        <div className="rating">
          {!isWatched ? (
            <>
              <StarRating onSetUserRating={setUserRating} />
              {userRating > 0 && (
                <button className="btn-add" onClick={handleAdd}>
                  + Add to list
                </button>
              )}
            </>
          ) : (
            <p>You rated this movie {watchedUserRating}</p>
          )}
        </div>

        <p>
          <em>{movie.Plot}</em>
        </p>
        <p>Starring {movie.Actors}</p>
        <p>Directed By {movie.Director}</p>
      </section>
    </div>
  );
};
// const WatchBox = ({ movies }) => {
//   const [watched, setWatched] = useState(tempWatchedData);

//   const [isOpen2, setIsOpen2] = useState(true);

//   return (
//     <div className="box">
//       <button
//         className="btn-toggle"
//         onClick={() => setIsOpen2((open) => !open)}
//       >
//         {isOpen2 ? "–" : "+"}
//       </button>
//       {isOpen2 && (
//         <>
//           <WatchSummary watched={watched} />
//           <WatchedList watched={watched} />
//         </>
//       )}
//     </div>
//   );
// };
const WatchSummary = ({ watched }) => {
  const avgImdbRating =
    watched.length > 0 ? average(watched.map((movie) => movie?.imdbRating)) : 0;
  const avgUserRating =
    watched.length > 0 ? average(watched.map((movie) => movie?.userRating)) : 0;
  const avgRuntime =
    watched.length > 0 ? average(watched.map((movie) => movie?.runtime)) : 0;

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{isNaN(avgImdbRating) ? "N/A" : avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{isNaN(avgUserRating) ? "N/A" : avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{isNaN(avgRuntime) ? "N/A" : avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
};

const WatchedList = ({ watched, onDelete }) => {
  return (
    <ul className="list">
      {watched.map((movie, i) => (
        <WatchedMovie movie={movie} key={i} onDelete={onDelete} />
      ))}
    </ul>
  );
};
const WatchedMovie = ({ movie, onDelete }) => {
  return (
    <li>
      <img src={movie?.poster} alt={`${movie?.title} poster`} />
      <h3>{movie?.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie?.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie?.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie?.runtime} min</span>
        </p>
        <button className="btn-delete" onClick={() => onDelete(movie?.imdbID)}>
          X
        </button>
      </div>
    </li>
  );
};
const Loader = () => {
  return <p className="loader">Loading...</p>;
};
const ErrorHandler = ({ message }) => {
  return <p className="error">{message}</p>;
};
