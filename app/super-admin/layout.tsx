import SuperAdminSidebar from "@/components/super-admin/SuperAdminSidebar";
import SuperAdminTopbar from "@/components/super-admin/SuperAdminTopbar";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex">
      <SuperAdminSidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <SuperAdminTopbar />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
