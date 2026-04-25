import Mailjet from "node-mailjet";

const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

export const sendEmail = async ({ subject, html }) => {
  try {
    console.log("📧 Sending email via Mailjet to:", process.env.SENDER_EMAIL);

    const request = mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: process.env.EMAIL,
            Name: "StatusWatch Monitoring",
          },
          To: [
            {
              Email: process.env.SENDER_EMAIL,
              Name: "Admin",
            },
          ],
          Subject: subject,
          HTMLPart: html,
        },
      ],
    });

    const result = await request;
    console.log("✅ Email sent via Mailjet:", result.body.Messages[0].Status);
  } catch (err) {
    console.error("❌ Mailjet email failed:", err.statusCode, err.message);
  }
};
