"use client";

import Link from "next/link";
import { Boxes, LogOut, Plus, UserCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

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

type User = {
  name: string;
  email: string;
};

export function OrgSidebar() {
  const pathname = usePathname();
  const activeSlug = pathname.split("/")[2];

  const [orgs, setOrgs] = useState<OrgSummary[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [orgsRes, userRes] = await Promise.all([
          api.get("/org"),
          api.get("/auth/is-authenticated"),
        ]);
        setOrgs(orgsRes.data.data ?? []);
        setUser(userRes.data);
      } catch (error) {
        console.error(error);
      }
    }
    load();
  }, []);

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
      window.location.href = "/sign-in";
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-md bg-foreground text-background grid place-items-center font-bold text-sm shrink-0">
                  T
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold">TaskFlow</p>
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
                      className="h-auto py-2  group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
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
        {/* <div className="group-data-[collapsible=icon]:hidden rounded-lg border p-3 bg-muted/20 mb-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Boxes className="size-3.5 shrink-0" />
            <span className="truncate">Workspace usage</span>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-2/3 bg-foreground" />
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            64 of 100 boards used
          </p>
        </div> */}

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="h-auto py-2">
              <UserCircle2 className="size-4 shrink-0" />
              <div className="flex flex-col text-left min-w-0">
                <span className="truncate text-sm">{user?.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user?.email}
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
