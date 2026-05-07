const chatProxy = async (req, res, next) => {
  try {
    const { history = [], score = 0, current_quiz = null, thread_id } = req.body || {};
    const upstreamUrl = process.env.CHATBOT_UPSTREAM_URL || 'http://127.0.0.1:8000/chat';

    const response = await fetch(upstreamUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        history,
        score,
        current_quiz,
        thread_id: thread_id || req.user?.uid || 'sentinel-user',
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(502).json({
        message: 'Chatbot service unavailable',
        details: text || `Upstream returned ${response.status}`,
      });
    }

    const data = await response.json();
    return res.status(200).json({
      message: data.message || 'No response from chatbot.',
      score: data.score ?? score,
      quiz: data.quiz ?? null,
    });
  } catch (error) {
    console.error('Chat proxy error:', error?.message || error);
    return res.status(503).json({
      message: 'Unable to connect to chatbot service.',
      hint: 'Start FastAPI app at http://127.0.0.1:8000 or set CHATBOT_UPSTREAM_URL.',
    });
  }
};

module.exports = { chatProxy };

