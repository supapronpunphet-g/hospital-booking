import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const specialty = searchParams.get("specialty");

  const doctors = await prisma.doctor.findMany({
    where: specialty ? { specialty } : undefined,
    orderBy: { id: "asc" },
  });
  return NextResponse.json(doctors);
}

export async function POST(req) {
  try {
    const { fullName, specialty, phone } = await req.json();
    if (!fullName || !specialty) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่อแพทย์และสาขา" },
        { status: 400 }
      );
    }
    const doctor = await prisma.doctor.create({
      data: { fullName, specialty, phone: phone || null },
    });
    return NextResponse.json(doctor);
  } catch (e) {
    console.error("create doctor error", e);
    return NextResponse.json(
      { error: "เพิ่มแพทย์ไม่สำเร็จ" },
      { status: 500 }
    );
  }
}
