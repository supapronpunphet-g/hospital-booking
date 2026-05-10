"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Stethoscope,
  HeartPulse,
  Syringe,
  Video,
  Activity,
  Microscope,
  Sparkles,
  UserRound,
  CalendarDays,
  Clock,
  Phone,
  Mail,
  CheckCircle2,
  Cake,
  Info,
  Check,
  CalendarCheck,
} from "lucide-react";

/* -------------------- Constants -------------------- */

const STEPS = [
  { n: 1, label: "เริ่มต้น" },
  { n: 2, label: "ข้อมูลการนัด" },
  { n: 3, label: "ข้อมูลผู้ป่วย" },
  { n: 4, label: "รอติดต่อกลับ" },
];

const SERVICE_TYPES = [
  { id: "appointment", icon: Stethoscope, title: "นัดหมายแพทย์", desc: "พบแพทย์เฉพาะทาง" },
  { id: "checkup", icon: HeartPulse, title: "ตรวจสุขภาพ", desc: "แพ็กเกจประจำปี" },
  { id: "vaccine", icon: Syringe, title: "ฉีดวัคซีน", desc: "หลายชนิด" },
  { id: "online", icon: Video, title: "ปรึกษาแพทย์ออนไลน์", desc: "Telemedicine" },
  { id: "followup", icon: Activity, title: "ติดตามอาการ", desc: "หลังการรักษา" },
  { id: "specialty", icon: Microscope, title: "ตรวจเฉพาะทาง", desc: "เครื่องมือพิเศษ" },
];

const SEARCH_METHODS = [
  {
    id: "auto",
    icon: Sparkles,
    title: "เลือกแพทย์ให้ฉัน",
    desc: "ระบบจะแนะนำแพทย์ที่เหมาะสมในสาขาที่เลือก",
  },
  {
    id: "manual",
    icon: UserRound,
    title: "ฉันต้องการเลือกแพทย์เอง",
    desc: "เลือกชื่อแพทย์ที่คุณต้องการพบเอง",
  },
];

/* -------------------- Page -------------------- */

