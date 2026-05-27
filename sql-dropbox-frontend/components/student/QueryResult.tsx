"use client";

import { parseCsv } from "@/utils/parseCsv";

interface Props {
    result: any;
}

export default function QueryResult({ result }: Props) {
    if (!result) return null;

    if (result.type === "csv") {
        const { headers, rows } = parseCsv(result.data);

        return (
            <div className="mt-6 space-y-3">
                <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-2">
                        Result
                    </p>
                    <h2 className="font-display text-2xl font-bold text-ink">
                        Query Result
                    </h2>
                </div>

                <TableSheet headers={headers} rows={rows} />
            </div>
        );
    }

    const data = result.data;

    if (result.type === "json") {
        return (
            <div className="mt-6 space-y-4 border border-border bg-paper p-5 shadow-[0px_-3px_0px_0px_var(--color-border)]">
                <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-2">
                        Command status
                    </p>
                    <h2 className="font-display text-2xl font-bold text-ink">
                        {data.commandType} Successful
                    </h2>
                </div>

                {data.message && (
                    <p className="font-mono text-sm leading-6 text-muted">
                        {data.message}
                    </p>
                )}

                {data.tableName && (
                    <p className="font-mono text-sm text-muted">
                        <span className="text-ink">Table:</span> {data.tableName}
                    </p>
                )}

                {data.csvContent && (
                    <div className="space-y-3 pt-2">
                        <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                            Updated table
                        </h3>
                        <CsvTable csv={data.csvContent} />
                    </div>
                )}
            </div>
        );
    }

    return null;
}

function CsvTable({ csv }: { csv: string }) {
    const { headers, rows } = parseCsv(csv);

    return <TableSheet headers={headers} rows={rows} />;
}

function TableSheet({
    headers,
    rows,
}: {
    headers: string[];
    rows: string[][];
}) {
    return (
        <div className="overflow-auto border border-border bg-paper shadow-[0px_-3px_0px_0px_var(--color-border)]">
            <table className="min-w-full border-collapse font-mono text-sm text-ink">
                <thead className="bg-surface-2">
                    <tr>
                        {headers.map((header) => (
                            <th
                                key={header}
                                className="border-b border-r border-border px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] text-muted last:border-r-0"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} className="odd:bg-paper even:bg-surface-2/40">
                            {row.map((cell, j) => (
                                <td
                                    key={j}
                                    className="border-r border-t border-border px-4 py-3 align-top last:border-r-0"
                                >
                                    {cell || "—"}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}