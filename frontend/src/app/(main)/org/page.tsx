"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Building2, Users, KanbanSquare } from "lucide-react";
import { api } from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

  useEffect(() => {
    async function loadOrgs() {
      try {
        const { data } = await api.get("/org");
        setOrgs(data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadOrgs();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <h1 className="text-xl font-bold">
            Kanba<span className="text-primary">Flow</span>
          </h1>

          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Workspace
          </Button>
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
                Create your first workspace and start organizing your boards.
              </p>

              <Button className="mt-6">
                <Plus className="mr-2 h-4 w-4" />
                Create Workspace
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {orgs.map((org) => (
              <Card
                key={org.id}
                onClick={() => router.push(`/org/${org.slug}`)}
                className="group cursor-pointer transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
              >
                <CardContent className="p-7">
                  <div className="mb-6 flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-semibold">{org.name}</h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {org.slug}
                      </p>
                    </div>

                    <Building2 className="h-6 w-6 text-primary" />
                  </div>

                  <div className="flex gap-8 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {org._count.members} Members
                    </div>

                    <div className="flex items-center gap-2">
                      <KanbanSquare className="h-4 w-4" />
                      {org._count.boards} Boards
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
