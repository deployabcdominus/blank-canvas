import { cn } from "@/lib/utils";

function SkeletonPulse({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <SkeletonPulse className="h-9 w-9 rounded-lg" />
        <SkeletonPulse className="h-4 w-16 rounded-full" />
      </div>
      <SkeletonPulse className="h-8 w-24" />
      <SkeletonPulse className="h-4 w-32" />
    </div>
  );
}

export function ListCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <SkeletonPulse className="h-10 w-10 rounded-full flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <SkeletonPulse className="h-4 w-40" />
          <SkeletonPulse className="h-3 w-28" />
        </div>
        <SkeletonPulse className="h-6 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        <SkeletonPulse className="h-3 w-full" />
        <SkeletonPulse className="h-3 w-5/6" />
      </div>
      <div className="flex items-center justify-between pt-1">
        <SkeletonPulse className="h-3 w-20" />
        <div className="flex gap-2">
          <SkeletonPulse className="h-8 w-20 rounded-lg" />
          <SkeletonPulse className="h-8 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <SkeletonPulse className={cn("h-4", i === 0 ? "w-32" : i === cols - 1 ? "w-16" : "w-24")} />
        </td>
      ))}
    </tr>
  );
}

export function BriefingSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-3">
        <SkeletonPulse className="h-5 w-5 rounded" />
        <SkeletonPulse className="h-5 w-48" />
      </div>
      <div className="space-y-2">
        <SkeletonPulse className="h-4 w-full" />
        <SkeletonPulse className="h-4 w-11/12" />
        <SkeletonPulse className="h-4 w-4/5" />
      </div>
      <div className="space-y-2 pt-2">
        <SkeletonPulse className="h-5 w-36" />
        <SkeletonPulse className="h-4 w-full" />
        <SkeletonPulse className="h-4 w-10/12" />
      </div>
    </div>
  );
}

export function PageSkeleton({ statCount = 4, cardCount = 6 }: { statCount?: number; cardCount?: number }) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <SkeletonPulse className="h-7 w-48" />
        <SkeletonPulse className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: statCount }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: cardCount }).map((_, i) => (
          <ListCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function FullPageSpinnerSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-6 w-full max-w-4xl px-8">
        <div className="flex items-center justify-center gap-3">
          <SkeletonPulse className="h-10 w-10 rounded-xl" />
          <SkeletonPulse className="h-6 w-40" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ cols = 5, rows = 8 }: { cols?: number; rows?: number }) {
  return (
    <table className="w-full">
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRowSkeleton key={i} cols={cols} />
        ))}
      </tbody>
    </table>
  );
}

export { SkeletonPulse };
