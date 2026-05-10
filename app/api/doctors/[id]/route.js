import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req, { params }) {
  try {
    const { id } = await params;
    const doctorId = Number(id);
    await prisma.schedule.deleteMany({ where: { doctorId } });
    await prisma.appointment.deleteMany({ where: { doctorId } });
    await prisma.doctor.delete({ where: { id: doctorId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("delete doctor error", e);
    return NextResponse.json(
      { error: "ลบแพทย์ไม่สำเร็จ" },
      { status: 500 }
    );
  }
}
