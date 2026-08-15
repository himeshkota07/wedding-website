import { requireAdmin } from "@/lib/admin-auth";
import AdminNav from "./AdminNav";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AdminNav userEmail={user.email ?? ""} />
      <main className="flex-1 bg-zinc-50">{children}</main>
    </div>
  );
}
