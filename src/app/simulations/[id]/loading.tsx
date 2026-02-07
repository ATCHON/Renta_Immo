export default function SimulationDetailLoading() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-12 animate-pulse">
            <div className="flex items-center gap-2 mb-6">
                <div className="h-4 bg-slate-200 rounded w-32" />
                <div className="h-4 bg-slate-100 rounded w-4" />
                <div className="h-4 bg-slate-100 rounded w-28" />
            </div>
            <div className="h-10 bg-slate-200 rounded-lg w-72 mb-8" />
            <div className="bg-gradient-to-br from-slate-200 to-slate-300 rounded-3xl h-48 mb-8" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6">
                        <div className="h-3 bg-slate-200 rounded w-24 mb-4" />
                        <div className="h-8 bg-slate-100 rounded w-20" />
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl border border-slate-100 h-64" />
                <div className="bg-white rounded-2xl border border-slate-100 h-64" />
            </div>
        </div>
    );
}
