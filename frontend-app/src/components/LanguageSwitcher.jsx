import { useLanguage } from "../context/LanguageContext";

function LanguageSwitcher() {
    const { language, setLanguage, t } = useLanguage();

    return (
        <div className="language-switcher" role="group" aria-label={t("Switch language")}>
            <button
                type="button"
                className={language === "en" ? "is-selected" : ""}
                onClick={() => setLanguage("en")}
                aria-pressed={language === "en"}
            >
                EN
            </button>
            <button
                type="button"
                className={language === "am" ? "is-selected" : ""}
                onClick={() => setLanguage("am")}
                aria-pressed={language === "am"}
            >
                አማ
            </button>
        </div>
    );
}

export default LanguageSwitcher;
