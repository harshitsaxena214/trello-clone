import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        404 · Not Found
      </p>
      <h1 className="text-4xl font-bold">Page not found</h1>
      <p className="text-muted-foreground text-sm max-w-sm">
        This page doesn't exist, was removed, or you don't have access to it.
      </p>
      <Button asChild>
        <Link href="/">Go home</Link>
      </Button>
    </div>
  );
}