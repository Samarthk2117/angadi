const { db, admin } = require('../config/firebase');

const normalize = (value) => String(value || '').trim().toLowerCase();

const generateWeeklyAnalytics = async () => {
  try {
    const snapshot = await db.collection('reports').get();

    if (snapshot.empty) {
      const emptyPayload = {
        totalReports: 0,
        mostReportedScamType: null,
        highRiskCategories: [],
        generatedAt: admin.firestore.Timestamp.now(),
        source: 'cron-weekly-analytics',
      };

      await db.collection('analytics').add(emptyPayload);
      console.log('[Analytics] No reports found. Stored empty analytics snapshot.');
      return emptyPayload;
    }

    const counts = {};
    let totalReports = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      const category = normalize(data.category || data.scamType || data.type || 'unknown');
      counts[category] = (counts[category] || 0) + 1;
      totalReports += 1;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const [topCategory = 'unknown', topCount = 0] = sorted[0] || [];
    const highRiskThreshold = Math.max(3, Math.ceil(totalReports * 0.15));
    const highRiskCategories = sorted
      .filter(([, count]) => count >= highRiskThreshold)
      .map(([category, count]) => ({ category, count }));

    const analyticsDoc = {
      totalReports,
      mostReportedScamType: topCategory,
      mostReportedScamTypeCount: topCount,
      highRiskCategories,
      categoryBreakdown: sorted.map(([category, count]) => ({ category, count })),
      generatedAt: admin.firestore.Timestamp.now(),
      source: 'cron-weekly-analytics',
    };

    await db.collection('analytics').add(analyticsDoc);
    console.log('[Analytics] Weekly analytics generated successfully.');
    return analyticsDoc;
  } catch (error) {
    console.error('[Analytics] Failed to generate weekly analytics:', error);
    throw error;
  }
};

module.exports = {
  generateWeeklyAnalytics,
};

