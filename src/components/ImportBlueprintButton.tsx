"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { importWorkoutBlueprint } from "@/app/actions/blueprint-actions";
import { DownloadCloud } from "lucide-react";

export default function ImportBlueprintButton({
  code,
  label = "Import to My Routines",
  onImported,
}: {
  code: string;
  label?: string;
  onImported?: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleImport = () => {
    startTransition(async () => {
      const res = await importWorkoutBlueprint(code);
      if (res?.success) {
        toast.success("Routine imported!");
        router.refresh();
        onImported?.();
      } else {
        toast.error(res?.error || "Failed to import routine");
      }
    });
  };

  return (
    <button
      onClick={handleImport}
      disabled={pending}
      className="w-full bg-[var(--color-indigo-500)] text-[var(--color-white)] font-bold py-3 px-4 rounded-2xl shadow-[0_4px_0_var(--color-button-shadow)] active:shadow-none active:translate-y-1 disabled:opacity-60 flex items-center justify-center gap-2"
    >
      {pending ? (
        <span>Importing...</span>
      ) : (
        <>
          <DownloadCloud size={18} />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
