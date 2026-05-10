"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminDoctors() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    fullName: "",
    specialty: "",
    phone: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("hb_user");
    const u = raw ? JSON.parse(raw) : null;
    setUser(u);
    if (!u) router.push("/login");
    else if (u.role !== "ADMIN") router.push("/");
    else load();
  }, [router]);

  const load = async () => {
    const res = await fetch("/api/doctors");
    setItems(await res.json());
  };

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/doctors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "เพิ่มไม่สำเร็จ");
      return;
    }
    setForm({ fullName: "", specialty: "", phone: "" });
    load();
  };

  const remove = async (id) => {
    if (
      !confirm(
        "ยืนยันการลบแพทย์ท่านนี้? (จะลบตารางเวรและนัดหมายที่เกี่ยวข้องด้วย)"
      )
    )
      return;
    await fetch(`/api/doctors/${id}`, { method: "DELETE" });
    load();
  };

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-blue-50 to-white py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          จัดการแพทย์
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          เพิ่ม / ดู / ลบ ข้อมูลแพทย์ในระบบ
        </p>

        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          <form onSubmit={submit} className="hb-card p-6 space-y-4">
            <h2 className="font-semibold text-slate-900">เพิ่มแพทย์</h2>
            <Field
              label="ชื่อ-นามสกุล"
              name="fullName"
              value={form.fullName}
              onChange={onChange}
              required
            />
            <Field
              label="สาขา"
              name="specialty"
              value={form.specialty}
              onChange={onChange}
              required
            />
            <Field
              label="เบอร์โทร"
              name="phone"
              value={form.phone}
              onChange={onChange}
            />
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
                {error}
              </p>
            )}
            <button className="w-full py-3 rounded-full bg-blue-900 text-white font-medium hover:bg-blue-950 hover:-translate-y-0.5 transition">
              + เพิ่มแพทย์
            </button>
          </form>

          <div className="lg:col-span-2 hb-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-blue-50/60 text-slate-600">
                <tr>
                  <Th>ID</Th>
                  <Th>ชื่อ</Th>
                  <Th>สาขา</Th>
                  <Th>เบอร์โทร</Th>
                  <Th align="right">จัดการ</Th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center text-slate-500 py-12"
                    >
                      ยังไม่มีแพทย์ในระบบ
                    </td>
                  </tr>
                )}
                {items.map((d) => (
                  <tr
                    key={d.id}
                    className="border-t border-slate-100 hover:bg-blue-50/30"
                  >
                    <Td>{d.id}</Td>
                    <Td>{d.fullName}</Td>
                    <Td>{d.specialty}</Td>
                    <Td>{d.phone || "-"}</Td>
                    <Td align="right">
                      <button
                        onClick={() => remove(d.id)}
                        className="px-3 py-1.5 rounded-full border border-red-200 text-red-700 hover:bg-red-50 transition text-xs"
                      >
                        ลบ
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
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
      className={`px-5 py-3 ${align === "right" ? "text-right" : "text-left"}`}
    >
      {children}
    </td>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-700">{label}</span>
      <input
        {...props}
        className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
      />
    </label>
  );
}
