function csvValue(value) {
    if (value === null || value === undefined) return "";

    let text = String(value);
    // eslint-disable-next-line no-control-regex
    if (typeof value === "string" && /^[\u0000-\u0020]*[=+\-@]/.test(text)) {
        text = `'${text}`;
    }

    return `"${text.replaceAll('"', '""')}"`;
}

function CsvExportButton({ filename, headers, rows, label }) {
    const exportCsv = () => {
        const content = [headers, ...rows]
            .map((row) => row.map(csvValue).join(","))
            .join("\r\n");
        const blob = new Blob([`\uFEFF${content}`], {
            type: "text/csv;charset=utf-8"
        });
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    };

    return (
        <button
            className="button button-secondary"
            type="button"
            onClick={exportCsv}
            disabled={rows.length === 0}
        >
            {label}
        </button>
    );
}

export default CsvExportButton;
