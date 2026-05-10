import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const doctorId = searchParams.get("doctorId");

  const schedules = await prisma.schedule.findMany({
    where: doctorId ? { doctorId: Number(doctorId) } : undefined,
    include: { doctor: true },
    orderBy: { availableDate: "asc" },
  });
  return NextResponse.json(schedules);
}

export async function POST(req) {
  try {
    const { doctorId, availableDate, startTime, endTime } = await req.json();

    if (!doctorId || !availableDate || !startTime || !endTime) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลให้ครบ" },
        { status: 400 }
      );
    }

    const schedule = await prisma.schedule.create({
      data: {
        doctorId: Number(doctorId),
        availableDate: new Date(availableDate),
        startTime,
        endTime,
        status: "available",
      },
      include: { doctor: true },
    });
    return NextResponse.json(schedule);
  } catch (e) {
    console.error("create schedule error", e);
    return NextResponse.json(
      { error: "สร้างตารางเวรไม่สำเร็จ" },
      { status: 500 }
    );
  }
}
