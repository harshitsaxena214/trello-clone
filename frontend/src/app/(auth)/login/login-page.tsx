"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to TaskFlow</CardTitle>
          <CardDescription>
            Sign in to access your organisations and boards.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button
            className="w-full"
            onClick={() =>
              signIn("google", {
                callbackUrl: returnUrl ?? "/org",
              })
            }
          >
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
