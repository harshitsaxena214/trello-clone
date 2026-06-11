"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Plus, User2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/axios";
import { toast } from "sonner";

type User = { id: string; name: string; email: string };
type Status = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
type Issue = {
  id: string;
  title: string;
  description?: string;
  status: Status;
  position: number;
  assignee?: User | null;
};
type Member = { userId: string; user: User };
type GroupedIssues = Record<Status, Issue[]>;

const COLUMNS: { key: Status; label: string }[] = [
  { key: "TODO", label: "To Do" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "IN_REVIEW", label: "In Review" },
  { key: "DONE", label: "Done" },
];

const EMPTY: GroupedIssues = {
  TODO: [],
  IN_PROGRESS: [],
  IN_REVIEW: [],
  DONE: [],
};

export default function BoardPage() {
  const params = useParams();
  const orgSlug = params.orgslug as string;
  const boardId = params.boardId as string;

  const [orgId, setOrgId] = useState<string | null>(null);
  const [issues, setIssues] = useState<GroupedIssues>(EMPTY);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createStatus, setCreateStatus] = useState<Status>("TODO");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api
      .get(`/org/slug/${orgSlug}`, { withCredentials: true })
      .then((res) => setOrgId(res.data.data.id))
      .catch(console.error);
  }, [orgSlug]);

  const fetchIssues = async (id: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/org/${id}/board/${boardId}/issue`, {
        withCredentials: true,
      });
      setIssues(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orgId) return;
    fetchIssues(orgId);
    api
      .get(`/org/${orgId}/members`, { withCredentials: true })
      .then((res) => setMembers(res.data.data))
      .catch(console.error);
  }, [orgId]);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const src = source.droppableId as Status;
    const dest = destination.droppableId as Status;
    const srcItems = [...issues[src]];
    const destItems = src === dest ? srcItems : [...issues[dest]];
    const [moved] = srcItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, { ...moved, status: dest });

    setIssues((prev) => ({ ...prev, [src]: srcItems, [dest]: destItems }));

    try {
      await api.patch(
        `/org/${orgId}/board/${boardId}/issue/${draggableId}/position`,
        { status: dest, position: destination.index },
        { withCredentials: true },
      );
    } catch {
      toast.error("Failed to update position");
      if (orgId) fetchIssues(orgId);
    }
  };

  const openCreate = (status: Status) => {
    setCreateStatus(status);
    setShowCreate(true);
  };

  const closeCreate = () => {
    setTitle("");
    setDescription("");
    setAssigneeId("");
    setShowCreate(false);
  };

  const createIssue = async () => {
    if (!title.trim() || !orgId) return;
    try {
      setCreating(true);
      const res = await api.post(
        `/org/${orgId}/board/${boardId}/issue`,
        {
          title,
          description,
          status: createStatus,
          assigneeId: assigneeId || undefined,
        },
        { withCredentials: true },
      );
      setIssues((prev) => ({
        ...prev,
        [createStatus]: [...prev[createStatus], res.data.issue],
      }));
      toast.success("Issue created");
      closeCreate();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Failed to create issue");
    } finally {
      setCreating(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-full items-center justify-center p-10">
        <p className="text-muted-foreground text-sm">Loading board…</p>
      </div>
    );

  return (
    <div className="flex flex-col h-full p-6 gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Board</h1>
        <Button onClick={() => openCreate("TODO")}>
          <Plus className="h-4 w-4 mr-1" /> New Issue
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-4 gap-4 flex-1 overflow-hidden">
          {COLUMNS.map((col) => (
            <div
              key={col.key}
              className="flex flex-col rounded-xl bg-muted/50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{col.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {issues[col.key].length}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => openCreate(col.key)}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              <Droppable droppableId={col.key}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex flex-col gap-2 p-3 flex-1 overflow-y-auto min-h-[100px] ${snapshot.isDraggingOver ? "bg-muted" : ""}`}
                  >
                    {issues[col.key].map((issue, index) => (
                      <Draggable
                        key={issue.id}
                        draggableId={issue.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={
                              provided.draggableProps
                                .style as React.CSSProperties
                            }
                            className={`bg-background rounded-lg p-3 shadow-sm border border-border/50 cursor-grab active:cursor-grabbing space-y-2 ${snapshot.isDragging ? "shadow-lg rotate-1" : ""}`}
                          >
                            <p className="text-sm font-medium">{issue.title}</p>
                            {issue.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {issue.description}
                              </p>
                            )}
                            {issue.assignee && (
                              <div className="flex items-center gap-1.5">
                                <User2 className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {issue.assignee.name}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {issues[col.key].length === 0 &&
                      !snapshot.isDraggingOver && (
                        <p className="text-xs text-muted-foreground text-center py-6">
                          No issues
                        </p>
                      )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <Dialog open={showCreate} onOpenChange={(open) => !open && closeCreate()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Issue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex gap-2 flex-wrap">
                {COLUMNS.map((col) => (
                  <button
                    key={col.key}
                    onClick={() => setCreateStatus(col.key)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      createStatus === col.key
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-primary"
                    }`}
                  >
                    {col.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Issue title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createIssue()}
              />
            </div>

            <div className="space-y-2">
              <Label>
                Description{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                placeholder="Add more detail…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>
                Assignee{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user.id} value={m.user.id}>
                    {m.user.name} ({m.user.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={createIssue}
                disabled={creating || !title.trim()}
              >
                {creating ? "Creating…" : "Create"}
              </Button>
              <Button variant="outline" onClick={closeCreate}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
