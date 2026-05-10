"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminHome() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    doctors: 0,
    schedules: 0,
    appointments: 0,
    pending: 0,
  });

  useEffect(() => {
    const raw = localStorage.getItem("hb_user");
    const u = raw ? JSON.parse(raw) : null;
    setUser(u);
    if (!u) router.push("/login");
    else if (u.role !== "ADMIN") router.push("/");
  }, [router]);

  useEffect(() => {
    Promise.all([
      fetch("/api/doctors").then((r) => r.json()),
      fetch("/api/schedules").then((r) => r.json()),
      fetch("/api/appointments").then((r) => r.json()),
    ])
      .then(([doctors, schedules, appts]) => {
        setStats({
          doctors: doctors.length,
          schedules: schedules.length,
          appointments: appts.length,
          pending: appts.filter((a) => a.status === "PENDING").length,
        });
      })
      .catch(() => {});
  }, []);

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-blue-50 to-white py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          แดชบอร์ดผู้ดูแลระบบ
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          สรุปและจัดการระบบจองนัดหมาย
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <Stat label="แพทย์" value={stats.doctors} />
          <Stat label="ตารางเวร" value={stats.schedules} />
          <Stat label="นัดหมายทั้งหมด" value={stats.appointments} />
          <Stat label="รอติดต่อกลับ" value={stats.pending} highlight />
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-8">
          <NavCard
            href="/admin/appointments"
            title="จัดการนัดหมาย"
            desc="อนุมัติ / ยกเลิก / ดูรายการ"
          />
          <NavCard
            href="/admin/doctors"
            title="จัดการแพทย์"
            desc="เพิ่ม / ดู / ลบ"
          />
          <NavCard
            href="/admin/schedules"
            title="จัดการตารางเวร"
            desc="เพิ่ม / ดู / ลบ"
          />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div
      className={`rounded-2xl p-5 border hover:-translate-y-0.5 transition ${
        highlight
          ? "bg-gradient-to-br from-blue-700 to-blue-950 text-white border-transparent"
          : "bg-white border-slate-100 text-slate-900 hb-shadow-soft"
      }`}
    >
      <div
        className={`text-xs ${highlight ? "text-blue-100" : "text-slate-500"}`}
      >
        {label}
      </div>
      <div className="text-3xl font-bold mt-1.5">{value}</div>
    </div>
  );
}

function NavCard({ href, title, desc }) {
  return (
    <Link
      href={href}
      className="block hb-card p-6 hover:-translate-y-1 hover:border-blue-200 transition"
    >
      <div className="font-semibold text-slate-900">{title}</div>
      <div className="text-sm text-slate-500 mt-1">{desc}</div>
      <div className="mt-4 text-blue-900 text-sm font-medium">เปิด →</div>
    </Link>
  );
}
