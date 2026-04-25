export const incidentCreatedTemplate = ({ errorMessage, time, serviceUrl, serviceName }) => ({
  subject: `🚨 [INCIDENT] ${serviceName} is DOWN — ${new Date(time).toUTCString()}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #e0e0e0; border: 1px solid #333; border-radius: 6px; overflow: hidden;">
      <div style="background: #c0392b; padding: 20px 24px;">
        <h1 style="margin: 0; font-size: 20px; color: #fff; letter-spacing: 1px;">🚨 INCIDENT DETECTED</h1>
        <p style="margin: 4px 0 0; font-size: 13px; color: #f5b7b1;">StatusWatch Monitoring Alert</p>
      </div>
      <div style="padding: 24px;">
        <p style="margin: 0 0 16px; font-size: 15px; color: #ccc;">
          <strong style="color: #fff;">${serviceName}</strong> has gone <strong style="color: #ff4444;">DOWN</strong>. An incident has been automatically created and is currently <strong>ONGOING</strong>.
        </p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr style="border-bottom: 1px solid #222;">
            <td style="padding: 10px 8px; color: #888; width: 40%;">Service</td>
            <td style="padding: 10px 8px; color: #e0e0e0;">${serviceName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #222;">
            <td style="padding: 10px 8px; color: #888;">URL</td>
            <td style="padding: 10px 8px; color: #e0e0e0;">${serviceUrl}</td>
          </tr>
          <tr style="border-bottom: 1px solid #222;">
            <td style="padding: 10px 8px; color: #888;">Detected At</td>
            <td style="padding: 10px 8px; color: #e0e0e0;">${new Date(time).toUTCString()}</td>
          </tr>
          <tr style="border-bottom: 1px solid #222;">
            <td style="padding: 10px 8px; color: #888;">Reason</td>
            <td style="padding: 10px 8px; color: #ff6b6b;">${errorMessage || "Unknown error"}</td>
          </tr>
          <tr>
            <td style="padding: 10px 8px; color: #888;">Status</td>
            <td style="padding: 10px 8px;"><span style="background: #c0392b; color: #fff; padding: 2px 10px; border-radius: 3px; font-size: 12px; font-weight: bold;">ONGOING</span></td>
          </tr>
        </table>
        <p style="margin: 24px 0 0; font-size: 13px; color: #666;">You will receive another notification once the incident is resolved.</p>
      </div>
      <div style="background: #1a1a1a; padding: 14px 24px; font-size: 12px; color: #555; border-top: 1px solid #222;">
        This is an automated alert from <strong style="color: #888;">StatusWatch</strong>. Do not reply to this email.
      </div>
    </div>
  `,
});

export const incidentResolvedTemplate = ({ startedAt, resolvedAt, serviceUrl, serviceName }) => {
  const duration = Math.round((new Date(resolvedAt) - new Date(startedAt)) / 1000 / 60);
  return {
    subject: `✅ [RESOLVED] ${serviceName} is back UP — Incident Closed`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #e0e0e0; border: 1px solid #333; border-radius: 6px; overflow: hidden;">
        <div style="background: #1e8449; padding: 20px 24px;">
          <h1 style="margin: 0; font-size: 20px; color: #fff; letter-spacing: 1px;">✅ INCIDENT RESOLVED</h1>
          <p style="margin: 4px 0 0; font-size: 13px; color: #a9dfbf;">StatusWatch Monitoring Alert</p>
        </div>
        <div style="padding: 24px;">
          <p style="margin: 0 0 16px; font-size: 15px; color: #ccc;">
            <strong style="color: #fff;">${serviceName}</strong> is back <strong style="color: #00ff88;">UP</strong>. The incident has been automatically resolved.
          </p>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="border-bottom: 1px solid #222;">
              <td style="padding: 10px 8px; color: #888; width: 40%;">Service</td>
              <td style="padding: 10px 8px; color: #e0e0e0;">${serviceName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #222;">
              <td style="padding: 10px 8px; color: #888;">URL</td>
              <td style="padding: 10px 8px; color: #e0e0e0;">${serviceUrl}</td>
            </tr>
            <tr style="border-bottom: 1px solid #222;">
              <td style="padding: 10px 8px; color: #888;">Incident Started</td>
              <td style="padding: 10px 8px; color: #e0e0e0;">${new Date(startedAt).toUTCString()}</td>
            </tr>
            <tr style="border-bottom: 1px solid #222;">
              <td style="padding: 10px 8px; color: #888;">Resolved At</td>
              <td style="padding: 10px 8px; color: #e0e0e0;">${new Date(resolvedAt).toUTCString()}</td>
            </tr>
            <tr style="border-bottom: 1px solid #222;">
              <td style="padding: 10px 8px; color: #888;">Total Downtime</td>
              <td style="padding: 10px 8px; color: #f0b429;">${duration} minute${duration !== 1 ? "s" : ""}</td>
            </tr>
            <tr>
              <td style="padding: 10px 8px; color: #888;">Status</td>
              <td style="padding: 10px 8px;"><span style="background: #1e8449; color: #fff; padding: 2px 10px; border-radius: 3px; font-size: 12px; font-weight: bold;">RESOLVED</span></td>
            </tr>
          </table>
          <p style="margin: 24px 0 0; font-size: 13px; color: #666;">No further action required. Review your incident history on the dashboard.</p>
        </div>
        <div style="background: #1a1a1a; padding: 14px 24px; font-size: 12px; color: #555; border-top: 1px solid #222;">
          This is an automated alert from <strong style="color: #888;">StatusWatch</strong>. Do not reply to this email.
        </div>
      </div>
    `,
  };
};
