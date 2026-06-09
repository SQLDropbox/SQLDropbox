import Header from "./header";

export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col bg-paper text-ink font-mono">
            <Header />

            <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-accent" />
                <p className="text-sm text-muted">Loading...</p>
            </div>
        </div>
    );
}
