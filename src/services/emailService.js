import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendEmail = async ({ subject, html }) => {
  try {
    console.log("📧 Sending email to:", process.env.SENDER_EMAIL);
    const info = await transporter.sendMail({
      from: `"StatusWatch" <${process.env.EMAIL}>`,
      to: process.env.SENDER_EMAIL,
      subject,
      html,
    });
    console.log("✅ Email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Email failed:", err.message);
  }
};
