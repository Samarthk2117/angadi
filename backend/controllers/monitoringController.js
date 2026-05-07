const { db } = require('../config/firebase');

const getRecentAlerts = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit || 5);
    const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 25) : 5;

    const snapshot = await db
      .collection('alerts')
      .orderBy('createdAt', 'desc')
      .limit(safeLimit)
      .get();

    const alerts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(alerts);
  } catch (error) {
    next(error);
  }
};

const getLatestAnalytics = async (req, res, next) => {
  try {
    const snapshot = await db
      .collection('analytics')
      .orderBy('generatedAt', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(200).json(null);
    }

    const doc = snapshot.docs[0];
    return res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecentAlerts,
  getLatestAnalytics,
};

