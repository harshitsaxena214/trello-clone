"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { UserPlus } from "lucide-react";
import { api } from "@/lib/axios";
import InviteMemberModal from "./InviteMemberModal";

type Member = { id: string; name: string; role: string; initials: string };

export function MembersPanel() {
  const pathname = usePathname();
  const orgSlug = pathname.split("/")[2];

  const [members, setMembers] = useState<Member[]>([]);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    api
      .get(`/org/slug/${orgSlug}`, { withCredentials: true })
      .then((res) => setOrgId(res.data.data.id))
      .catch(console.error);
  }, [orgSlug]);

  useEffect(() => {
    if (!orgId) return;
    api
      .get(`/org/${orgId}/members`, { withCredentials: true })
      .then((res) => {
        const raw = res.data.data ?? [];
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
      })
      .catch(console.error);
  }, [orgId]);

  return (
    <aside className="hidden xl:flex w-64 shrink-0 flex-col border-l bg-card/40">
      <div className="h-16 px-5 flex items-center justify-between border-b">
        <div>
          <h3 className="text-sm font-semibold">Members</h3>
          <p className="text-[11px] text-muted-foreground">
            {members.length} active
          </p>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          className="size-8 grid place-items-center rounded-md border hover:bg-accent transition"
        >
          <UserPlus className="size-3.5" />
        </button>
      </div>

      <div className="p-3 flex flex-col gap-1 flex-1 overflow-y-auto">
        {members.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-accent/50 transition"
          >
            <div className="relative shrink-0">
              <div className="size-9 rounded-full bg-muted border grid place-items-center text-xs font-bold">
                {m.initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-foreground border-2 border-background" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{m.name}</p>
              <p className="text-[11px] text-muted-foreground">{m.role}</p>
            </div>
          </div>
        ))}
      </div>

      {/* <div className="p-5 border-t text-[11px] text-muted-foreground space-y-2">
        <div className="flex items-center justify-between">
          <span>Online now</span>
          <span className="text-foreground font-mono">3</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Avg. response</span>
          <span className="text-foreground font-mono">12m</span>
        </div>
      </div> */}
      {orgId && (
        <InviteMemberModal
          orgId={orgId}
          open={inviteOpen}
          onOpenChange={setInviteOpen}
        />
      )}
    </aside>
  );
}
