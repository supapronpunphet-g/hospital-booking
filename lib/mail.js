import nodemailer from "nodemailer";

let cachedTransport = null;

function getTransport() {
  if (cachedTransport) return cachedTransport;

  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;
  if (!user || !pass) return null;

  cachedTransport = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  return cachedTransport;
}

export async function sendMail({ to, subject, html, text }) {
  const transport = getTransport();
  if (!transport) {
    console.warn("[mail] MAIL_USER/MAIL_PASS not set — skip sending mail");
    return { skipped: true };
  }
  if (!to) {
    console.warn("[mail] missing recipient — skip");
    return { skipped: true };
  }

  const from = process.env.MAIL_FROM || process.env.MAIL_USER;

  const info = await transport.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
  return { messageId: info.messageId };
}

/* -------------------- Templates -------------------- */

function formatDate(d) {
  return new Date(d).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function layout({ heading, badgeLabel, badgeColor, intro, rowsHtml, footer }) {
  return `
  <div style="background:#f6f8fc;padding:32px 12px;font-family:'Helvetica Neue',Arial,sans-serif;color:#0f172a;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;box-shadow:0 12px 32px rgba(15,23,42,0.06);">
      <div style="background:linear-gradient(135deg,#1d4ed8 0%,#0b1f3a 100%);padding:28px 32px;color:#ffffff;">
        <div style="font-size:12px;letter-spacing:2px;color:#bfdbfe;">RANGSIT HOSPITAL</div>
        <div style="font-size:22px;font-weight:700;margin-top:6px;">${heading}</div>
      </div>

      <div style="padding:28px 32px;">
        <div style="display:inline-block;padding:6px 14px;border-radius:999px;background:${badgeColor.bg};color:${badgeColor.fg};font-size:12px;font-weight:600;border:1px solid ${badgeColor.border};">
          ${badgeLabel}
        </div>

        <p style="margin:18px 0 6px;color:#475569;font-size:14px;line-height:1.6;">
          ${intro}
        </p>

        <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:14px;">
          ${rowsHtml}
        </table>

        <p style="margin-top:24px;color:#64748b;font-size:13px;line-height:1.6;">
          ${footer}
        </p>
      </div>

      <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 32px;font-size:12px;color:#94a3b8;text-align:center;">
        © ${new Date().getFullYear()} Rangsit Hospital — ระบบจองนัดหมายแพทย์ออนไลน์
      </div>
    </div>
  </div>`;
}

function row(label, value) {
  return `
    <tr>
      <td style="padding:8px 0;color:#64748b;width:40%;vertical-align:top;">${label}</td>
      <td style="padding:8px 0;color:#0f172a;font-weight:600;">${value}</td>
    </tr>`;
}

function buildRows(appt) {
  return [
    row("แพทย์", `${appt.doctor.fullName} (${appt.doctor.specialty})`),
    row("วันที่", formatDate(appt.appointmentDate)),
    row("เวลา", appt.appointmentTime),
    appt.symptom ? row("อาการ/รายละเอียด", appt.symptom) : "",
    row("รหัสนัดหมาย", `#${appt.id}`),
  ].join("");
}

const COLOR = {
  pending: { bg: "#eff6ff", fg: "#1e3a8a", border: "#dbeafe" },
  approved: { bg: "#ecfdf5", fg: "#065f46", border: "#d1fae5" },
  cancelled: { bg: "#f1f5f9", fg: "#475569", border: "#e2e8f0" },
};

export function appointmentCreatedTemplate(appt) {
  const name = `${appt.patient.firstName} ${appt.patient.lastName}`.trim();
  const subject = `[Rangsit Hospital] ระบบได้รับคำขอนัดหมายของคุณแล้ว #${appt.id}`;
  const html = layout({
    heading: "เราได้รับคำขอนัดหมายของคุณแล้ว",
    badgeLabel: "สถานะ: รอการยืนยัน",
    badgeColor: COLOR.pending,
    intro: `เรียนคุณ <b>${name}</b><br/>ระบบได้รับคำขอนัดหมายของคุณเรียบร้อยแล้ว เจ้าหน้าที่จะติดต่อกลับเพื่อยืนยันการนัดหมายในเร็วๆ นี้`,
    rowsHtml: buildRows(appt),
    footer:
      "หากต้องการเปลี่ยนแปลงหรือยกเลิกนัดหมาย สามารถเข้าสู่ระบบและจัดการได้ที่หน้า “นัดหมายของฉัน”",
  });
  const text = [
    `เรียนคุณ ${name}`,
    `ระบบได้รับคำขอนัดหมายของคุณเรียบร้อยแล้ว`,
    `สถานะ: รอการยืนยัน`,
    `แพทย์: ${appt.doctor.fullName} (${appt.doctor.specialty})`,
    `วันที่: ${formatDate(appt.appointmentDate)}`,
    `เวลา: ${appt.appointmentTime}`,
    appt.symptom ? `อาการ: ${appt.symptom}` : "",
    `รหัสนัดหมาย: #${appt.id}`,
  ]
    .filter(Boolean)
    .join("\n");
  return { subject, html, text };
}

export function appointmentApprovedTemplate(appt) {
  const name = `${appt.patient.firstName} ${appt.patient.lastName}`.trim();
  const subject = `[Rangsit Hospital] นัดหมายของคุณได้รับการยืนยันแล้ว #${appt.id}`;
  const html = layout({
    heading: "นัดหมายของคุณได้รับการยืนยันแล้ว",
    badgeLabel: "สถานะ: ยืนยันแล้ว",
    badgeColor: COLOR.approved,
    intro: `เรียนคุณ <b>${name}</b><br/>เจ้าหน้าที่ได้ยืนยันนัดหมายของคุณเรียบร้อยแล้ว กรุณามาถึงโรงพยาบาลก่อนเวลานัด 15 นาที`,
    rowsHtml: buildRows(appt),
    footer:
      "หากไม่สามารถมาตามนัดได้ กรุณายกเลิกผ่านระบบล่วงหน้าอย่างน้อย 1 วัน",
  });
  const text = [
    `เรียนคุณ ${name}`,
    `นัดหมายของคุณได้รับการยืนยันแล้ว`,
    `แพทย์: ${appt.doctor.fullName} (${appt.doctor.specialty})`,
    `วันที่: ${formatDate(appt.appointmentDate)}`,
    `เวลา: ${appt.appointmentTime}`,
    `รหัสนัดหมาย: #${appt.id}`,
  ].join("\n");
  return { subject, html, text };
}

export function appointmentCancelledTemplate(appt) {
  const name = `${appt.patient.firstName} ${appt.patient.lastName}`.trim();
  const subject = `[Rangsit Hospital] นัดหมายของคุณถูกยกเลิก #${appt.id}`;
  const html = layout({
    heading: "นัดหมายของคุณถูกยกเลิกแล้ว",
    badgeLabel: "สถานะ: ยกเลิก",
    badgeColor: COLOR.cancelled,
    intro: `เรียนคุณ <b>${name}</b><br/>นัดหมายต่อไปนี้ของคุณได้ถูกยกเลิกแล้ว หากต้องการนัดใหม่ สามารถเข้าสู่ระบบเพื่อจองนัดได้อีกครั้ง`,
    rowsHtml: buildRows(appt),
    footer:
      "หากมีข้อสงสัยเกี่ยวกับการยกเลิก กรุณาติดต่อเจ้าหน้าที่ของโรงพยาบาล",
  });
  const text = [
    `เรียนคุณ ${name}`,
    `นัดหมายของคุณถูกยกเลิกแล้ว`,
    `แพทย์: ${appt.doctor.fullName} (${appt.doctor.specialty})`,
    `วันที่: ${formatDate(appt.appointmentDate)}`,
    `เวลา: ${appt.appointmentTime}`,
    `รหัสนัดหมาย: #${appt.id}`,
  ].join("\n");
  return { subject, html, text };
}
