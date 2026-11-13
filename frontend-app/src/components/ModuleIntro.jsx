import { useLanguage } from "../context/LanguageContext";

function ModuleIntro({ eyebrow = "WORKSPACE", title, description }) {
    const { t } = useLanguage();

    return (
        <header className="module-intro">
            <span className="module-intro-eyebrow">{t(eyebrow)}</span>
            <h1>{t(title)}</h1>
            <p>{t(description)}</p>
        </header>
    );
}

export default ModuleIntro;
