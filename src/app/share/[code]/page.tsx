import { prisma } from "@/lib/prisma";
import ImportBlueprintButton from "@/components/ImportBlueprintButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";

interface BlueprintExercise {
  targetSets: number;
  targetReps: number;
  name?: string | null;
  source?: string | null;
}

export default async function ShareBlueprintPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const resolved = await params;
  const code = (resolved?.code || "").toUpperCase();
  const [blueprint, session] = await Promise.all([
    prisma.workoutBlueprint.findUnique({
      where: { code },
      include: {
        owner: { select: { username: true } },
      },
    }),
    getServerSession(authOptions),
  ]);

  if (!blueprint) return notFound();

  const data = blueprint.data as {
    name?: string;
    dayOfWeek?: number | null;
    exercises?: BlueprintExercise[];
  };

  const exercises = Array.isArray(data?.exercises) ? data.exercises : [];

  return (
    <div className="min-h-screen bg-[var(--color-gray-50)] flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[var(--color-white)] rounded-[32px] border-2 border-[var(--color-gray-100)] shadow-[0_8px_0_var(--color-theme-shadow)] p-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black text-[var(--color-slate-400)] uppercase tracking-wider mb-1">
              Shared Workout Blueprint
            </p>
            <h1 className="text-3xl font-black text-[var(--color-slate-800)]">
              {data?.name || "Workout"}
            </h1>
            <p className="text-[var(--color-slate-500)] font-medium">
              by {blueprint.owner.username || "Athlete"}
            </p>
          </div>
          <div className="px-3 py-2 rounded-2xl bg-[var(--color-indigo-50)] text-[var(--color-indigo-700)] font-black border border-[var(--color-indigo-200)] text-sm">
            Code: {code}
          </div>
        </div>

        <div className="bg-[var(--color-gray-50)] border-2 border-[var(--color-gray-100)] rounded-2xl p-4 space-y-3">
          <div className="flex justify-between text-sm font-bold text-[var(--color-slate-500)]">
            <span>{exercises.length} exercises</span>
            <span>Imports: {blueprint.imports}</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {exercises.slice(0, 6).map((ex, idx) => (
              <div
                key={`${ex.name || "ex"}-${idx}`}
                className="flex justify-between items-center p-3 rounded-xl bg-[var(--color-white)] border border-[var(--color-gray-200)]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[var(--color-indigo-400)] font-black text-xs w-4 text-right">
                    {idx + 1}.
                  </span>
                  <span className="font-bold text-[var(--color-slate-800)]">
                    {ex.name || "Exercise"}
                  </span>
                </div>
                <span className="text-[var(--color-slate-500)] font-black bg-[var(--color-gray-100)] px-2.5 py-1 rounded-lg border border-[var(--color-gray-200)]">
                  {ex.targetSets}x{ex.targetReps}
                </span>
              </div>
            ))}
            {exercises.length > 6 && (
              <p className="text-[var(--color-slate-500)] text-sm font-bold text-center">
                +{exercises.length - 6} more exercises
              </p>
            )}
          </div>
        </div>

        {session?.user ? (
          <ImportBlueprintButton code={code} />
        ) : (
          <div className="p-4 bg-[var(--color-gray-50)] border-2 border-[var(--color-gray-100)] rounded-2xl text-center space-y-3">
            <p className="font-bold text-[var(--color-slate-600)]">
              Log in to import this workout into your routines.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-4 py-3 rounded-2xl bg-[var(--color-indigo-500)] text-[var(--color-white)] font-black shadow-[0_4px_0_var(--color-button-shadow)]"
            >
              Go to Login
            </Link>
          </div>
        )}

        <div className="text-center text-[var(--color-slate-400)] text-xs font-bold">
          Share this link or the code above so friends can import instantly.
        </div>
      </div>
    </div>
  );
}
