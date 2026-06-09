"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
  SidebarSeparator,
} from "@/components/ui/sidebar";

import { Button } from "@/components/ui/button";

import {
  Building2,
  Plus,
  KanbanSquare,
  LogOut,
  UserCircle2,
} from "lucide-react";

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
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  const [user, setUser] = useState<User | null>(null);

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
            <SidebarMenuButton size="lg">
              <KanbanSquare />

              <span className="font-semibold">TaskFlow</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <Button className="w-full">
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

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <UserCircle2 />

              <div className="flex flex-col text-left">
                <span className="truncate text-sm">{user?.name}</span>

                <span className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </span>
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
  );
}
