// components/InviteMemberModal.tsx
"use client";

import { useEffect, useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/axios";
import { toast } from "sonner";

type Props = {
  orgId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function InviteMemberModal({ orgId, open, onOpenChange }: Props) {
  const [inviteLink, setInviteLink] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [resetting, setResetting] = useState(false);

  const fetchInviteLink = async () => {
    try {
      const res = await api.get(`/org/${orgId}/invite-link`, { withCredentials: true });
      setInviteLink(res.data.inviteLink);
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Failed to fetch invite link");
    }
  };

  useEffect(() => {
    if (open && orgId) fetchInviteLink();
  }, [open, orgId]);

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success("Link copied to clipboard");
  };

  const resetLink = async () => {
    try {
      setResetting(true);
      const res = await api.patch(`/org/${orgId}/reset-invite`, {}, { withCredentials: true });
      setInviteLink(res.data.inviteLink);
      toast.success("Invite link reset");
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Failed to reset link");
    } finally {
      setResetting(false);
    }
  };

  const sendInvite = async () => {
    if (!email.trim()) return;
    try {
      setSending(true);
      await api.post(`/org/${orgId}/invite`, { email }, { withCredentials: true });
      toast.success("Invite sent successfully");
      setEmail("");
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Failed to send invite");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Members</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Invite Link */}
          <div className="space-y-2">
            <Label>Invite Link</Label>
            <div className="flex items-center gap-2">
              <Input value={inviteLink} readOnly className="text-xs text-muted-foreground" />
              <Button variant="outline" size="icon" onClick={copyLink} title="Copy link">
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={resetLink}
                disabled={resetting}
                title="Reset link"
              >
                <RefreshCw className={`h-4 w-4 ${resetting ? "animate-spin" : ""}`} />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Anyone with this link can join your organization.
            </p>
          </div>

          <Separator />

          {/* Send via Email */}
          <div className="space-y-2">
            <Label>Send via Email</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="member@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendInvite()}
              />
              <Button onClick={sendInvite} disabled={sending || !email.trim()}>
                {sending ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}