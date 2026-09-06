import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-20 lg:px-8" role="status" aria-label="Loading page">
      <div className="animate-in fade-in space-y-6 duration-200">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-14 w-full max-w-2xl" />
        <Skeleton className="h-6 w-full max-w-xl" />
        <div className="grid gap-5 pt-8 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-72 rounded-xl" />)}
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </main>
  );
}
