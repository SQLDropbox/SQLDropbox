"use client";

import { parseCsv } from "@/utils/parseCsv";

interface Props {
    result: any;
}

export default function QueryResult({ result }: Props) {
    if (!result) return null;

    // SELECT QUERY RESULT
    if (result.type === "csv") {
        const { headers, rows } = parseCsv(result.data);

        return (
            <div className="mt-4">
                <h2 className="font-bold text-lg mb-2">
                    Query Result
                </h2>

                <div className="overflow-auto border rounded">
                    <table className="min-w-full border-collapse">
                        <thead className="bg-gray-100">
                            <tr>
                                {headers.map((header) => (
                                    <th
                                        key={header}
                                        className="border px-4 py-2 text-left"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {rows.map((row, i) => (
                                <tr key={i}>
                                    {row.map((cell, j) => (
                                        <td
                                            key={j}
                                            className="border px-4 py-2"
                                        >
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // INSERT / UPDATE / DELETE RESULT
    const data = result.data;

    if (result.type === "json") {
        return (
            <div className="mt-4 border rounded p-4 bg-green-50">
                <h2 className="font-bold text-lg mb-2">
                    {data.commandType} Successful
                </h2>

                {data.message && (
                    <p className="mb-2">{data.message}</p>
                )}

                {data.tableName && (
                    <p className="mb-2">
                        <strong>Table:</strong> {data.tableName}
                    </p>
                )}

                {data.csvContent && (
                    <>
                        <h3 className="font-semibold mt-4 mb-2">
                            Updated Table
                        </h3>

                        <CsvTable csv={data.csvContent} />
                    </>
                )}
            </div>
        );
    }

    return null;
}

function CsvTable({ csv }: { csv: string }) {
    const { headers, rows } = parseCsv(csv);

    return (
        <div className="overflow-auto border rounded">
            <table className="min-w-full border-collapse">
                <thead className="bg-gray-100">
                    <tr>
                        {headers.map((header) => (
                            <th
                                key={header}
                                className="border px-4 py-2 text-left"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i}>
                            {row.map((cell, j) => (
                                <td
                                    key={j}
                                    className="border px-4 py-2"
                                >
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}