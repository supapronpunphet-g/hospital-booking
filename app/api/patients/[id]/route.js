import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const data = {};
    if (body.firstName !== undefined) data.firstName = body.firstName;
    if (body.lastName !== undefined) data.lastName = body.lastName;
    if (body.phone !== undefined) data.phone = body.phone || null;
    if (body.gender !== undefined) data.gender = body.gender || null;
    if (body.birthDate !== undefined)
      data.birthDate = body.birthDate ? new Date(body.birthDate) : null;

    const patient = await prisma.patient.update({
      where: { id: Number(id) },
      data,
    });
    return NextResponse.json(patient);
  } catch (e) {
    console.error("update patient error", e);
    return NextResponse.json(
      { error: "อัปเดตข้อมูลผู้ป่วยไม่สำเร็จ" },
      { status: 500 }
    );
  }
}
