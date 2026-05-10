"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Cross,
  LogIn,
  UserPlus,
  CalendarPlus,
  CalendarCheck,
  LayoutDashboard,
  Stethoscope,
  Clock,
  ListChecks,
  LogOut,
} from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem("hb_user");
        setUser(raw ? JSON.parse(raw) : null);
      } catch {
        setUser(null);
      }
    };
    load();
    window.addEventListener("hb_user_changed", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("hb_user_changed", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("hb_user");
    window.dispatchEvent(new Event("hb_user_changed"));
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="inline-flex w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-blue-950 text-white items-center justify-center shadow-md shadow-blue-900/20 group-hover:-translate-y-0.5 transition">
            <Cross className="w-4 h-4" strokeWidth={2.5} />
          </span>
          <span className="font-semibold text-slate-900 tracking-tight">
            Rangsit Hospital
          </span>
        </Link>

        <nav className="flex items-center gap-1.5 text-sm">
          {!user && (
            <>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-slate-700 hover:bg-blue-50 hover:text-blue-900 transition"
              >
                <LogIn className="w-4 h-4" />
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-900 text-white hover:bg-blue-950 hover:-translate-y-0.5 transition shadow-sm shadow-blue-900/20"
              >
                <UserPlus className="w-4 h-4" />
                สมัครสมาชิก
              </Link>
            </>
          )}

          {user && user.role === "PATIENT" && (
            <>
              <NavLink href="/booking" icon={<CalendarPlus className="w-4 h-4" />}>
                จองนัดหมาย
              </NavLink>
              <NavLink href="/appointments" icon={<CalendarCheck className="w-4 h-4" />}>
                นัดหมายของฉัน
              </NavLink>
              <span className="hidden sm:inline px-2 text-slate-500 text-xs">
                {user.firstName || user.email}
              </span>
              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-slate-700 border border-slate-200 hover:bg-slate-50 transition"
              >
                <LogOut className="w-4 h-4" />
                ออกจากระบบ
              </button>
            </>
          )}

          {user && user.role === "ADMIN" && (
            <>
              <NavLink href="/admin" icon={<LayoutDashboard className="w-4 h-4" />}>
                แดชบอร์ด
              </NavLink>
              <NavLink href="/admin/appointments" icon={<ListChecks className="w-4 h-4" />}>
                นัดหมาย
              </NavLink>
              <NavLink href="/admin/doctors" icon={<Stethoscope className="w-4 h-4" />}>
                แพทย์
              </NavLink>
              <NavLink href="/admin/schedules" icon={<Clock className="w-4 h-4" />}>
                ตารางเวร
              </NavLink>
              <span className="hidden sm:inline px-2 text-slate-500 text-xs">
                Admin
              </span>
              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-slate-700 border border-slate-200 hover:bg-slate-50 transition"
              >
                <LogOut className="w-4 h-4" />
                ออกจากระบบ
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children, icon }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-slate-700 hover:bg-blue-50 hover:text-blue-900 transition"
    >
      {icon}
      {children}
    </Link>
  );
}
