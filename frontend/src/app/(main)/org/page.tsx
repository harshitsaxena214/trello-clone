"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Building2, Users, KanbanSquare, LogOut } from "lucide-react";

import { api } from "@/lib/axios";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { signOut } from "next-auth/react";

type Organisation = {
  id: string;
  name: string;
  slug: string;
  _count: {
    members: number;
    boards: number;
  };
};

export default function OrgPage() {
  const router = useRouter();

  const [orgs, setOrgs] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function loadOrgs() {
      try {
        const { data } = await api.get("/org");
        setOrgs(data.data ?? []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadOrgs();
  }, []);

  const createOrganisation = async () => {
    if (!name.trim()) {
      toast.error("Workspace name is required");
      return;
    }
    try {
      setCreating(true);
      const { data } = await api.post("/org", {
        name: name.trim(),
      });
      const org = data.data;
      toast.success("Workspace created");
      setOpen(false);
      setName("");
      router.push(`/org/${org.slug}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create workspace");
    } finally {
      setCreating(false);
    }
  };

  async function handleLogout() {
    await signOut({ callbackUrl: "/" });
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading workspaces...
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Navbar */}
        <header className="border-b">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
            <h1 className="text-xl font-bold tracking-tight">
              Kanba<span className="text-primary">Flow</span>
            </h1>

            <div className="flex items-center gap-2">
              <Button onClick={() => setOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Workspace
              </Button>

              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-8">
            <h2 className="text-4xl font-bold">Organizations</h2>

            <p className="mt-2 text-muted-foreground">
              Manage your workspaces and collaborate with your team.
            </p>
          </div>

          {orgs.length === 0 ? (
            <Card className="flex min-h-[500px] items-center justify-center border-dashed">
              <CardContent className="text-center">
                <Building2 className="mx-auto mb-5 h-14 w-14 text-muted-foreground" />

                <h3 className="text-2xl font-semibold">No organizations yet</h3>

                <p className="mt-2 text-muted-foreground">
                  Create your first workspace and start collaborating.
                </p>

                <Button className="mt-6" onClick={() => setOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Workspace
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {orgs.map((org) => (
                <Card
                  key={org.id}
                  onClick={() => router.push(`/org/${org.slug}`)}
                  className="h-[170px] cursor-pointer transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                >
                  <CardContent className="flex h-full flex-col justify-between p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">{org.name}</h3>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {org.slug}
                        </p>
                      </div>

                      <Building2 className="h-5 w-5 text-primary" />
                    </div>

                    <div className="flex gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {org._count.members}
                      </div>

                      <div className="flex items-center gap-2">
                        <KanbanSquare className="h-4 w-4" />
                        {org._count.boards}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Create Workspace Card */}
              <Card
                onClick={() => setOpen(true)}
                className="h-[170px] cursor-pointer border-dashed transition-all hover:border-primary hover:bg-accent/40"
              >
                <CardContent className="flex h-full flex-col items-center justify-center">
                  <Plus className="mb-3 h-8 w-8" />

                  <h3 className="font-semibold">Create Workspace</h3>

                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    Start a new organization
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Workspace</DialogTitle>

            <DialogDescription>
              Create a new workspace for your team.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Workspace name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Button
              className="w-full"
              disabled={creating}
              onClick={createOrganisation}
            >
              {creating ? "Creating..." : "Create Workspace"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
