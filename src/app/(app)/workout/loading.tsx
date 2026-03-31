export default function WorkoutLoading() {
  return (
    <div className="p-6 pb-32 max-w-lg mx-auto space-y-4 animate-pulse">
      <div className="h-8 w-40 bg-[var(--color-gray-200)] rounded-2xl" />
      <div className="h-4 w-56 bg-[var(--color-gray-200)] rounded-xl" />

      <div className="space-y-3 mt-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-[var(--color-white)] rounded-3xl p-6 border-2 border-[var(--color-gray-100)] shadow-[0_4px_0_var(--color-theme-shadow)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div className="space-y-2 w-full">
              <div className="h-4 w-32 bg-[var(--color-gray-200)] rounded-xl" />
              <div className="h-3 w-24 bg-[var(--color-gray-200)] rounded-lg" />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="h-10 w-10 bg-[var(--color-gray-200)] rounded-2xl" />
              <div className="h-10 flex-1 bg-[var(--color-gray-200)] rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
