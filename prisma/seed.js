import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const url = new URL(process.env.DATABASE_URL);
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: url.port ? Number(url.port) : 3306,
  user: decodeURIComponent(url.username || "root"),
  password: decodeURIComponent(url.password || ""),
  database: url.pathname.replace(/^\//, ""),
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

const DOCTORS = [
  { fullName: "นพ. สมชาย ใจดี", specialty: "อายุรกรรมทั่วไป", phone: "ห้อง 101 / 02-111-1101" },
  { fullName: "พญ. สุดาพร แสนสบาย", specialty: "อายุรกรรมทั่วไป", phone: "ห้อง 102 / 02-111-1102" },
  { fullName: "นพ. วิทยา ศุภลักษณ์", specialty: "หัวใจและหลอดเลือด", phone: "ห้อง 201 / 02-111-1201" },
  { fullName: "พญ. มาลี ทองใส", specialty: "หัวใจและหลอดเลือด", phone: "ห้อง 202 / 02-111-1202" },
  { fullName: "นพ. ประภาส ฉลาดเฉลียว", specialty: "สมองและระบบประสาท", phone: "ห้อง 301 / 02-111-1301" },
  { fullName: "นพ. ภาคิน ผ่าตัดเก่ง", specialty: "กระดูกและข้อ", phone: "ห้อง 401 / 02-111-1401" },
  { fullName: "พญ. สมหญิง รักษาดี", specialty: "เด็ก", phone: "ห้อง 501 / 02-111-1501" },
  { fullName: "พญ. อรพรรณ ปลื้มใจ", specialty: "เด็ก", phone: "ห้อง 502 / 02-111-1502" },
  { fullName: "พญ. นารีรัตน์ ศรีสุข", specialty: "สูตินรีเวช", phone: "ห้อง 601 / 02-111-1601" },
  { fullName: "พญ. กชกร ผิวใส", specialty: "ผิวหนัง", phone: "ห้อง 701 / 02-111-1701" },
  { fullName: "นพ. ธนพล ฟังชัด", specialty: "หู คอ จมูก", phone: "ห้อง 801 / 02-111-1801" },
  { fullName: "พญ. พิมพา มองเห็น", specialty: "ตา", phone: "ห้อง 802 / 02-111-1802" },
  { fullName: "ทพ. กิตติ ฟันสวย", specialty: "ทันตกรรม", phone: "ห้อง 901 / 02-111-1901" },
  { fullName: "นพ. อนันต์ จิตสบาย", specialty: "จิตเวช", phone: "ห้อง 902 / 02-111-1902" },
  { fullName: "นพ. รัฐกร ฟื้นฟู", specialty: "กายภาพบำบัด", phone: "ห้อง 1001 / 02-111-2001" },
  { fullName: "นพ. ปวริศ ย่อยอาหาร", specialty: "ทางเดินอาหาร", phone: "ห้อง 1101 / 02-111-2101" },
  { fullName: "พญ. ลัดดา ต่อมไทรอยด์", specialty: "เบาหวานและต่อมไร้ท่อ", phone: "ห้อง 1102 / 02-111-2102" },
  { fullName: "นพ. สิทธิชัย รักษามะเร็ง", specialty: "มะเร็งวิทยา", phone: "ห้อง 1201 / 02-111-2201" },
  { fullName: "นพ. นพดล ทางเดิน", specialty: "ระบบทางเดินปัสสาวะ", phone: "ห้อง 1301 / 02-111-2301" },
];

const TIME_SLOTS = [
  { startTime: "09:00", endTime: "10:00" },
  { startTime: "10:00", endTime: "11:00" },
  { startTime: "13:00", endTime: "14:00" },
  { startTime: "14:00", endTime: "15:00" },
  { startTime: "15:00", endTime: "16:00" },
];

async function main() {
  // 1) admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@hospital.com" },
    update: {},
    create: {
      email: "admin@hospital.com",
      password: "admin1234",
      role: "ADMIN",
    },
  });
  console.log("Admin:", admin.email, "/ password: admin1234");

  // 2) doctors
  for (const d of DOCTORS) {
    const exists = await prisma.doctor.findFirst({
      where: { fullName: d.fullName },
    });
    if (!exists) {
      await prisma.doctor.create({ data: d });
    } else {
      // update specialty/phone in case sample changed
      await prisma.doctor.update({
        where: { id: exists.id },
        data: { specialty: d.specialty, phone: d.phone },
      });
    }
  }
  console.log("Seeded doctors:", DOCTORS.length);

  // 3) schedules — give each doctor 3 future days × 3 random time slots
  const allDoctors = await prisma.doctor.findMany();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let scheduleCount = 0;
  for (const doc of allDoctors) {
    for (let i = 1; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // pick 3 different time slots per day
      const slots = [...TIME_SLOTS]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      for (const slot of slots) {
        const exists = await prisma.schedule.findFirst({
          where: {
            doctorId: doc.id,
            availableDate: date,
            startTime: slot.startTime,
          },
        });
        if (!exists) {
          await prisma.schedule.create({
            data: {
              doctorId: doc.id,
              availableDate: date,
              startTime: slot.startTime,
              endTime: slot.endTime,
              status: "available",
            },
          });
          scheduleCount++;
        }
      }
    }
  }
  console.log("New schedules added:", scheduleCount);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
