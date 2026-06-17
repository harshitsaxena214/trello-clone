"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Search, Trash2 } from "lucide-react";

import { api } from "@/lib/axios";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { BoardCard } from "@/components/BoardCard";
import { ThemeToggle } from "@/components/ThemeToggler";

type Board = {
  id: string;
  name: string;
  progress: number;
  members?: string[];
  _count: { issues: number };
};

type Member = {
  id: string;
  name: string;
  role: string;
  initials: string;
};

export default function OrganizationPage() {
  const params = useParams();
  const router = useRouter();
  const orgSlug = params.orgslug as string;

  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgName, setOrgName] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [boardName, setBoardName] = useState("");
  const [creating, setCreating] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const slugRes = await api
          .get(`/org/slug/${orgSlug}`, { withCredentials: true })
          .catch((err) => {
            if (err.response?.status === 404 || err.response?.status === 403) {
              router.replace("/not-found");
            }
            throw err;
          });

        const { id, name, role } = slugRes.data.data;

        const [boardsRes, membersRes] = await Promise.all([
          api.get(`/org/${id}/board`, { withCredentials: true }),
          api.get(`/org/${id}/members`, { withCredentials: true }),
        ]);

        const raw = membersRes.data.data ?? [];

        setOrgId(id);
        setOrgName(name);
        setRole(role);
        setBoards(boardsRes.data.data ?? []);
        setMembers(
          raw.map((m: any) => ({
            id: m.user.id,
            name: m.user.name,
            role: m.role,
            initials: m.user.name
              .split(" ")
              .map((w: string) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase(),
          })),
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [orgSlug]);

  const fetchBoards = async () => {
    if (!orgId) return;
    try {
      const res = await api.get(`/org/${orgId}/board`, {
        withCredentials: true,
      });
      setBoards(res.data.data ?? []);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteOrg = async () => {
    if (!orgId) return;

    try {
      setDeleting(true);

      await api.delete(`/org/${orgId}`);

      toast.success("Organization deleted successfully");

      router.push("/org");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ?? "Failed to delete organization",
      );
    } finally {
      setDeleting(false);
    }
  };

  const createBoard = async () => {
    if (!boardName.trim()) return;
    try {
      setCreating(true);
      await api.post(`/org/${orgId}/board`, { name: boardName });
      setBoardName("");
      setShowCreateForm(false);
      await fetchBoards();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Failed to create board");
    } finally {
      setCreating(false);
    }
  };

  const leaveOrg = async () => {
    try {
      setLeaving(true);
      await api.delete(`/org/${orgId}/leave`, { withCredentials: true });
      toast.success("Left organisation successfully");
      router.push("/org");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ?? "Failed to leave organisation",
      );
    } finally {
      setLeaving(false);
    }
  };

  const isOwner = role === "OWNER";
  const totalIssues = boards.reduce((a, b) => a + (b._count?.issues ?? 0), 0);
  const doneIssues = boards.reduce(
    (a, b) =>
      a + Math.round(((b.progress ?? 0) / 100) * (b._count?.issues ?? 0)),
    0,
  );

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 shrink-0 border-b flex items-center justify-between px-3 sm:px-6 bg-background/60 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <SidebarTrigger />
            <div className="min-w-0">
              <h1 className="text-[15px] font-semibold leading-tight truncate">
                {orgName || <Skeleton className="h-4 w-32" />}
              </h1>
              <p className="text-[11px] text-muted-foreground truncate">
                {boards.length} active boards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="hidden md:flex items-center gap-2 h-9 px-3 rounded-md border bg-muted/40 text-xs text-muted-foreground w-64">
              <Search className="size-3.5" />
              <span>Search boards, tasks, members…</span>
              <span className="ml-auto font-mono text-[10px] opacity-60">
                ⌘K
              </span>
            </div>
            <ThemeToggle />

            {role === null ? (
              <>
                <Skeleton className="h-9 w-9 sm:w-28" />
              </>
            ) : isOwner ? (
              <>
                <Button size="sm" onClick={() => setShowCreateForm(true)}>
                  <Plus className="size-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">New board</span>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <span className="hidden sm:inline">Delete Org</span>
                  <Trash2 className="size-3.5 sm:hidden" />
                </Button>
              </>
            ) : (
              <Button
                variant="destructive"
                size="sm"
                onClick={leaveOrg}
                disabled={leaving}
              >
                {leaving ? "Leaving…" : "Leave org"}
              </Button>
            )}
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Hero stats */}
          <div className="rounded-xl border bg-card p-6 space-y-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
                This week
              </p>
              <h2 className="text-2xl font-bold">
                Ship faster with focused boards.
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Track work across {boards.length} boards. {members.length}{" "}
                teammates contributing this cycle.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total tasks", value: totalIssues },
                { label: "Completed", value: doneIssues },
                { label: "Boards", value: boards.length },
                { label: "Members", value: members.length },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg border bg-muted/30 p-4"
                >
                  <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
                    {s.label}
                  </p>
                  <p className="text-3xl font-bold">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Boards section */}
          <div>
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Workspace
                </p>
                <h3 className="text-lg font-semibold">Boards</h3>
              </div>
              <span className="text-[11px] text-muted-foreground font-mono">
                sorted · recent
              </span>
            </div>

            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl border p-5 space-y-4">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-1 w-full mt-6" />
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        <Skeleton className="size-7 rounded-full" />
                        <Skeleton className="size-7 rounded-full" />
                      </div>
                      <Skeleton className="h-3 w-14" />
                    </div>
                  </div>
                ))}
              </div>
            ) : boards.length === 0 ? (
              <div className="rounded-xl border p-10 text-center text-muted-foreground text-sm">
                No boards yet.{" "}
                {isOwner && (
                  <button
                    className="underline underline-offset-2 hover:text-foreground transition"
                    onClick={() => setShowCreateForm(true)}
                  >
                    Create your first board.
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {boards.map((board) => (
                  <BoardCard key={board.id} board={board} orgSlug={orgSlug} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Organization?</AlertDialogTitle>

            <AlertDialogDescription>
              This action cannot be undone.
              <br />
              <br />
              All boards, tasks, members and workspace data inside{" "}
              <strong>{orgName}</strong> will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={async () => {
                await deleteOrg();
                setDeleteDialogOpen(false);
              }}
            >
              Delete Organization
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create board dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create new board</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              placeholder="Board name"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createBoard()}
            />
            <div className="flex gap-2">
              <Button onClick={createBoard} disabled={creating}>
                {creating ? "Creating…" : "Create"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
