import { useEffect, useState } from "react";
import { ThemeProvider, useTheme } from "./ThemeContext";
import "./App.css";

// 주요 15개국 통화 목록 (이름은 한국어/영어 둘 다)
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
  { code: "MYR", name: { ko: "말레이시아 (링깃)", en: "Malaysia (Ringgit)" }, iso: "my" },
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
  const [errorKey, setErrorKey] = useState(""); // "noData" | "network" | ""

  useEffect(() => {
    async function fetchRates() {
      try {
        setLoading(true);
        // API 키 없이 실시간 달러(USD) 기준 환율 제공
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

// 3. 무비검색앱 컴포넌트
function MovieSearchApp() {
  const { t } = useTheme();

  const [query, setQuery] = useState("Batman");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchMovies = async (keyword) => {
    if (!keyword.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
          `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(keyword)}`
      );
      const data = await res.json();
      setMovies(data);
    } catch {
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchMovies("Batman");
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    searchMovies(query);
  };

  return (
      <div>
        <div className="workspace-header">
          <h2>{t.movieHeading}</h2>
          <span className="header-subtitle">{t.movieHint}</span>
        </div>

        <form className="input-row" onSubmit={handleSubmit}>
          <input
              className="input-box"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.moviePlaceholder}
          />
          <button className="primary-btn" type="submit">
            {t.search}
          </button>
        </form>

        {loading && <p className="header-subtitle">{t.searching}</p>}

        {!loading && (
            <div className="movie-grid">
              {movies.map(({ show }) => (
                  <div key={show.id} className="movie-card">
                    <img
                        className="movie-poster"
                        src={
                            show.image?.medium ||
                            "https://via.placeholder.com/210x295?text=No+Image"
                        }
                        alt={show.name}
                    />
                    <div className="movie-info">
                      <div className="movie-title">{show.name}</div>
                      <div className="movie-meta">
                        {t.rating}: ⭐ {show.rating?.average ?? t.noInfo} ·{" "}
                        {show.premiered?.slice(0, 4) || "-"}
                      </div>
                    </div>
                  </div>
              ))}
            </div>
        )}
      </div>
  );
}

// 대시보드 본문 (ThemeContext 사용)
function DashboardContent() {
  const { theme, toggleTheme, toggleLang, t } = useTheme();
  const [activeTab, setActiveTab] = useState("todo"); // 'todo' | 'exchange' | 'movie'

  return (
      <div className="container">
        {/* 1. 상단 고정 헤더 + 언어/다크모드 버튼 */}
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

        {/* 2. 중단 3개 프로젝트 선택 카드 */}
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

        {/* 3. 선택된 기능 활성화 영역 */}
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