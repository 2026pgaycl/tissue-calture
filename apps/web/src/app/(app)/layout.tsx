import { requireSession } from "@/lib/dal";
import { Sidebar } from "@/components/shell/sidebar";
import { Header } from "@/components/shell/header";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  return (
    <div className="flex min-h-screen">
      <Sidebar role={session.role} />
      <div className="flex flex-1 flex-col">
        <Header session={session} />
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
