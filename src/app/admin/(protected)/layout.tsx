import { requireAdmin } from "@/lib/admin-auth";
import AdminNav from "./AdminNav";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AdminNav who={admin.viaSharedLink ? "Shared admin link" : (admin.email ?? "")} />
      <main className="flex-1 bg-zinc-50">{children}</main>
    </div>
  );
}
