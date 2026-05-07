const { db, admin } = require('../config/firebase');

const getSafetyTips = async (req, res, next) => {
  try {
    const snapshot = await db.collection('safetyTips').orderBy('createdAt', 'desc').get();
    const tips = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(tips);
  } catch (error) {
    next(error);
  }
};

const createSafetyTip = async (req, res, next) => {
  try {
    const { title, tip, category, authorName } = req.body;
    if (!title || !tip) {
      res.status(400);
      throw new Error('Title and tip are required.');
    }

    const payload = {
      title: String(title).trim(),
      tip: String(tip).trim(),
      category: category ? String(category).trim() : null,
      authorName: authorName || 'Anonymous Contributor',
      authorId: req.user?.uid || 'anonymous_user',
      likesCount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const ref = await db.collection('safetyTips').add(payload);
    res.status(201).json({ id: ref.id, ...payload });
  } catch (error) {
    next(error);
  }
};

const toggleSafetyTipLike = async (req, res, next) => {
  try {
    const { tipId } = req.params;
    const userId = req.user?.uid || req.body.userId || 'anonymous_user';
    const likeId = `${userId}_${tipId}`;

    const likeRef = db.collection('safetyTipLikes').doc(likeId);
    const tipRef = db.collection('safetyTips').doc(tipId);

    await db.runTransaction(async (tx) => {
      const [tipDoc, likeDoc] = await Promise.all([tx.get(tipRef), tx.get(likeRef)]);
      if (!tipDoc.exists) {
        throw new Error('Safety tip not found.');
      }

      const currentLikes = tipDoc.data().likesCount || 0;
      if (likeDoc.exists) {
        tx.delete(likeRef);
        tx.update(tipRef, { likesCount: Math.max(0, currentLikes - 1) });
      } else {
        tx.set(likeRef, {
          tipId,
          userId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        tx.update(tipRef, { likesCount: currentLikes + 1 });
      }
    });

    res.status(200).json({ message: 'Safety tip like toggled successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSafetyTips,
  createSafetyTip,
  toggleSafetyTipLike,
};

