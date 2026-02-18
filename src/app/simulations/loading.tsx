export default function SimulationsLoading() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-6xl animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
        <div>
          <div className="h-10 bg-slate-200 rounded-lg w-64 mb-2" />
          <div className="h-5 bg-slate-100 rounded w-80" />
        </div>
        <div className="h-12 bg-slate-200 rounded-xl w-48" />
      </div>
      <div className="h-14 bg-slate-100 rounded-2xl mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
            <div className="h-5 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-100 rounded w-1/2" />
            <div className="h-px bg-slate-100" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-10 bg-slate-50 rounded-lg" />
              <div className="h-10 bg-slate-50 rounded-lg" />
            </div>
            <div className="flex justify-between pt-2">
              <div className="h-8 bg-slate-100 rounded w-20" />
              <div className="h-8 bg-slate-100 rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
