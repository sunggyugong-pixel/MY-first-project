import { useEffect, useState } from "react";
import { ThemeProvider, useTheme } from "./ThemeContext";
import "./App.css";

// 주요 15개국 통화 목록 (한국 원화 KRW 첫 번째 배치)
const MAJOR_CURRENCIES = [
  { code: "KRW", name: { ko: "한국 (원)", en: "South Korea (Won)" }, iso: "kr" },
  { code: "USD", name: { ko: "미국 (달러)", en: "United States (Dollar)" }, iso: "us" },
  { code: "JPY", name: { ko: "일본 (엔)", en: "Japan (Yen)" }, iso: "jp" },
  { code: "EUR", name: { ko: "유럽연합 (유로)", en: "Eurozone (Euro)" }, iso: "eu" },
  { code: "CNY", name: { ko: "중국 (위안)", en: "China (Yuan)" }, iso: "cn" },
  { code: "VND", name: { ko: "베트남 (동)", en: "Vietnam (Dong)" }, iso: "vn" },
  { code: "GBP", name: { ko: "영국 (파운드)", en: "United Kingdom (Pound)" }, iso: "gb" },
  { code: "AUD", name: { ko: "호주 (달러)", en: "Australia (Dollar)" }, iso: "au" },
  { code: "CAD", name: { ko: "캐나다 (달러)", en: "Canada (Dollar)" }, iso: "ca" },
  { code: "CHF", name: { ko: "스위스 (프랑)", en: "Switzerland (Franc)" }, iso: "ch" },
  { code: "HKD", name: { ko: "홍콩 (달러)", en: "Hong Kong (Dollar)" }, iso: "hk" },
  { code: "SGD", name: { ko: "싱가포르 (달러)", en: "Singapore (Dollar)" }, iso: "sg" },
  { code: "THB", name: { ko: "태국 (바트)", en: "Thailand (Baht)" }, iso: "th" },
  { code: "PHP", name: { ko: "필리핀 (페소)", en: "Philippines (Peso)" }, iso: "ph" },
  { code: "TWD", name: { ko: "대만 (달러)", en: "Taiwan (Dollar)" }, iso: "tw" },
];

// 1. 투두리스트 컴포넌트
function TodoApp() {
  const { t } = useTheme();

  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem("dashboard-todos");
    return saved
        ? JSON.parse(saved)
        : [
          { id: 1, text: t.todoDefault1, done: true },
          { id: 2, text: t.todoDefault2, done: false },
        ];
  });
  const [input, setInput] = useState("");

  useEffect(() => {
    localStorage.setItem("dashboard-todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now(), text: input.trim(), done: false }]);
    setInput("");
  };

  const toggleTodo = (id) => {
    setTodos(
        todos.map((item) =>
            item.id === id ? { ...item, done: !item.done } : item
        )
    );
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((item) => item.id !== id));
  };

  return (
      <div>
        <div className="workspace-header">
          <h2>{t.todoHeading}</h2>
          <span className="header-subtitle">{t.todoCount(todos.length)}</span>
        </div>

        <form className="input-row" onSubmit={addTodo}>
          <input
              className="input-box"
              type="text"
              placeholder={t.todoPlaceholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
          />
          <button className="primary-btn" type="submit">
            {t.add}
          </button>
        </form>

        <ul className="todo-list">
          {todos.map((item) => (
              <li key={item.id} className="todo-item">
                <label className="todo-left">
                  <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => toggleTodo(item.id)}
                  />
                  <span className={item.done ? "todo-done" : ""}>{item.text}</span>
                </label>
                <button className="del-btn" onClick={() => deleteTodo(item.id)}>
                  {t.delete}
                </button>
              </li>
          ))}
        </ul>
      </div>
  );
}

