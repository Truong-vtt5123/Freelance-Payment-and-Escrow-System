
import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import { dictionary } from "./translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem("language") || "vi";
    });

    useEffect(() => {
        localStorage.setItem("language", language);
        document.documentElement.lang = language;
    }, [language]);

    const changeLanguage = (lang) => {
        if (lang === "vi" || lang === "en") {
            setLanguage(lang);
        }
    };

    const t = (key) => {
        return (
            dictionary[language]?.[key] ??
            dictionary.vi?.[key] ??
            key
        );
    };

    return (
        <LanguageContext.Provider
            value={{
                language,
                setLanguage: changeLanguage,
                changeLanguage,
                t
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);

    if (!context) {
        throw new Error(
            "useLanguage must be used inside LanguageProvider"
        );
    }

    return context;
}

export function LanguageTextSync() {
    const { language } = useLanguage();

    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    return null;
}
