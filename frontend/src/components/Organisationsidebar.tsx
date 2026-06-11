"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/axios";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Building2, Plus, KanbanSquare, LogOut, UserCircle2 } from "lucide-react";
import { toast } from "sonner";

type Organization = {
  id: string;
  name: string;
  slug: string;
};

type User = {
  name: string;
  email: string;
};

export function OrganizationSidebar() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [orgsRes, userRes] = await Promise.all([
          api.get("/org"),
          api.get("/auth/is-authenticated"),
        ]);
        setOrganizations(orgsRes.data.organisations);
        setUser(userRes.data);
      } catch (error) {
        console.error(error);
      }
    }
    load();
  }, []);

  const createOrg = async () => {
    if (!orgName.trim()) return;
    try {
      setCreating(true);
      const res = await api.post("/org", { name: orgName }, { withCredentials: true });
      const newOrg = res.data.data;
      toast.success("Organization created");
      setOrganizations((prev) => [...prev, newOrg]);
      setOrgName("");
      setShowCreateOrg(false);
      router.push(`/org/${newOrg.slug}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Failed to create organization");
    } finally {
      setCreating(false);
    }
  };

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
      window.location.href = "/sign-in";
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg">
                <KanbanSquare />
                <span className="font-semibold">TaskFlow</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <Button className="w-full" onClick={() => setShowCreateOrg(true)}>
              <Plus />
              New Organization
            </Button>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Organizations</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {organizations.map((org) => (
                  <SidebarMenuItem key={org.id}>
                    <SidebarMenuButton asChild>
                      <Link href={`/org/${org.slug}`}>
                        <Building2 />
                        <span>{org.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <UserCircle2 />
                <div className="flex flex-col text-left">
                  <span className="truncate text-sm">{user?.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout}>
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <Dialog open={showCreateOrg} onOpenChange={setShowCreateOrg}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <Input
                placeholder="e.g. Acme Inc."
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createOrg()}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={createOrg} disabled={creating || !orgName.trim()}>
                {creating ? "Creating..." : "Create"}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateOrg(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}