import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type Board = {
  id: string;
  name: string;
  progress: number;
  members?: string[];
  _count: { issues: number };
};

export function BoardCard({
  board,
  orgSlug,
}: {
  board: Board;
  orgSlug: string;
}) {
  const progress = board.progress ?? 0;
  const members = board.members ?? [];

  return (
    <Link
      href={`/org/${orgSlug}/boards/${board.id}`}
      className="group relative flex flex-col rounded-xl border bg-card p-5 hover:bg-accent/30 transition overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--border)) 1px,transparent 1px),linear-gradient(90deg,hsl(var(--border)) 1px,transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-mono">
            {board.id.slice(0, 8)}
          </p>
          <h3 className="text-base font-semibold mt-0.5">{board.name}</h3>
        </div>
        <div className="size-8 shrink-0 rounded-md border grid place-items-center ml-3 group-hover:bg-foreground group-hover:text-background group-hover:border-foreground transition">
          <ArrowUpRight className="size-4" />
        </div>
      </div>

      <div className="relative mt-5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-mono">{progress}%</span>
        </div>
        <div className="h-1 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-foreground transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="relative mt-4 flex items-center justify-between">
        <div className="flex -space-x-2">
          {members.slice(0, 4).map((m, i) => (
            <div
              key={i}
              className="size-7 rounded-full bg-muted border-2 border-background grid place-items-center text-[9px] font-bold"
            >
              {m}
            </div>
          ))}
        </div>
        <span className="text-[11px] text-muted-foreground font-mono">
          {board._count.issues} tasks
        </span>
      </div>
    </Link>
  );
}
