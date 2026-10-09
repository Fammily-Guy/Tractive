import Link from "next/link";
import { BarChart3, FileText, Inbox, LogOut, PhoneCall, Briefcase, UserPlus } from "lucide-react";
import { requireStaff } from "@/lib/server/auth";
import { LogoMark } from "@/components/ui/Logo";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff();
  const nav = [
    { href: "/admin", label: "Overview", icon: BarChart3 },
    { href: "/admin/applications", label: "Applications", icon: FileText },
    { href: "/admin/inbox/callback", label: "Callbacks", icon: PhoneCall },
    { href: "/admin/inbox/message", label: "Messages", icon: Inbox },
    { href: "/admin/inbox/investor", label: "Investors", icon: Briefcase },
    { href: "/admin/inbox/agent", label: "Agents", icon: UserPlus },
  ];
  return (
    <div className="lg:grid lg:min-h-screen lg:grid-cols-[15rem_1fr]">
      <aside className="border-b border-line bg-white lg:border-r lg:border-b-0">
        <div className="flex items-center gap-2 p-4"><LogoMark className="h-8 w-8" /><span className="font-extrabold">Lubarsch Staff</span></div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 lg:flex-col">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 font-semibold hover:bg-brand-light">
              <Icon className="h-4 w-4 text-brand" aria-hidden="true" />{label}
            </Link>
          ))}
        </nav>
        <div className="hidden border-t border-line p-4 text-sm lg:block">
          <p className="font-bold">{session.name}</p>
          <p className="text-ink-soft">{session.email} · {session.role}</p>
          <form action="/admin/logout" method="post" className="mt-2">
            <button className="btn-ghost min-h-10 px-2 text-sm"><LogOut className="h-4 w-4" aria-hidden="true" />Sign out</button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 p-4 sm:p-6">{children}</main>
    </div>
  );
}
