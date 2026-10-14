/**
 * Shown instantly on every admin navigation while the page's data loads —
 * without it the old screen just froze until the server finished, which is
 * what made every click feel slow.
 */
export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-[#1A14A5]/10" />
          <div className="h-4 w-72 rounded-lg bg-[#1A14A5]/5" />
        </div>
        <div className="h-10 w-32 rounded-xl bg-[#1A14A5]/10" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-white shadow-sm" />
        ))}
      </div>
      <div className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 rounded-lg bg-[#F4F7FE]" />
        ))}
      </div>
    </div>
  );
}
