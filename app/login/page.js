"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Cross } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "เข้าสู่ระบบไม่สำเร็จ");
        return;
      }
      localStorage.setItem("hb_user", JSON.stringify(data));
      window.dispatchEvent(new Event("hb_user_changed"));
      router.push(data.role === "ADMIN" ? "/admin" : "/booking");
    } catch (err) {
      setError("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-5xl hb-card overflow-hidden grid md:grid-cols-2">
        {/* LEFT panel */}
        <div className="relative hidden md:block bg-gradient-to-br from-blue-700 via-blue-800 to-blue-950 text-white p-10">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-sky-300/20 blur-3xl" />

          <div className="relative h-full flex flex-col">
            <div className="inline-flex items-center gap-2 text-sm tracking-[0.2em] text-blue-100/80">
              <Cross className="w-4 h-4" strokeWidth={2.5} />
              RANGSIT HOSPITAL
            </div>

            <div className="mt-auto">
              <h2 className="text-4xl font-bold leading-tight">
                Welcome
                <br />
                <span className="text-blue-200">ยินดีต้อนรับกลับ</span>
              </h2>
              <p className="mt-4 text-blue-100/90 max-w-sm leading-relaxed">
                เข้าสู่ระบบเพื่อจองนัดหมายแพทย์
                และจัดการนัดหมายของคุณได้อย่างง่ายดาย
              </p>

              <div className="mt-10 grid grid-cols-2 gap-3">
                <MiniCard label="แพทย์เฉพาะทาง" value="20+" />
                <MiniCard label="รองรับ" value="24/7" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT form */}
        <div className="p-8 sm:p-12">
          <div className="max-w-sm mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-900 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              กลับหน้าแรก
            </Link>

            <h1 className="mt-5 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              เข้าสู่ระบบ
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              ใช้บัญชีผู้ป่วยหรือบัญชีผู้ดูแลระบบ
            </p>

            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <Field
                label="อีเมล"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="example@email.com"
                icon={<Mail className="w-4 h-4" />}
                required
              />

              <PasswordField
                label="รหัสผ่าน"
                name="password"
                value={form.password}
                onChange={onChange}
                show={showPw}
                onToggle={() => setShowPw((s) => !s)}
              />

              <label className="flex items-center gap-2 text-sm text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                />
                จดจำการเข้าสู่ระบบ
              </label>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-xl">
                  {error}
                </p>
              )}

              <button
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-blue-900 text-white font-medium hover:bg-blue-950 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-900/20 transition disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-600 text-center">
              ยังไม่มีบัญชี?{" "}
              <Link
                href="/register"
                className="text-blue-900 font-medium hover:underline"
              >
                สมัครสมาชิก
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur p-4">
      <div className="text-xs text-blue-100/80">{label}</div>
      <div className="text-2xl font-bold mt-0.5">{value}</div>
    </div>
  );
}

function Field({ label, icon, ...props }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-700">{label}</span>
      <div className="mt-1.5 relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        <input
          {...props}
          className={`w-full px-4 py-3 ${icon ? "pl-10" : ""} rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition`}
        />
      </div>
    </label>
  );
}

function PasswordField({ label, show, onToggle, ...props }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-700">{label}</span>
      <div className="mt-1.5 relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          <Lock className="w-4 h-4" />
        </span>
        <input
          {...props}
          type={show ? "text" : "password"}
          className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
          required
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100"
          aria-label="toggle password"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </label>
  );
}
