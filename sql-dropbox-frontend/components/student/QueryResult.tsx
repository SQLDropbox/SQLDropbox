"use client";

import { parseCsv } from "@/utils/parseCsv";
import { useMemo } from "react";

interface Props {
    result: any;
    compact?: boolean;
}

export default function QueryResult({ result, compact = false }: Props) {
    if (!result) return null;

    if (result.type === "csv") {
        return <CsvResult data={result.data} compact={compact} />;
    }

    if (result.type === "json") {
        return <JsonResult data={result.data} compact={compact} />;
    }

    return null;
}

function CsvResult({ data, compact }: { data: string; compact: boolean }) {
    const parsed = useMemo(() => parseCsv(data), [data]);

    return (
        <TableSheet
            headers={parsed.headers}
            rows={parsed.rows}
            compact={compact}
        />
    );
}

function JsonResult({ data, compact }: { data: any; compact: boolean }) {
    const csvParsed = useMemo(
        () => (data.csvContent ? parseCsv(data.csvContent) : null),
        [data.csvContent],
    );

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

            {csvParsed && (
                <div className="space-y-3 pt-2">
                    <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                        Updated table
                    </h3>
                    <TableSheet
                        headers={csvParsed.headers}
                        rows={csvParsed.rows}
                        compact={compact}
                    />
                </div>
            )}
        </div>
    );
}

function TableSheet({
    headers,
    rows,
    compact,
}: {
    headers: string[];
    rows: string[][];
    compact: boolean;
}) {
    return (
        <div className="overflow-auto border border-border bg-paper shadow-[0px_-3px_0px_0px_var(--color-border)]">
            <table className="min-w-full border-collapse font-mono text-sm text-ink">
                <thead className="bg-surface-2">
                    <tr>
                        {headers.map((header, i) => (
                            <th
                                key={i}
                                className="border-b border-r border-border px-1 py-1.5 text-left text-[10px] uppercase tracking-[0.2em] text-muted last:border-r-0"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                {!compact && (
                    <tbody>
                        {rows.map((row, i) => (
                            <tr
                                key={i}
                                className="odd:bg-paper even:bg-surface-2/20"
                            >
                                {row.map((cell, j) => (
                                    <td
                                        key={j}
                                        className="border-r border-t border-border p-1 align-top last:border-r-0"
                                    >
                                        {cell || "—"}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                )}
            </table>
        </div>
    );
}
