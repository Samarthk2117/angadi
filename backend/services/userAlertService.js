const { db } = require('../config/firebase');
const { sendAlertEmail } = require('./emailService');

const formatAlertLine = (alert) => {
  const title = alert.title || 'Cyber Alert';
  const message = alert.message || 'A new cybersecurity trend was detected.';
  const severity = alert.severity || 'low';
  return `<li><strong>${title}</strong> (${severity})<br/>${message}</li>`;
};

const getRecentAlerts = async (limit = 5) => {
  const snapshot = await db
    .collection('alerts')
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  if (snapshot.empty) return [];
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const getSubscribedUsers = async (interval = '2min') => {
  const snapshot = await db
    .collection('users')
    .where('alertsEnabled', '==', true)
    .where('alertInterval', '==', interval)
    .get();

  if (snapshot.empty) return [];
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((user) => user.email);
};

const sendIntervalUserAlerts = async (interval = '2min') => {
  const alerts = await getRecentAlerts(5);
  if (!alerts.length) {
    console.log(`[Email Alerts][${interval}] No alerts to send.`);
    return { sent: 0, skipped: 0 };
  }

  const users = await getSubscribedUsers(interval);
  if (!users.length) {
    console.log(`[Email Alerts][${interval}] No subscribed users found.`);
    return { sent: 0, skipped: 0 };
  }

  const subject = `Sentinel Alert Digest (${interval})`;
  const alertsHtml = alerts.map(formatAlertLine).join('');
  const html = `
    <div style="font-family:Arial,sans-serif;">
      <h2>Sentinel Cyber Alert Digest</h2>
      <p>Here are the latest cyber alerts detected by the platform:</p>
      <ul>${alertsHtml}</ul>
      <p style="color:#666;font-size:12px;">This is a test interval digest.</p>
    </div>
  `;

  let sent = 0;
  let skipped = 0;

  for (const user of users) {
    try {
      await sendAlertEmail({
        to: user.email,
        subject,
        html,
      });
      sent += 1;
    } catch (error) {
      skipped += 1;
      console.error(`[Email Alerts][${interval}] Failed for ${user.email}:`, error.message);
    }
  }

  console.log(`[Email Alerts][${interval}] Sent: ${sent}, Failed: ${skipped}`);
  return { sent, skipped };
};

module.exports = {
  sendIntervalUserAlerts,
};

