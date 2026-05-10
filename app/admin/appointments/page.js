"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminAppointments() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    const raw = localStorage.getItem("hb_user");
    const u = raw ? JSON.parse(raw) : null;
    setUser(u);
    if (!u) router.push("/login");
    else if (u.role !== "ADMIN") router.push("/");
    else load();
  }, [router]);

  const load = async () => {
    const res = await fetch("/api/appointments");
    setItems(await res.json());
  };

  const update = async (id, status) => {
    await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  };

  if (!user || user.role !== "ADMIN") return null;

  const filtered =
    filter === "ALL" ? items : items.filter((a) => a.status === filter);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-blue-50 to-white py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              จัดการนัดหมาย
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              ดูรายการนัดทั้งหมด อนุมัติหรือยกเลิกได้ที่นี่
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            {["ALL", "PENDING", "APPROVED", "CANCELLED"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-full border transition ${
                  filter === s
                    ? "bg-blue-900 text-white border-blue-900"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                {labelOf(s)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 hb-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-blue-50/60 text-slate-600">
              <tr>
                <Th>ID</Th>
                <Th>ผู้ป่วย</Th>
                <Th>แพทย์</Th>
                <Th>วันเวลา</Th>
                <Th>อาการ</Th>
                <Th>สถานะ</Th>
                <Th align="right">จัดการ</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-slate-500 py-12">
                    ไม่มีรายการ
                  </td>
                </tr>
              )}
              {filtered.map((a) => {
                const d = new Date(a.appointmentDate);
                return (
                  <tr
                    key={a.id}
                    className="border-t border-slate-100 hover:bg-blue-50/30"
                  >
                    <Td>{a.id}</Td>
                    <Td>
                      {a.patient?.firstName} {a.patient?.lastName}
                      <div className="text-xs text-slate-500">
                        {a.patient?.phone || "-"}
                      </div>
                    </Td>
                    <Td>
                      {a.doctor?.fullName}
                      <div className="text-xs text-slate-500">
                        {a.doctor?.specialty}
                      </div>
                    </Td>
                    <Td>
                      {d.toLocaleDateString("th-TH")}
                      <div className="text-xs text-slate-500">
                        {a.appointmentTime}
                      </div>
                    </Td>
                    <Td>
                      <div className="max-w-[180px] truncate">
                        {a.symptom || "-"}
                      </div>
                    </Td>
                    <Td>
                      <StatusBadge status={a.status} />
                    </Td>
                    <Td align="right">
                      <div className="flex justify-end gap-2">
                        {a.status !== "APPROVED" && (
                          <button
                            onClick={() => update(a.id, "APPROVED")}
                            className="px-3 py-1.5 rounded-full bg-blue-900 text-white text-xs hover:bg-blue-950 transition"
                          >
                            อนุมัติ
                          </button>
                        )}
                        {a.status !== "CANCELLED" && (
                          <button
                            onClick={() => update(a.id, "CANCELLED")}
                            className="px-3 py-1.5 rounded-full border border-red-200 text-red-700 text-xs hover:bg-red-50 transition"
                          >
                            ยกเลิก
                          </button>
                        )}
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function labelOf(s) {
  return {
    ALL: "ทั้งหมด",
    PENDING: "รอติดต่อกลับ",
    APPROVED: "อนุมัติแล้ว",
    CANCELLED: "ยกเลิก",
  }[s];
}

function Th({ children, align }) {
  return (
    <th
      className={`px-5 py-3 ${align === "right" ? "text-right" : "text-left"} font-medium`}
    >
      {children}
    </th>
  );
}

function Td({ children, align }) {
  return (
    <td
      className={`px-5 py-3 align-top ${align === "right" ? "text-right" : "text-left"}`}
    >
      {children}
    </td>
  );
}

function StatusBadge({ status }) {
  const map = {
    PENDING: "bg-blue-50 text-blue-800 border-blue-100",
    APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-100",
    CANCELLED: "bg-slate-100 text-slate-500 border-slate-200",
  };
  return (
    <span
      className={`text-xs px-3 py-1 rounded-full border ${map[status] || "bg-slate-100 border-slate-200"}`}
    >
      {labelOf(status)}
    </span>
  );
}