export default function BookingPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [warning, setWarning] = useState("");

  // Step 1
  const [serviceType, setServiceType] = useState("");
  const [searchMethod, setSearchMethod] = useState("");

  // Step 2
  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [specialty, setSpecialty] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [scheduleId, setScheduleId] = useState("");
  const [symptom, setSymptom] = useState("");

  // Step 3
  const [patient, setPatient] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    birthDate: "",
    gender: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);
  const [error, setError] = useState("");

  /* ------- effects ------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("hb_user");
      const u = raw ? JSON.parse(raw) : null;
      setUser(u);
      if (!u) router.push("/login");
      else if (u.role !== "PATIENT") router.push("/");
      else
        setPatient((p) => ({
          ...p,
          firstName: u.firstName || "",
          lastName: u.lastName || "",
          email: u.email || "",
        }));
    } catch {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    fetch("/api/doctors")
      .then((r) => r.json())
      .then(setDoctors)
      .catch(() => setDoctors([]));
  }, []);

  useEffect(() => {
    if (!doctorId) {
      setSchedules([]);
      return;
    }
    fetch(`/api/schedules?doctorId=${doctorId}`)
      .then((r) => r.json())
      .then(setSchedules)
      .catch(() => setSchedules([]));
  }, [doctorId]);

  /* ------- derived ------- */
  const specialties = useMemo(
    () => Array.from(new Set(doctors.map((d) => d.specialty))).sort(),
    [doctors]
  );

  const doctorsInSpecialty = useMemo(
    () => (specialty ? doctors.filter((d) => d.specialty === specialty) : []),
    [doctors, specialty]
  );

  // For "auto" mode, suggest top 3 doctors of that specialty
  const suggestedDoctors = useMemo(
    () => doctorsInSpecialty.slice(0, 3),
    [doctorsInSpecialty]
  );

  const visibleDoctors =
    searchMethod === "auto" ? suggestedDoctors : doctorsInSpecialty;

  const selectedDoctor = doctors.find((d) => d.id === Number(doctorId));
  const selectedSchedule = schedules.find((s) => s.id === Number(scheduleId));
  const selectedService = SERVICE_TYPES.find((s) => s.id === serviceType);

  const canNext1 = !!serviceType && !!searchMethod;
  const canNext2 = !!specialty && !!doctorId && !!scheduleId;
  const canSubmit =
    !!patient.firstName && !!patient.lastName && !!patient.phone;

  /* ------- handlers ------- */
  const goNext = () => {
    setWarning("");
    if (step === 1 && !canNext1) {
      setWarning("กรุณาเลือกประเภทบริการและวิธีค้นหาแพทย์ก่อน");
      return;
    }
    if (step === 2 && !canNext2) {
      setWarning("กรุณาเลือกความเชี่ยวชาญ แพทย์ และวันเวลาให้ครบ");
      return;
    }
    setStep((s) => Math.min(4, s + 1));
  };
  const goBack = () => {
    setWarning("");
    setStep((s) => Math.max(1, s - 1));
  };

  const submit = async () => {
    if (!user?.patientId || !selectedDoctor || !selectedSchedule) return;
    if (!canSubmit) {
      setWarning("กรุณากรอก ชื่อ นามสกุล และเบอร์โทรศัพท์");
      return;
    }
    setSubmitting(true);
    setError("");
    setWarning("");
    try {
      await fetch(`/api/patients/${user.patientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patient),
      });

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: user.patientId,
          doctorId: selectedDoctor.id,
          appointmentDate: selectedSchedule.availableDate,
          appointmentTime: `${selectedSchedule.startTime}-${selectedSchedule.endTime}`,
          symptom,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "ไม่สามารถจองนัดได้");
        return;
      }
      setDone(data);
      setStep(4);
    } catch (e) {
      setError("เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#eef4fb] py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            ทำนัด
          </h1>
          <p className="mt-2 text-slate-500 text-sm">
            เลือกข้อมูลการนัดหมายของคุณ
          </p>
        </div>

        {/* Stepper */}
        <Stepper step={step} />

        {/* Card */}
        <div className="mt-8 bg-white rounded-[32px] hb-shadow-soft border border-slate-100 p-6 sm:p-10">
          {step === 1 && (
            <StepOne
              serviceType={serviceType}
              setServiceType={setServiceType}
              searchMethod={searchMethod}
              setSearchMethod={setSearchMethod}
            />
          )}

          {step === 2 && (
            <StepTwo
              specialties={specialties}
              specialty={specialty}
              setSpecialty={(s) => {
                setSpecialty(s);
                setDoctorId("");
                setScheduleId("");
              }}
              searchMethod={searchMethod}
              visibleDoctors={visibleDoctors}
              doctorId={doctorId}
              setDoctorId={(id) => {
                setDoctorId(id);
                setScheduleId("");
              }}
              schedules={schedules}
              scheduleId={scheduleId}
              setScheduleId={setScheduleId}
              symptom={symptom}
              setSymptom={setSymptom}
            />
          )}

          {step === 3 && (
            <StepThree
              patient={patient}
              setPatient={setPatient}
              doctor={selectedDoctor}
              schedule={selectedSchedule}
              service={selectedService}
              symptom={symptom}
            />
          )}

          {step === 4 && done && (
            <StepFour
              done={done}
              doctor={selectedDoctor}
              schedule={selectedSchedule}
              service={selectedService}
            />
          )}

          {warning && step !== 4 && (
            <div className="mt-6 flex items-start gap-2 text-sm text-blue-900 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <Info className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{warning}</span>
            </div>
          )}

          {error && step !== 4 && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
              {error}
            </p>
          )}

          {/* Footer actions */}
          {step !== 4 && (
            <div className="mt-10 flex items-center justify-between border-t border-slate-100 pt-6">
              <button
                onClick={goBack}
                disabled={step === 1}
                className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full text-slate-700 border border-slate-200 hover:bg-slate-50 hover:-translate-y-0.5 transition disabled:opacity-50 disabled:hover:translate-y-0"
              >
                <ArrowLeft className="w-4 h-4" />
                กลับ
              </button>

              {step < 3 && (
                <button
                  onClick={goNext}
                  className="inline-flex items-center gap-1.5 px-7 py-3 rounded-full bg-blue-900 text-white font-medium hover:bg-blue-950 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-900/20 transition"
                >
                  ต่อไป
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {step === 3 && (
                <button
                  onClick={submit}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-7 py-3 rounded-full bg-blue-900 text-white font-medium hover:bg-blue-950 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-900/20 transition disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {submitting ? "กำลังส่ง..." : "ส่งข้อมูล"}
                  {!submitting && <ArrowRight className="w-4 h-4" />}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------- Stepper -------------------- */
function Stepper({ step }) {
  return (
    <div className="hb-card px-4 sm:px-8 py-5">
      <ol className="flex items-center">
        {STEPS.map((s, i) => {
          const active = step === s.n;
          const done = step > s.n;
          return (
            <li key={s.n} className="flex-1 flex items-center">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border transition ${
                    done
                      ? "bg-blue-900 border-blue-900 text-white"
                      : active
                      ? "bg-blue-50 border-blue-300 text-blue-900"
                      : "bg-white border-slate-200 text-slate-400"
                  }`}
                >
                  {done ? <Check className="w-4 h-4" /> : s.n}
                </div>
                <span
                  className={`hidden sm:inline text-sm font-medium ${
                    active
                      ? "text-blue-900"
                      : done
                      ? "text-slate-700"
                      : "text-slate-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-3 sm:mx-5 rounded ${
                    step > s.n ? "bg-blue-900" : "bg-slate-200"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* -------------------- Step 1 -------------------- */
function StepOne({ serviceType, setServiceType, searchMethod, setSearchMethod }) {
  return (
    <div className="space-y-10">
      <div>
        <SectionTitle
          eyebrow="ขั้นตอนที่ 1"
          title="เลือกประเภทบริการ"
          desc="เลือกบริการที่คุณต้องการใช้งาน"
        />

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICE_TYPES.map((s) => {
            const Icon = s.icon;
            const active = serviceType === s.id;
            return (
              <SelectCard
                key={s.id}
                active={active}
                onClick={() => setServiceType(s.id)}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition ${
                    active
                      ? "bg-blue-900 text-white"
                      : "bg-blue-50 text-blue-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="mt-3 font-semibold text-slate-900">
                  {s.title}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{s.desc}</div>
              </SelectCard>
            );
          })}
        </div>
      </div>

      <div>
        <SectionTitle
          eyebrow="วิธีค้นหาแพทย์"
          title="คุณอยากค้นหาแพทย์อย่างไร?"
        />

        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          {SEARCH_METHODS.map((m) => {
            const Icon = m.icon;
            const active = searchMethod === m.id;
            return (
              <SelectCard
                key={m.id}
                active={active}
                onClick={() => setSearchMethod(m.id)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      active
                        ? "bg-blue-900 text-white"
                        : "bg-blue-50 text-blue-900"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      {m.title}
                    </div>
                    <div className="text-sm text-slate-500 mt-0.5">
                      {m.desc}
                    </div>
                  </div>
                </div>
              </SelectCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* -------------------- Step 2 -------------------- */
function StepTwo({
  specialties,
  specialty,
  setSpecialty,
  searchMethod,
  visibleDoctors,
  doctorId,
  setDoctorId,
  schedules,
  scheduleId,
  setScheduleId,
  symptom,
  setSymptom,
}) {
  return (
    <div className="space-y-10">
      <div>
        <SectionTitle
          eyebrow="ขั้นตอนที่ 2"
          title="ข้อมูลการนัด"
          desc="เลือกความเชี่ยวชาญ แพทย์ และวันเวลาที่ต้องการ"
        />
      </div>

      <Field label="ความเชี่ยวชาญ">
        {specialties.length === 0 ? (
          <p className="text-sm text-slate-500">ยังไม่มีข้อมูลแพทย์ในระบบ</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {specialties.map((s) => {
              const active = specialty === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpecialty(s)}
                  className={`px-4 py-2 rounded-full text-sm border transition ${
                    active
                      ? "bg-blue-900 border-blue-900 text-white"
                      : "bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        )}
      </Field>

      <Field
        label={
          searchMethod === "auto" ? "แพทย์ที่ระบบแนะนำ" : "เลือกแพทย์"
        }
      >
        {!specialty ? (
          <EmptyHint>กรุณาเลือกความเชี่ยวชาญก่อน</EmptyHint>
        ) : visibleDoctors.length === 0 ? (
          <EmptyHint>ยังไม่มีแพทย์ในสาขานี้</EmptyHint>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {visibleDoctors.map((d, idx) => (
              <DoctorCard
                key={d.id}
                doctor={d}
                active={Number(doctorId) === d.id}
                recommended={searchMethod === "auto" && idx === 0}
                onClick={() => setDoctorId(String(d.id))}
              />
            ))}
          </div>
        )}
      </Field>

      <Field label="วันและเวลา">
        {!doctorId ? (
          <EmptyHint>กรุณาเลือกแพทย์ก่อน</EmptyHint>
        ) : schedules.length === 0 ? (
          <EmptyHint>ยังไม่มีตารางเวรของแพทย์ท่านนี้</EmptyHint>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {schedules.map((s) => {
              const d = new Date(s.availableDate);
              const active = Number(scheduleId) === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setScheduleId(String(s.id))}
                  className={`text-left p-4 rounded-2xl border transition ${
                    active
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                      : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/40"
                  }`}
                >
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <CalendarDays className="w-4 h-4 text-blue-700" />
                    {d.toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="w-4 h-4 text-blue-700" />
                    {s.startTime} - {s.endTime}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Field>

      <Field label="อาการ / รายละเอียด (ไม่บังคับ)">
        <textarea
          rows={4}
          value={symptom}
          onChange={(e) => setSymptom(e.target.value)}
          placeholder="บอกอาการคร่าวๆ เพื่อให้แพทย์เตรียมตัว"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition resize-none"
        />
      </Field>
    </div>
  );
}

function DoctorCard({ doctor, active, recommended, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-4 rounded-2xl border transition flex gap-3 items-start ${
        active
          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
          : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/40"
      }`}
    >
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
          active ? "bg-blue-900 text-white" : "bg-blue-50 text-blue-900"
        }`}
      >
        <UserRound className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="font-semibold text-slate-900 truncate">
            {doctor.fullName}
          </div>
          {recommended && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              <Sparkles className="w-3 h-3" />
              แนะนำ
            </span>
          )}
        </div>
        <div className="mt-1 inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          {doctor.specialty}
        </div>
        {doctor.phone && (
          <div className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500">
            <Phone className="w-3 h-3" />
            {doctor.phone}
          </div>
        )}
        <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          พร้อมให้บริการ
        </div>
      </div>
    </button>
  );
}

/* -------------------- Step 3 -------------------- */
function StepThree({ patient, setPatient, doctor, schedule, service, symptom }) {
  const onChange = (e) =>
    setPatient({ ...patient, [e.target.name]: e.target.value });

  return (
    <div>
      <SectionTitle
        eyebrow="ขั้นตอนที่ 3"
        title="ข้อมูลผู้ป่วย"
        desc="กรุณาตรวจสอบและกรอกข้อมูลให้ถูกต้อง"
      />

      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <InputField
              label="ชื่อ"
              name="firstName"
              value={patient.firstName}
              onChange={onChange}
              icon={<UserRound className="w-4 h-4" />}
              required
            />
            <InputField
              label="นามสกุล"
              name="lastName"
              value={patient.lastName}
              onChange={onChange}
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <InputField
              label="เบอร์โทรศัพท์"
              name="phone"
              value={patient.phone}
              onChange={onChange}
              placeholder="0XX-XXX-XXXX"
              icon={<Phone className="w-4 h-4" />}
              required
            />
            <InputField
              label="อีเมล"
              name="email"
              type="email"
              value={patient.email}
              onChange={onChange}
              icon={<Mail className="w-4 h-4" />}
              readOnly
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <InputField
              label="วันเกิด"
              type="date"
              name="birthDate"
              value={patient.birthDate}
              onChange={onChange}
              icon={<Cake className="w-4 h-4" />}
            />

            <Field label="เพศ">
              <select
                name="gender"
                value={patient.gender}
                onChange={onChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
              >
                <option value="">-- เลือกเพศ --</option>
                <option value="male">ชาย</option>
                <option value="female">หญิง</option>
                <option value="other">อื่น ๆ</option>
              </select>
            </Field>
          </div>

          <div className="flex items-start gap-2 text-sm text-blue-900 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <Info className="w-4 h-4 mt-0.5 shrink-0 text-blue-700" />
            <span>
              ข้อมูลที่กรอกจะใช้สำหรับการติดต่อกลับและยืนยันการนัดหมายเท่านั้น
            </span>
          </div>
        </div>

        <div className="lg:col-span-1">
          <BookingSummary
            doctor={doctor}
            schedule={schedule}
            service={service}
            symptom={symptom}
          />
        </div>
      </div>
    </div>
  );
}

/* -------------------- Step 4 -------------------- */
function StepFour({ done, doctor, schedule, service }) {
  const d = schedule ? new Date(schedule.availableDate) : null;
  const STATUS_TH = {
    PENDING: "รอติดต่อกลับ",
    APPROVED: "ยืนยันแล้ว",
    CANCELLED: "ยกเลิก",
  };
  return (
    <div className="text-center py-4">
      <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-12 h-12 text-blue-900" strokeWidth={2} />
      </div>

      <h2 className="mt-6 text-2xl font-bold text-slate-900">
        ส่งคำขอนัดหมายสำเร็จ
      </h2>
      <p className="mt-2 text-slate-500">
        เจ้าหน้าที่จะติดต่อกลับเพื่อยืนยันการนัดหมายในเร็วๆ นี้
      </p>

      <div className="mt-8 max-w-md mx-auto text-left">
        <div className="hb-card p-6">
          <SummaryRow
            label="บริการ"
            value={service?.title || "นัดหมายแพทย์"}
          />
          <SummaryRow
            label="สาขา"
            value={doctor?.specialty || "-"}
          />
          <SummaryRow
            label="แพทย์"
            value={doctor?.fullName || "-"}
          />
          <SummaryRow
            label="วันที่"
            value={
              d
                ? d.toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "-"
            }
          />
          <SummaryRow
            label="เวลา"
            value={
              schedule ? `${schedule.startTime} - ${schedule.endTime}` : "-"
            }
          />
          <SummaryRow
            label="สถานะ"
            value={
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-100">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                {STATUS_TH[done.status] || done.status}
              </span>
            }
          />
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/appointments"
          className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full bg-blue-900 text-white font-medium hover:bg-blue-950 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-900/20 transition"
        >
          <CalendarCheck className="w-4 h-4" />
          ดูการนัดหมายของฉัน
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 hover:-translate-y-0.5 transition"
        >
          กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );
}

/* -------------------- Shared -------------------- */
function SectionTitle({ eyebrow, title, desc }) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-800">
        {eyebrow}
      </span>
      <h2 className="mt-1.5 text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
        {title}
      </h2>
      {desc && <p className="mt-1 text-sm text-slate-500">{desc}</p>}
    </div>
  );
}

function SelectCard({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-5 rounded-2xl border transition ${
        active
          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
          : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 hover:-translate-y-0.5"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm text-slate-700 mb-2">{label}</label>
      {children}
    </div>
  );
}

function InputField({ label, icon, ...props }) {
  return (
    <Field label={label}>
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        <input
          {...props}
          className={`w-full px-4 py-3 ${icon ? "pl-10" : ""} rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition disabled:bg-slate-50 read-only:bg-slate-50 read-only:text-slate-500`}
        />
      </div>
    </Field>
  );
}

function EmptyHint({ children }) {
  return (
    <div className="text-sm text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
      {children}
    </div>
  );
}

function BookingSummary({ doctor, schedule, service, symptom }) {
  const d = schedule ? new Date(schedule.availableDate) : null;
  return (
    <div className="rounded-2xl bg-blue-50/60 border border-blue-100 p-5 sticky top-24">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-800">
        สรุปการจอง
      </div>
      <div className="mt-3 space-y-2 text-sm">
        <SummaryRow
          tight
          label="บริการ"
          value={service?.title || "-"}
        />
        <SummaryRow
          tight
          label="แพทย์"
          value={doctor ? doctor.fullName : "-"}
        />
        <SummaryRow
          tight
          label="สาขา"
          value={doctor ? doctor.specialty : "-"}
        />
        <SummaryRow
          tight
          label="วันที่"
          value={
            d
              ? d.toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "-"
          }
        />
        <SummaryRow
          tight
          label="เวลา"
          value={
            schedule ? `${schedule.startTime} - ${schedule.endTime}` : "-"
          }
        />
        {symptom && (
          <div className="pt-2 mt-2 border-t border-blue-100">
            <div className="text-xs text-slate-500">อาการ</div>
            <div className="text-slate-700">{symptom}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, tight }) {
  return (
    <div
      className={`flex items-start justify-between gap-4 ${
        tight ? "" : "py-2 border-b last:border-0 border-slate-100"
      }`}
    >
      <span className="text-slate-500 text-sm shrink-0">{label}</span>
      <span className="text-slate-900 font-medium text-sm text-right">
        {value}
      </span>
    </div>
  );
}
