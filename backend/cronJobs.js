const cron = require('node-cron');
const { generateAlertsFromReports } = require('./services/alertService');
const { generateWeeklyAnalytics } = require('./services/analyticsService');
const { cleanupOldReports } = require('./services/cleanupService');
const { sendIntervalUserAlerts } = require('./services/userAlertService');

let cronStarted = false;

const startCronJobs = () => {
  if (cronStarted) {
    console.log('[Cron] Jobs already started. Skipping duplicate initialization.');
    return;
  }

  // Every 6 hours (at minute 0): 00:00, 06:00, 12:00, 18:00
  cron.schedule('0 */6 * * * *', async () => {
    try {
      console.log('[Cron][6h Alerts] Started.');
      await generateAlertsFromReports();
      console.log('[Cron][6h Alerts] Completed.');
    } catch (error) {
      console.error('[Cron][6h Alerts] Failed:', error);
    }
  });

  // Every Sunday at 10:00 AM
  cron.schedule('0 10 * * 0', async () => {
    try {
      console.log('[Cron][Weekly Analytics] Started.');
      await generateWeeklyAnalytics();
      console.log('[Cron][Weekly Analytics] Completed.');
    } catch (error) {
      console.error('[Cron][Weekly Analytics] Failed:', error);
    }
  });

  // Daily at midnight (00:00)
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('[Cron][Daily Cleanup] Started.');
      await cleanupOldReports();
      console.log('[Cron][Daily Cleanup] Completed.');
    } catch (error) {
      console.error('[Cron][Daily Cleanup] Failed:', error);
    }
  });

  // Every 2 minutes (Demo)
  cron.schedule('*/2 * * * *', async () => {
    try {
      console.log('[Cron][2min User Alerts] Started.');
      await sendIntervalUserAlerts('2min');
      console.log('[Cron][2min User Alerts] Completed.');
    } catch (error) {
      console.error('[Cron][2min User Alerts] Failed:', error);
    }
  });

  cronStarted = true;
  console.log('[Cron] All schedules initialized successfully.');
};

module.exports = {
  startCronJobs,
};
