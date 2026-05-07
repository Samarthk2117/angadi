const { db, admin } = require('../config/firebase');

const TREND_KEYWORDS = {
  phishing: ['phishing', 'credential', 'login', 'account takeover'],
  otp_fraud: ['otp', 'one time password', 'verification code', '2fa code'],
  fake_links: ['fake link', 'short link', 'malicious url', 'suspicious url'],
  fake_job_scams: ['job scam', 'fake job', 'work from home scam', 'hr fraud'],
};

const normalizeText = (value) => String(value || '').toLowerCase();

const resolveCategory = (report) => {
  const declaredCategory = normalizeText(report.category || report.scamType || report.type);
  if (declaredCategory) return declaredCategory;

  const textBlob = normalizeText(
    `${report.title || ''} ${report.description || ''} ${report.message || ''} ${report.content || ''}`
  );

  for (const [category, words] of Object.entries(TREND_KEYWORDS)) {
    if (words.some((word) => textBlob.includes(word))) {
      return category;
    }
  }

  return 'unknown';
};

const detectTrendingCategories = (categoryCounts) => {
  const entries = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return [];

  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  const threshold = Math.max(2, Math.ceil(total * 0.2));

  return entries
    .filter(([, count]) => count >= threshold)
    .map(([category, count]) => ({ category, count }));
};

const generateAlertsFromReports = async () => {
  try {
    const snapshot = await db.collection('reports').get();
    if (snapshot.empty) {
      console.log('[Alerts] No reports found. Skipping alert generation.');
      return { generated: 0, totalReports: 0 };
    }

    const categoryCounts = {};
    const reports = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const resolvedCategory = resolveCategory(data);
      categoryCounts[resolvedCategory] = (categoryCounts[resolvedCategory] || 0) + 1;
      reports.push({ id: doc.id, ...data, resolvedCategory });
    });

    const trending = detectTrendingCategories(categoryCounts);
    if (!trending.length) {
      console.log('[Alerts] No trend crossed threshold.');
      return { generated: 0, totalReports: reports.length };
    }

    const batch = db.batch();
    const now = admin.firestore.Timestamp.now();

    trending.forEach((trend) => {
      const ref = db.collection('alerts').doc();
      batch.set(ref, {
        title: `Trending ${trend.category.replace(/_/g, ' ')}`,
        message: `${trend.count} reports indicate a rise in ${trend.category.replace(/_/g, ' ')} activity.`,
        category: trend.category,
        severity: trend.count >= 10 ? 'high' : trend.count >= 5 ? 'medium' : 'low',
        reportCount: trend.count,
        source: 'cron-6h-trend-monitor',
        status: 'active',
        createdAt: now,
      });
    });

    await batch.commit();
    console.log(`[Alerts] Generated ${trending.length} alerts from ${reports.length} reports.`);
    return { generated: trending.length, totalReports: reports.length };
  } catch (error) {
    console.error('[Alerts] Failed to generate alerts:', error);
    throw error;
  }
};

module.exports = {
  generateAlertsFromReports,
};