// 2. 실시간 환율 (주요 15개국) 컴포넌트 - 달러(USD) 기준
function ExchangeRateApp() {
  const { t, lang } = useTheme();

  const [rates, setRates] = useState(null);
  const [usdAmount, setUsdAmount] = useState(100);
  const [updatedAt, setUpdatedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorKey, setErrorKey] = useState("");

  useEffect(() => {
    async function fetchRates() {
      try {
        setLoading(true);
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await res.json();
        if (data && data.rates) {
          setRates(data.rates);
          setUpdatedAt(data.time_last_update_utc?.slice(0, 16) || "-");
        } else {
          setErrorKey("noData");
        }
      } catch {
        setErrorKey("network");
      } finally {
        setLoading(false);
      }
    }
    fetchRates();
  }, []);

  const errorMessage =
      errorKey === "noData"
          ? t.rateErrorNoData
          : errorKey === "network"
              ? t.rateErrorNetwork
              : "";

  return (
      <div>
        <div className="workspace-header">
          <h2>{t.rateHeading}</h2>
          <span className="header-subtitle">
          {t.rateBaseTime}: {updatedAt}
        </span>
        </div>

        <div className="input-row">
          <input
              className="input-box"
              type="number"
              min="0"
              value={usdAmount}
              onChange={(e) => setUsdAmount(Number(e.target.value))}
              placeholder={t.rateInputPlaceholder}
          />
          <span style={{ alignSelf: "center", fontWeight: 600 }}>
          {t.rateUnitLabel}
        </span>
        </div>

        {loading && <p className="header-subtitle">{t.rateLoading}</p>}
        {errorMessage && <p style={{ color: "#ef4444" }}>{errorMessage}</p>}

        {rates && !loading && (
            <div className="rate-grid">
              {MAJOR_CURRENCIES.map((cur) => {
                const rate = rates[cur.code];
                const converted =
                    rate !== undefined
                        ? (usdAmount * rate).toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })
                        : "-";
                const oneUsdRate =
                    rate !== undefined
                        ? rate.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })
                        : "-";

                return (
                    <div key={cur.code} className="rate-item">
                      <div
                          className="rate-country"
                          style={{ display: "flex", alignItems: "center", gap: "8px" }}
                      >
                        <img
                            src={`https://flagcdn.com/w40/${cur.iso}.png`}
                            alt={cur.name[lang]}
                            style={{
                              width: "22px",
                              height: "15px",
                              objectFit: "cover",
                              borderRadius: "2px",
                            }}
                        />
                        <span>
                    {cur.name[lang]} ({cur.code})
                  </span>
                      </div>
                      <div className="rate-value">
                        {converted} {cur.code}
                      </div>
                      <div className="movie-meta" style={{ marginTop: "4px" }}>
                        1 USD = {oneUsdRate} {cur.code}
                      </div>
                    </div>
                );
              })}
            </div>
        )}
      </div>
  );
}

// 3-1. 영화 상세 팝업
function MovieModal({ movie, onClose, isFav, onToggleFav }) {
  const { t, lang } = useTheme();
  const apiLang = lang === "ko" ? "ko-KR" : "en-US";

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadDetail() {
      setLoading(true);
      try {
        const key = import.meta.env.VITE_TMDB_KEY;
        const res = await fetch(
            `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${key}&language=${apiLang}`
        );
        const data = await res.json();
        if (!cancelled) setDetail(data && data.id ? data : null);
      } catch {
        if (!cancelled) setDetail(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadDetail();
    return () => {
      cancelled = true;
    };
  }, [movie.id, apiLang]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const data = detail || movie;
  const posterPath = data.poster_path || movie.poster_path;

  return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose} aria-label={t.close}>
            ✕
          </button>

          <img
              className="modal-poster"
              src={
                posterPath
                    ? `https://image.tmdb.org/t/p/w500${posterPath}`
                    : "https://via.placeholder.com/300x450?text=No+Image"
              }
              alt={data.title}
          />

          <div className="modal-content">
            <h2 className="modal-title">{data.title}</h2>
            {detail?.tagline && <p className="modal-tagline">{detail.tagline}</p>}

            <div className="modal-meta">
            <span>
              ⭐ {data.vote_average ? data.vote_average.toFixed(1) : t.noInfo}
            </span>
              <span>{data.release_date || "-"}</span>
              {detail?.runtime ? <span>{t.minutes(detail.runtime)}</span> : null}
            </div>

            {loading && <p className="header-subtitle">{t.detailLoading}</p>}

            {!loading && !detail && (
                <p style={{ color: "#ef4444" }}>{t.detailError}</p>
            )}

            {detail?.genres?.length > 0 && (
                <div className="modal-genres">
                  {detail.genres.map((g) => (
                      <span key={g.id} className="genre-chip">
                  {g.name}
                </span>
                  ))}
                </div>
            )}

            {detail && (
                <div className="modal-section">
                  <h3>{t.overview}</h3>
                  <p>{detail.overview || t.noOverview}</p>
                </div>
            )}

            <button
                className={`fav-big-btn ${isFav ? "on" : ""}`}
                onClick={() => onToggleFav(movie)}
            >
              {isFav ? `♥ ${t.favRemove}` : `♡ ${t.favAdd}`}
            </button>
          </div>
        </div>
      </div>
  );
}

