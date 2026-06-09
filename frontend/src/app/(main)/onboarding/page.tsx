"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function OnboardingPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreateOrg() {
    try {
      setLoading(true);
      const { data } = await api.post("/org", {
        name,
      });

      router.push(`/org/${data.data.slug}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Organization</CardTitle>
          <CardDescription>Create your first workspace.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            placeholder="Acme Inc"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Button
            onClick={handleCreateOrg}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Creating..." : "Create Organization"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
