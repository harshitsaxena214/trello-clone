"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await api.post("/auth/login", form);
      toast.success(data.message);

      const params = new URLSearchParams(window.location.search);
      const returnUrl = params.get("returnUrl");

      if (returnUrl) {
        router.push(decodeURIComponent(returnUrl));
        return;
      }

      const { data: response } = await api.get("/org");
      const orgs = response.organisations;
      router.push(orgs.length === 0 ? "/onboarding" : `/org/${orgs[0].slug}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Sign in to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
          <CardFooter className="mt-3 justify-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href="/sign-up"
                className="font-medium text-primary hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
}
