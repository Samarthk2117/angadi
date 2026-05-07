const nodemailer = require('nodemailer');

const getTransporter = () => {
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailAppPassword) {
    throw new Error('Missing GMAIL_USER or GMAIL_APP_PASSWORD in environment.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });
};

const sendAlertEmail = async ({ to, subject, html }) => {
  const transporter = getTransporter();
  const fromName = process.env.ALERT_FROM_NAME || 'Sentinel Alerts';

  await transporter.sendMail({
    from: `"${fromName}" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = {
  sendAlertEmail,
};

