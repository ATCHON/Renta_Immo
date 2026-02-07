export default function CalculateurLoading() {
    return (
        <div className="max-w-2xl mx-auto px-4 py-12 animate-pulse">
            <div className="h-5 bg-slate-200 rounded w-32 mb-8" />
            <div className="space-y-6">
                <div className="h-8 bg-slate-200 rounded-lg w-72 mb-2" />
                <div className="h-4 bg-slate-100 rounded w-56 mb-8" />
                <div className="bg-white rounded-2xl border border-slate-100 p-8 space-y-6">
                    <div className="h-5 bg-slate-200 rounded w-40" />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-12 bg-slate-100 rounded-xl" />
                        <div className="h-12 bg-slate-100 rounded-xl" />
                    </div>
                    <div className="h-12 bg-slate-100 rounded-xl" />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-12 bg-slate-100 rounded-xl" />
                        <div className="h-12 bg-slate-100 rounded-xl" />
                    </div>
                </div>
                <div className="flex justify-between pt-4">
                    <div className="h-10 bg-slate-100 rounded-xl w-24" />
                    <div className="h-10 bg-slate-200 rounded-xl w-32" />
                </div>
            </div>
        </div>
    );
}
