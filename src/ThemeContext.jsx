import { createContext, useContext, useEffect, useState } from "react";

const translations = {
    ko: {
        title: "My Project Dashboard",
        subtitle: "지금까지 구축한 포트폴리오 리스트입니다.",
        darkMode: "🌙 다크 모드",
        lightMode: "☀️ 라이트 모드",
        langBtn: "🌐 English",

        todoTitle: "투두리스트",
        todoDesc: "일 체계적인 일정 관리와 할 일 목록 기록",
        exchangeTitle: "실시간 환율",
        exchangeDesc: "주요 15개국 실시간 환율 확인 및 금액 계산",
        movieTitle: "무비검색앱",
        movieDesc: "영화 데이터베이스 API를 활용한 영화 검색",

        todoHeading: "✅ 투두리스트 (자동 저장)",
        todoCount: (n) => `총 ${n}개의 할 일`,
        todoPlaceholder: "할 일을 입력하고 추가를 누르세요...",
        add: "추가",
        delete: "삭제",
        todoDefault1: "포트폴리오 메인 화면 구성하기",
        todoDefault2: "실시간 환율 API 연동 확인하기",

        rateHeading: "💱 실시간 환율 (USD 기준 · 주요 15개국)",
        rateBaseTime: "기준 시간",
        rateInputPlaceholder: "계산할 달러(USD) 금액 입력",
        rateUnitLabel: "달러 (USD) 기준",
        rateLoading: "실시간 환율을 불러오는 중...",
        rateErrorNoData: "환율 정보를 불러오지 못했습니다.",
        rateErrorNetwork: "네트워크 오류로 환율 정보를 가져오지 못했습니다.",

        movieHeading: "🎬 무비 & 시리즈 검색앱",
        movieHint: "영문 제목으로 검색해 보세요 (예: Avatar, Matrix, Love)",
        moviePlaceholder: "영화 또는 드라마 제목 입력...",
        search: "검색",
        searching: "검색 중...",
        rating: "평점",
        noInfo: "정보 없음",
    },
    en: {
        title: "My Project Dashboard",
        subtitle: "A list of the portfolio projects built so far.",
        darkMode: "🌙 Dark mode",
        lightMode: "☀️ Light mode",
        langBtn: "🌐 한국어",

        todoTitle: "To-Do List",
        todoDesc: "Organize your schedule and keep a task list",
        exchangeTitle: "Exchange Rates",
        exchangeDesc: "Live rates for 15 major currencies with a calculator",
        movieTitle: "Movie Search",
        movieDesc: "Search movies using a movie database API",

        todoHeading: "✅ To-Do List (auto-saved)",
        todoCount: (n) => `${n} task${n === 1 ? "" : "s"} in total`,
        todoPlaceholder: "Type a task and press Add...",
        add: "Add",
        delete: "Delete",
        todoDefault1: "Build the portfolio main screen",
        todoDefault2: "Check the live exchange rate API",

        rateHeading: "💱 Live Exchange Rates (USD base · 15 major countries)",
        rateBaseTime: "Updated",
        rateInputPlaceholder: "Enter an amount in US dollars (USD)",
        rateUnitLabel: "USD base",
        rateLoading: "Loading live exchange rates...",
        rateErrorNoData: "Could not load exchange rate data.",
        rateErrorNetwork: "Could not load exchange rates due to a network error.",

        movieHeading: "🎬 Movie & Series Search",
        movieHint: "Search by title (e.g. Avatar, Matrix, Love)",
        moviePlaceholder: "Enter a movie or series title...",
        search: "Search",
        searching: "Searching...",
        rating: "Rating",
        noInfo: "N/A",
    },
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    // 처음 열릴 때 localStorage에 저장된 테마가 있으면 불러오고, 없으면 'light'
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem("dashboard-theme");
        return saved === "dark" || saved === "light" ? saved : "light";
    });

    // 처음 열릴 때 저장된 언어가 있으면 불러오고, 없으면 'ko'
    const [lang, setLang] = useState(() => {
        const saved = localStorage.getItem("dashboard-lang");
        return saved === "en" || saved === "ko" ? saved : "ko";
    });

    useEffect(() => {
        localStorage.setItem("dashboard-theme", theme);
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem("dashboard-lang", lang);
    }, [lang]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    const toggleLang = () => {
        setLang((prev) => (prev === "ko" ? "en" : "ko"));
    };

    const t = translations[lang];

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, lang, toggleLang, t }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}