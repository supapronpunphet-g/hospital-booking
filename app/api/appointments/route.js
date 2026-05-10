import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail, appointmentCreatedTemplate } from "@/lib/mail";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get("patientId");

  const appointments = await prisma.appointment.findMany({
    where: patientId ? { patientId: Number(patientId) } : undefined,
    include: {
      doctor: true,
      patient: true,
    },
    orderBy: { appointmentDate: "desc" },
  });
  return NextResponse.json(appointments);
}

export async function POST(req) {
  try {
    const {
      patientId,
      doctorId,
      appointmentDate,
      appointmentTime,
      symptom,
    } = await req.json();

    if (!patientId || !doctorId || !appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลการจองให้ครบ" },
        { status: 400 }
      );
    }

    const appt = await prisma.appointment.create({
      data: {
        patientId: Number(patientId),
        doctorId: Number(doctorId),
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        symptom: symptom || null,
        status: "PENDING",
      },
      include: {
        doctor: true,
        patient: { include: { user: true } },
      },
    });

    // ส่งอีเมลแจ้งผู้ป่วย — fail แล้วไม่ทำให้การจองพัง
    try {
      const email = appt.patient?.user?.email;
      if (email) {
        const tpl = appointmentCreatedTemplate(appt);
        await sendMail({ to: email, ...tpl });
      }
    } catch (mailErr) {
      console.error("[mail] send created notification failed:", mailErr);
    }

    return NextResponse.json(appt);
  } catch (e) {
    console.error("create appointment error", e);
    return NextResponse.json(
      { error: "ไม่สามารถสร้างนัดหมายได้" },
      { status: 500 }
    );
  }
}
