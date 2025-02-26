import { BarLoader } from "react-spinners";
import React, { useState, useEffect } from "react";
import Search from "./components/search";
import "./App.css";
import MovieCard from "./components/movieCard.jsx";
import { useDebounce } from "react-use";
import { updateSearchCount, getTrendingMovies } from "./appwrite.js";
const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [trendingMovies, setTrendingMovies] = useState([]);

  useDebounce( () => setDebouncedSearchTerm(searchTerm),500, [searchTerm])

  const fetchMovies = async (query="") => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const endpoint = query 
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        throw new Error("No movies found.");
      }

      setMovieList(data.results);
      if(query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }

    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage(
        error.message || "Failed to fetch movies. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    }
    catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className="patterns">
        <div className="wrapper">
          <header>
            <img src="./hero.png" alt="Hero Banner" />
            <h1>
              Find <span className="text-gradient">Movies</span> You'll Enjoy
              Without the Hassle
            </h1>
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </header>
          <section className="all-movies">
            {
              trendingMovies.length > 0 && (
                <section className="trending">
                  <h2>Trending Movies</h2>
                  <ul>
                    {trendingMovies.map((movie, index) => (
                      <li key={movie.$id}>
                        <p>{index + 1}</p>
                        <img src={movie.poster_url} alt="movie.title" />
                      </li>
                    ))}
                  </ul>
                </section>
              )
            }
            <h2 >All Movies</h2>
            {isLoading ? (
              <BarLoader className="align-center" color="#ffffff" />
            ) : errorMessage ? (
              <p className="text-center text-2xl text-red">{errorMessage}</p>
            ) : (
              <ul>
                {" "}
                {movieList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default App;
