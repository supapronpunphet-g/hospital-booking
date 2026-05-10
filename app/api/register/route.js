import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, phone } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      );
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json(
        { error: "อีเมลนี้ถูกใช้งานแล้ว" },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        email,
        password,
        role: "PATIENT",
        patient: {
          create: {
            firstName,
            lastName,
            phone: phone || null,
          },
        },
      },
      include: { patient: true },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.patient?.firstName,
      lastName: user.patient?.lastName,
      patientId: user.patient?.id,
    });
  } catch (e) {
    console.error("register error", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสมัครสมาชิก" },
      { status: 500 }
    );
  }
}
