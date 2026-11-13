const iconContent = {
    dashboard: (
        <>
            <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
            <rect x="13.5" y="3.5" width="7" height="4" rx="1.5" />
            <rect x="13.5" y="10.5" width="7" height="10" rx="1.5" />
            <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
        </>
    ),
    companies: (
        <>
            <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" />
            <path d="M8 9h1m-1 4h1m-1 4h1m7-3h1m-1 4h1" />
        </>
    ),
    invoices: (
        <>
            <path d="M7 3.75h7l5 5V20a1.25 1.25 0 0 1-1.25 1.25h-10A1.25 1.25 0 0 1 6.5 20V5A1.25 1.25 0 0 1 7.75 3.75Z" />
            <path d="M14 4v5h5M9 14h6m-6 3h6" />
        </>
    ),
    credit: (
        <>
            <path d="M4 19.5V12m5 7.5V5m5 14.5v-10m5 10V8" />
            <path d="M2.5 21h19" />
        </>
    ),
    factoring: (
        <>
            <path d="M7 8.5 12 5l5 3.5M7 15.5 12 19l5-3.5" />
            <path d="M4 12h16M7 8.5v7m10-7v7" />
            <circle cx="4" cy="12" r="2" />
            <circle cx="20" cy="12" r="2" />
        </>
    ),
    payments: (
        <>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 10h18m-13 5h4" />
        </>
    ),
    audit: (
        <>
            <path d="M12 3 5 6v5c0 4.5 2.9 8.5 7 10 4.1-1.5 7-5.5 7-10V6l-7-3Z" />
            <path d="m9 12 2 2 4-4" />
        </>
    ),
    key: (
        <>
            <circle cx="8" cy="15" r="4" />
            <path d="m11 12 8-8 2 2-2 2 2 2-3 3-2-2-2 2" />
        </>
    ),
    sun: (
        <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
        </>
    ),
    moon: <path d="M20.8 14.3A8.5 8.5 0 0 1 9.7 3.2 8.5 8.5 0 1 0 20.8 14.3Z" />,
    logout: (
        <>
            <path d="M10 17l5-5-5-5m5 5H3" />
            <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
        </>
    ),
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    chart: (
        <>
            <path d="M3 3v18h18" />
            <path d="m7 14 4-4 4 3 6-7" />
        </>
    ),
    spark: (
        <>
            <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" />
            <path d="m19 14 1.1 2.9L23 18l-2.9 1.1L19 22l-1.1-2.9L15 18l2.9-1.1L19 14Z" />
        </>
    )
};

function AppIcon({ name, className = "" }) {
    return (
        <svg
            aria-hidden="true"
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {iconContent[name] || iconContent.spark}
        </svg>
    );
}

export default AppIcon;
