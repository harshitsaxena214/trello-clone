import { SidebarProvider } from "@/components/ui/sidebar";
import { OrgSidebar } from "@/components/OrgSidebar";
import { MembersPanel } from "@/components/MembersPanel";

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <OrgSidebar />
        <div className="flex-1 flex min-w-0 overflow-hidden">{children}</div>
        <MembersPanel />
      </div>
    </SidebarProvider>
  );
}