// 3. 무비검색앱 컴포넌트 (검색한 영화 + ♥ 찜한 영화 바구니 전환)
function MovieSearchApp() {
  const { t, lang } = useTheme();

  const [query, setQuery] = useState("");
  const [searchedKeyword, setSearchedKeyword] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [viewMode, setViewMode] = useState("search"); // 'search' | 'favorites'

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("dashboard-favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("dashboard-favorites", JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = (id) => favorites.some((m) => m.id === id);

  const toggleFavorite = (movie) => {
    if (isFavorite(movie.id)) {
      setFavorites(favorites.filter((m) => m.id !== movie.id));
    } else {
      setFavorites([
        ...favorites,
        {
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          vote_average: movie.vote_average,
          release_date: movie.release_date,
        },
      ]);
    }
  };

  const apiLang = lang === "ko" ? "ko-KR" : "en-US";

  const searchMovies = async (keyword) => {
    const trimmed = keyword.trim();
    if (!trimmed) {
      setSearchedKeyword("");
      setMovies([]);
      return;
    }

    setViewMode("search");
    setSearchedKeyword(trimmed);
    setLoading(true);
    try {
      const key = import.meta.env.VITE_TMDB_KEY;
      const url = `https://api.themoviedb.org/3/search/movie?api_key=${key}&language=${apiLang}&query=${encodeURIComponent(
          trimmed
      )}`;
      const res = await fetch(url);
      const data = await res.json();
      setMovies(data.results || []);
    } catch {
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchedKeyword) {
      searchMovies(searchedKeyword);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const handleSubmit = (e) => {
    e.preventDefault();
    searchMovies(query);
  };

  const displayMovies = viewMode === "favorites" ? favorites : movies;

  return (
      <div>
        <div className="workspace-header">
          <h2>{t.movieHeading}</h2>
          <span className="header-subtitle">{t.movieHint}</span>
        </div>

        {/* 검색 결과 / 찜한 영화 바구니 전환 버튼 */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <button
              type="button"
              className="theme-btn"
              style={
                viewMode === "search"
                    ? { backgroundColor: "var(--accent)", color: "#ffffff", borderColor: "var(--accent)" }
                    : {}
              }
              onClick={() => setViewMode("search")}
          >
            {t.tabSearch}
          </button>

          <button
              type="button"
              className="theme-btn"
              style={
                viewMode === "favorites"
                    ? { backgroundColor: "#ef4444", color: "#ffffff", borderColor: "#ef4444" }
                    : {}
              }
              onClick={() => setViewMode("favorites")}
          >
            {t.tabFavorites(favorites.length)}
          </button>
        </div>

        {viewMode === "search" && (
            <form className="input-row" onSubmit={handleSubmit}>
              <input
                  className="input-box"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.moviePlaceholder}
              />
              <button className="primary-btn" type="submit">
                {t.search}.
              </button>
            </form>
        )}

        {viewMode === "search" && !searchedKeyword && !loading && (
            <p className="header-subtitle">{t.movieEmptyGuide}</p>
        )}

        {viewMode === "search" && loading && (
            <p className="header-subtitle">{t.searching}</p>
        )}

        {viewMode === "search" && !loading && searchedKeyword && movies.length === 0 && (
            <p className="header-subtitle">{t.movieNoResult}</p>
        )}

        {viewMode === "favorites" && favorites.length === 0 && (
            <p className="header-subtitle">{t.favEmptyGuide}</p>
        )}

        {!(viewMode === "search" && loading) && displayMovies.length > 0 && (
            <div className="movie-grid">
              {displayMovies.map((movie) => {
                const fav = isFavorite(movie.id);
                return (
                    <div
                        key={movie.id}
                        className="movie-card clickable"
                        onClick={() => setSelectedMovie(movie)}
                    >
                      <div className="poster-wrap">
                        <img
                            className="movie-poster"
                            src={
                              movie.poster_path
                                  ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
                                  : "https://via.placeholder.com/210x295?text=No+Image"
                            }
                            alt={movie.title}
                        />
                        <button
                            type="button"
                            className={`heart-btn ${fav ? "on" : ""}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(movie);
                            }}
                            aria-label={fav ? t.favRemove : t.favAdd}
                        >
                          {fav ? "♥" : "♡"}
                        </button>
                      </div>
                      <div className="movie-info">
                        <div className="movie-title">{movie.title}</div>
                        <div className="movie-meta">
                          {t.rating}: ⭐{" "}
                          {movie.vote_average ? movie.vote_average.toFixed(1) : t.noInfo} ·{" "}
                          {movie.release_date?.slice(0, 4) || "-"}
                        </div>
                      </div>
                    </div>
                );
              })}
            </div>
        )}

        {selectedMovie && (
            <MovieModal
                movie={selectedMovie}
                onClose={() => setSelectedMovie(null)}
                isFav={isFavorite(selectedMovie.id)}
                onToggleFav={toggleFavorite}
            />
        )}
      </div>
  );
}

// 대시보드 본문 (ThemeContext 사용)
function DashboardContent() {
  const { theme, toggleTheme, toggleLang, t } = useTheme();
  const [activeTab, setActiveTab] = useState("todo");

  return (
      <div className="container">
        <header className="header-card">
          <div className="header-text">
            <h1 className="header-title">{t.title}</h1>
            <p className="header-subtitle">{t.subtitle}</p>
          </div>

          <div className="header-buttons">
            <button className="theme-btn" onClick={toggleLang}>
              {t.langBtn}
            </button>
            <button className="theme-btn" onClick={toggleTheme}>
              {theme === "light" ? t.darkMode : t.lightMode}
            </button>
          </div>
        </header>

        <section className="card-grid">
          <div
              className={`nav-card ${activeTab === "todo" ? "active" : ""}`}
              onClick={() => setActiveTab("todo")}
          >
            <div className="icon-badge">✓</div>
            <div className="card-title">{t.todoTitle}</div>
            <div className="card-desc">{t.todoDesc}</div>
          </div>

          <div
              className={`nav-card ${activeTab === "exchange" ? "active" : ""}`}
              onClick={() => setActiveTab("exchange")}
          >
            <div className="icon-badge round">₩</div>
            <div className="card-title">{t.exchangeTitle}</div>
            <div className="card-desc">{t.exchangeDesc}</div>
          </div>

          <div
              className={`nav-card ${activeTab === "movie" ? "active" : ""}`}
              onClick={() => setActiveTab("movie")}
          >
            <div className="icon-badge">🎞</div>
            <div className="card-title">{t.movieTitle}</div>
            <div className="card-desc">{t.movieDesc}</div>
          </div>
        </section>

        <main className="workspace-card">
          {activeTab === "todo" && <TodoApp />}
          {activeTab === "exchange" && <ExchangeRateApp />}
          {activeTab === "movie" && <MovieSearchApp />}
        </main>
      </div>
  );
}

export default function App() {
  return (
      <ThemeProvider>
        <DashboardContent />
      </ThemeProvider>
  );
}