const { db, admin } = require('../config/firebase');

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const toMillisSafe = (value) => {
  if (!value) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (value._seconds) return value._seconds * 1000;
  if (typeof value === 'number') return value;
  return 0;
};

const cleanupOldReports = async () => {
  try {
    const cutoffMs = Date.now() - THIRTY_DAYS_MS;
    const snapshot = await db.collection('reports').get();

    if (snapshot.empty) {
      console.log('[Cleanup] No reports found.');
      return { removed: 0 };
    }

    const seenFingerprints = new Set();
    const toDeleteRefs = [];

    snapshot.forEach((doc) => {
      const report = doc.data();
      const createdAtMs = toMillisSafe(report.createdAt);
      const isOlderThan30Days = createdAtMs > 0 && createdAtMs < cutoffMs;
      const isExpired = report.expiresAt && toMillisSafe(report.expiresAt) < Date.now();
      const isSpam = report.isSpam === true || normalizeStatus(report.status) === 'spam';
      const fingerprint = String(report.fingerprint || report.hash || '').trim();
      const isDuplicate = fingerprint ? seenFingerprints.has(fingerprint) : false;

      if (fingerprint) seenFingerprints.add(fingerprint);

      // Requirement: remove spam/duplicate/expired reports older than 30 days.
      if (isOlderThan30Days && (isSpam || isDuplicate || isExpired)) {
        toDeleteRefs.push(doc.ref);
      }
    });

    if (!toDeleteRefs.length) {
      console.log('[Cleanup] No matching old reports to remove.');
      return { removed: 0 };
    }

    let batch = db.batch();
    let operationCount = 0;
    let removed = 0;

    for (const ref of toDeleteRefs) {
      batch.delete(ref);
      operationCount += 1;
      removed += 1;

      if (operationCount === 450) {
        await batch.commit();
        batch = db.batch();
        operationCount = 0;
      }
    }

    if (operationCount > 0) {
      await batch.commit();
    }

    console.log(`[Cleanup] Removed ${removed} old spam/duplicate/expired reports.`);
    return { removed };
  } catch (error) {
    console.error('[Cleanup] Cleanup job failed:', error);
    throw error;
  }
};

function normalizeStatus(value) {
  return String(value || '').trim().toLowerCase();
}

module.exports = {
  cleanupOldReports,
};

