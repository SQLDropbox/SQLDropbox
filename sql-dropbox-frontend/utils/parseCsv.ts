export const parseCsv = (csv: string) => {
    const lines = csv.trim().split("\n");

    if (lines.length === 0) {
        return { headers: [], rows: [] };
    }

    const headers = lines[0]
        .split(",")
        .map(h => h.replace(/\r/g, "").trim());

    const rows = lines.slice(1).map(line =>
        line.split(",").map(cell => cell.replace(/\r/g, "").trim())
    );

    return { headers, rows };
};