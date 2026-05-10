import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req, { params }) {
  try {
    const { id } = await params;
    await prisma.schedule.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("delete schedule error", e);
    return NextResponse.json(
      { error: "ลบตารางเวรไม่สำเร็จ" },
      { status: 500 }
    );
  }
}
