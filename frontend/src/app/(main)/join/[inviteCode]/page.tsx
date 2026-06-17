"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Building2, Users, LayoutDashboard } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/axios";

interface OrgPreview {
  id: string;
  name: string;
  slug: string;
  _count: { members: number; boards: number };
}

function JoinPageSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-3">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </CardFooter>
      </Card>
    </div>
  );
}

export default function JoinPage() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const router = useRouter();

  const [org, setOrg] = useState<OrgPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const res = await api.get(`/org/invite/${inviteCode}`);
        setOrg(res.data.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Invalid or expired invite link",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchOrg();
  }, [inviteCode]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      await api.post(`/org/join/${inviteCode}`, {});
      router.push(`/org/${org?.slug}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to join organisation");
      setJoining(false);
    }
  };

  if (loading) return <JoinPageSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="pt-6 text-center space-y-3">
            <p className="text-destructive text-sm font-medium">{error}</p>
            <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
              Go home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-4">
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
            <Building2 className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              You've been invited to
            </p>
            <h1 className="text-xl font-semibold">{org?.name}</h1>
            <p className="text-sm text-muted-foreground">
              Join this organisation to access its boards and collaborate with
              the team.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{org?._count.members} members</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LayoutDashboard className="w-4 h-4" />
              <span>{org?._count.boards} boards</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full" onClick={handleJoin} disabled={joining}>
            {joining ? "Joining..." : "Join organisation"}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/")}
          >
            Decline
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
