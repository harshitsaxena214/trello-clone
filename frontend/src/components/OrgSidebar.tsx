"use client";

import Link from "next/link";
import { LogOut, Plus, UserCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

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
import { api } from "@/lib/axios";

type OrgSummary = {
  id: string;
  name: string;
  slug: string;
  _count: { members: number; boards: number };
};

export function OrgSidebar() {
  const pathname = usePathname();
  const activeSlug = pathname.split("/")[2];
  const { data: session } = useSession();

  const [orgs, setOrgs] = useState<OrgSummary[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/org");
        setOrgs(res.data.data ?? []);
      } catch (error) {
        console.error(error);
      }
    }
    load();
  }, []);

  async function handleLogout() {
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-md bg-foreground text-background grid place-items-center font-bold text-sm shrink-0">
                  K
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold">KanbaFlow</p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    v1.0 · beta
                  </p>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between pr-2">
            <SidebarGroupLabel>Organizations</SidebarGroupLabel>
            <button className="size-5 grid place-items-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition">
              <Plus className="size-3.5" />
            </button>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {orgs.map((org) => {
                const active = org.slug === activeSlug;
                const short = org.name.slice(0, 2).toUpperCase();
                return (
                  <SidebarMenuItem key={org.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className="h-auto py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                    >
                      <Link
                        href={`/org/${org.slug}`}
                        className="flex items-center gap-3 w-full"
                      >
                        <div
                          className={`size-8 rounded-md grid place-items-center text-[11px] font-bold border shrink-0 transition ${
                            active
                              ? "bg-foreground text-background border-foreground"
                              : "border-border bg-muted/40"
                          }`}
                        >
                          {short}
                        </div>
                        <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                          <span className="truncate text-sm font-medium">
                            {org.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {org._count.boards} boards · {org._count.members}{" "}
                            members
                          </span>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="h-auto py-2">
              <UserCircle2 className="size-4 shrink-0" />
              <div className="flex flex-col text-left min-w-0">
                <span className="truncate text-sm">{session?.user?.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {session?.user?.email}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut className="size-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
