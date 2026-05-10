import Link from "next/link";
import {
  ArrowRight,
  Stethoscope,
  HeartPulse,
  Syringe,
  CalendarCheck,
  ShieldCheck,
  CalendarPlus,
} from "lucide-react";

export default function Home() {
  return (
    <div className="bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-white pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-200/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-sky-200/40 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] px-3 py-1.5 rounded-full bg-blue-100 text-blue-900">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-700"></span>
                ONLINE APPOINTMENT
              </span>
              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.15] tracking-tight">
                นัดหมายแพทย์ออนไลน์
                <br />
                <span className="text-blue-900">รู้ทันใจ ไม่ต้องรอ</span>
              </h1>
              <p className="mt-6 text-lg text-slate-600 max-w-lg leading-relaxed">
                จองนัดแพทย์เฉพาะทางได้ทุกที่ทุกเวลา เลือกแพทย์
                วันและเวลาที่สะดวก ลดเวลารอที่โรงพยาบาล
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-blue-900 text-white font-medium hover:bg-blue-950 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-900/20 transition"
                >
                  เริ่มต้นใช้งาน
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="#how-to-use"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-slate-800 font-medium border border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:-translate-y-0.5 transition"
                >
                  ดูรายละเอียด
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-6 text-sm text-slate-500">
                <Stat n="24/7" label="จองออนไลน์ตลอดเวลา" />
                <span className="w-px h-8 bg-slate-200" />
                <Stat n="20+" label="แพทย์เฉพาะทาง" />
                <span className="w-px h-8 bg-slate-200" />
                <Stat n="5 นาที" label="จองนัดเสร็จ" />
              </div>
            </div>

            {/* Preview Card */}
            <div className="relative">
              <div className="hb-card p-6 sm:p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-slate-500">
                      บริการของเรา
                    </div>
                    <div className="text-lg font-semibold text-slate-900 mt-0.5">
                      ทำนัด
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    เปิดให้บริการ
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  <ServiceRow
                    icon={<Stethoscope className="w-5 h-5" />}
                    title="นัดหมายแพทย์"
                    desc="พบแพทย์เฉพาะทาง"
                  />
                  <ServiceRow
                    icon={<HeartPulse className="w-5 h-5" />}
                    title="ตรวจสุขภาพ"
                    desc="แพ็กเกจประจำปี"
                  />
                  <ServiceRow
                    icon={<Syringe className="w-5 h-5" />}
                    title="ฉีดวัคซีน"
                    desc="หลายชนิด"
                  />
                </div>

                <Link
                  href="/booking"
                  className="mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-blue-700 to-blue-900 text-white font-medium hover:from-blue-800 hover:to-blue-950 hover:-translate-y-0.5 transition"
                >
                  เริ่มจองนัด
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="absolute -z-10 inset-2 bg-blue-200/30 rounded-[32px] blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-800">
              ทำไมต้องเลือกเรา
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              บริการที่ออกแบบเพื่อคุณ
            </h2>
            <p className="mt-3 text-slate-600">
              ระบบเรียบง่าย ใช้งานสะดวก ครบทุกความต้องการของคนไข้
            </p>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-5">
            <Benefit
              icon={<Stethoscope className="w-5 h-5" />}
              title="แพทย์เฉพาะทาง"
              desc="ครอบคลุมหลากหลายสาขา เช่น อายุรกรรม กุมารเวช ศัลยกรรม"
            />
            <Benefit
              icon={<CalendarCheck className="w-5 h-5" />}
              title="จัดการนัดได้เอง"
              desc="ดูรายการ ยกเลิก หรือเปลี่ยนแปลงได้ทุกเวลาผ่านระบบออนไลน์"
            />
            <Benefit
              icon={<ShieldCheck className="w-5 h-5" />}
              title="ปลอดภัย ใช้ง่าย"
              desc="ระบบใช้งานง่ายเหมาะกับทุกวัย ข้อมูลปลอดภัยตามมาตรฐาน"
            />
          </div>
        </div>
      </section>

      {/* HOW TO USE */}
      <section id="how-to-use" className="bg-gradient-to-b from-white to-blue-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-800">
              วิธีใช้งาน
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              จองนัดได้ใน 4 ขั้นตอน
            </h2>
          </div>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Step n="1" title="เริ่มต้น" desc="เลือกประเภทบริการที่ต้องการ" />
            <Step n="2" title="ข้อมูลการนัด" desc="เลือกแพทย์ วันและเวลาที่สะดวก" />
            <Step n="3" title="ข้อมูลผู้ป่วย" desc="กรอก/ตรวจสอบข้อมูลคนไข้" />
            <Step n="4" title="รอติดต่อกลับ" desc="ระบบจะแจ้งยืนยันให้คุณ" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-700 via-blue-800 to-blue-950 p-10 sm:p-14 text-white hb-shadow-soft">
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-sky-300/15 blur-3xl" />

            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  พร้อมจองนัดหมายแพทย์แล้วหรือยัง?
                </h3>
                <p className="mt-3 text-blue-100">
                  สมัครสมาชิกฟรี เริ่มจองนัดได้ทันที
                </p>
              </div>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-blue-900 font-medium hover:-translate-y-0.5 hover:shadow-lg transition"
                >
                  สมัครสมาชิก
                </Link>
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-blue-950/40 text-white font-medium border border-white/20 hover:bg-blue-950/60 hover:-translate-y-0.5 transition"
                >
                  <CalendarPlus className="w-4 h-4" />
                  เริ่มจองนัด
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <div>© {new Date().getFullYear()} Rangsit Hospital. All rights reserved.</div>
          <div>CSC480 Project</div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ n, label }) {
  return (
    <div>
      <div className="text-lg font-semibold text-slate-900">{n}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

function ServiceRow({ icon, title, desc }) {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-100 hover:bg-blue-50/40 hover:-translate-y-0.5 transition">
      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="text-xs text-slate-500">{desc}</div>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-400" />
    </div>
  );
}

function Benefit({ icon, title, desc }) {
  return (
    <div className="hb-card p-6 hover:-translate-y-1 transition">
      <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );
}

function Step({ n, title, desc }) {
  return (
    <div className="hb-card p-6 hover:-translate-y-1 transition">
      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-700 to-blue-950 text-white flex items-center justify-center font-semibold">
        {n}
      </div>
      <div className="mt-4 font-semibold text-slate-900">{title}</div>
      <p className="mt-1 text-sm text-slate-600">{desc}</p>
    </div>
  );
}
