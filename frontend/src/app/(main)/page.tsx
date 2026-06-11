import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold">TaskFlow</h1>
        <p className="text-muted-foreground text-lg">
          Manage your projects, boards, and teams in one place.
        </p>
      </div>
      <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button asChild>
          <Link href="/sign-up">Create account</Link>
        </Button>
      </div>
    </div>
  );
}
