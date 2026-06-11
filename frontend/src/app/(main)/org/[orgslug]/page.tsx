"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import InviteMemberModal from "@/components/InviteMemberModal";

type Board = {
  id: string;
  name: string;
  createdAt: string;
  _count: {
    issues: number;
  };
};

export default function OrganizationPage() {
  const params = useParams();
  const orgSlug = params.orgslug as string;
  const [orgId, setOrgId] = useState<string | null>(null);

  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [boardName, setBoardName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api
      .get(`/org/slug/${orgSlug}`, { withCredentials: true })
      .then((res) => setOrgId(res.data.data.id))
      .catch(console.error);
  }, [orgSlug]);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/org/${orgId}/board`, {
        withCredentials: true,
      });
      setBoards(res.data.data ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orgId) return;
    fetchBoards();
  }, [orgId]);

  const createBoard = async () => {
    if (!boardName.trim()) return;

    try {
      setCreating(true);
      await api.post(`/org/${orgId}/board`, {
        name: boardName,
      });
      setBoardName("");
      setShowCreateForm(false);
      await fetchBoards();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message ?? "Failed to create board");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Boards</h1>
          <p className="text-muted-foreground">
            Manage your organization boards
          </p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <Button onClick={() => setShowInviteModal(true)}>Add Member</Button>
          <Button onClick={() => setShowCreateForm((prev) => !prev)}>
            Create Board
          </Button>
        </div>
      </div>

      {/* Create Form */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Board</DialogTitle>
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
                {creating ? "Creating..." : "Create"}
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
      {/* Loading */}
      {loading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <Card key={item}>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {orgId && (
        <InviteMemberModal
          orgId={orgId}
          open={showInviteModal}
          onOpenChange={setShowInviteModal}
        />
      )}

      {/* Boards */}
      {!loading && (
        <>
          {boards.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">
                  No boards found. Create your first board.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {boards.map((board) => (
                <Card key={board.id}>
                  <CardHeader>
                    <CardTitle>{board.name}</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {board._count.issues} issues
                    </p>

                    <Button asChild className="w-full">
                      <Link href={`/org/${orgSlug}/boards/${board.id}`}>
                        Open Board
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
