export default function LecturerTableHead() {
    return (
        <thead>
            <tr className="border-b-2 border-border divide-x divide-border bg-surface-1">
                <th className="p-3 font-display text-ink whitespace-nowrap w-48">
                    SYS. ID
                </th>
                <th className="p-3 font-display text-ink whitespace-nowrap bg-surface-2">
                    INSTRUCTOR NAME
                </th>
                <th className="p-3 font-display text-ink whitespace-nowrap w-48">
                    ROLE
                </th>
                {/* NIEUWE TH VOOR DE VERWIJDERKNOP */}
                <th className="p-3 font-display text-ink whitespace-nowrap w-16 text-center">
                    ACTIONS
                </th>
            </tr>
        </thead>
    );
}