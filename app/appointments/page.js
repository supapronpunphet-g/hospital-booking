"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Stethoscope,
  CalendarDays,
  Clock,
  CalendarPlus,
  CalendarX,
  Inbox,
} from "lucide-react";

export default function AppointmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("hb_user");
      const u = raw ? JSON.parse(raw) : null;
      setUser(u);
      if (!u) {
        router.push("/login");
        return;
      }
      if (u.role !== "PATIENT") {
        router.push("/");
        return;
      }
      load(u.patientId);
    } catch {
      router.push("/login");
    }
  }, [router]);

  const load = async (patientId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/appointments?patientId=${patientId}`);
      const data = await res.json();
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  const cancel = async (id) => {
    if (!confirm("ยืนยันการยกเลิกนัดหมายนี้?")) return;
    const res = await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    if (res.ok && user?.patientId) load(user.patientId);
  };

  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-blue-50 to-white py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              นัดหมายของฉัน
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              ดูและจัดการนัดหมายของคุณ
            </p>
          </div>
          <Link
            href="/booking"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-blue-900 text-white text-sm font-medium hover:bg-blue-950 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-900/20 transition"
          >
            <CalendarPlus className="w-4 h-4" />
            จองนัดใหม่
          </Link>
        </div>

        {loading ? (
          <div className="hb-card p-10 text-center text-slate-500">
            กำลังโหลด...
          </div>
        ) : items.length === 0 ? (
          <div className="hb-card p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 mx-auto flex items-center justify-center text-blue-900">
              <Inbox className="w-7 h-7" />
            </div>
            <p className="mt-4 text-slate-600">ยังไม่มีนัดหมาย</p>
            <Link
              href="/booking"
              className="mt-6 inline-flex items-center gap-1.5 px-6 py-3 rounded-full bg-blue-900 text-white font-medium hover:bg-blue-950 hover:-translate-y-0.5 transition"
            >
              <CalendarPlus className="w-4 h-4" />
              เริ่มจองนัด
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((a) => {
              const d = new Date(a.appointmentDate);
              return (
                <div
                  key={a.id}
                  className="hb-card p-6 hover:-translate-y-0.5 transition"
                >
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-700 to-blue-950 text-white flex items-center justify-center shrink-0">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {a.doctor.fullName}
                        </div>
                        <div className="text-sm text-slate-500 mt-0.5">
                          {a.doctor.specialty}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-700">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="w-4 h-4 text-blue-700" />
                            {d.toLocaleDateString("th-TH", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-blue-700" />
                            {a.appointmentTime}
                          </span>
                        </div>
                        {a.symptom && (
                          <div className="text-xs text-slate-500 mt-1">
                            อาการ: {a.symptom}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                      <StatusBadge status={a.status} />
                      {a.status !== "CANCELLED" && (
                        <button
                          onClick={() => cancel(a.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-200 text-red-700 text-sm hover:bg-red-50 transition"
                        >
                          <CalendarX className="w-4 h-4" />
                          ยกเลิกนัด
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    PENDING: "bg-blue-50 text-blue-800 border-blue-100",
    APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-100",
    CANCELLED: "bg-slate-100 text-slate-500 border-slate-200",
  };
  const label = {
    PENDING: "รอติดต่อกลับ",
    APPROVED: "ยืนยันแล้ว",
    CANCELLED: "ยกเลิก",
  }[status];
  const dot = {
    PENDING: "bg-blue-600",
    APPROVED: "bg-emerald-500",
    CANCELLED: "bg-slate-400",
  }[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border ${map[status] || "bg-slate-100 border-slate-200"}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label || status}
    </span>
  );
}
