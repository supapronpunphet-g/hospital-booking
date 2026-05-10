import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendMail,
  appointmentApprovedTemplate,
  appointmentCancelledTemplate,
} from "@/lib/mail";

const ALLOWED = ["PENDING", "APPROVED", "CANCELLED"];

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    if (!ALLOWED.includes(status)) {
      return NextResponse.json(
        { error: "สถานะไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const appt = await prisma.appointment.update({
      where: { id: Number(id) },
      data: { status },
      include: {
        doctor: true,
        patient: { include: { user: true } },
      },
    });

    // แจ้งเมลตามสถานะ — fail แล้วไม่ทำให้การ update พัง
    try {
      const email = appt.patient?.user?.email;
      if (email) {
        if (status === "APPROVED") {
          const tpl = appointmentApprovedTemplate(appt);
          await sendMail({ to: email, ...tpl });
        } else if (status === "CANCELLED") {
          const tpl = appointmentCancelledTemplate(appt);
          await sendMail({ to: email, ...tpl });
        }
      }
    } catch (mailErr) {
      console.error("[mail] send status notification failed:", mailErr);
    }

    return NextResponse.json(appt);
  } catch (e) {
    console.error("update appointment error", e);
    return NextResponse.json(
      { error: "อัปเดตสถานะไม่สำเร็จ" },
      { status: 500 }
    );
  }
}
