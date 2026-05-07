import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import TopNav from '../components/TopNav';
import api from '../services/api';
import { Plus, X, Heart, Lightbulb } from 'lucide-react';

const SafetyTips = () => {
  const { user } = useContext(AuthContext);
  const [tips, setTips] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [tip, setTip] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [likingTipId, setLikingTipId] = useState(null);

  const fetchTips = async () => {
    try {
      const res = await api.get('/safety-tips');
      setTips(res.data || []);
    } catch (err) {
      console.error('Error fetching safety tips:', err);
    }
  };

  useEffect(() => {
    fetchTips();
  }, []);

  const handleCreateTip = async (e) => {
    e.preventDefault();
    if (!title || !tip) {
      setError('Title and tip are required.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.post('/safety-tips', {
        title,
        tip,
        category,
        authorName: user?.uid ? 'Verified User' : 'Anonymous Contributor',
      });

      setTitle('');
      setTip('');
      setCategory('');
      setIsModalOpen(false);
      fetchTips();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post tip.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (entry) => {
    if (likingTipId === entry.id) return;
    setLikingTipId(entry.id);

    try {
      await api.post(`/safety-tips/${entry.id}/like`, { userId: user?.uid || 'anonymous_user' });
      fetchTips();
    } catch (err) {
      console.error('Like toggle failed:', err);
    } finally {
      setLikingTipId(null);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden px-4 pb-8 pt-28 sm:px-8 lg:px-12">
      <TopNav />
      <div className="pointer-events-none absolute inset-0 opacity-90">
        <div className="absolute left-[-14rem] top-[-8rem] h-[26rem] w-[26rem] rounded-full bg-cyan-400/20 blur-[120px]" />
        <div className="absolute right-[-12rem] top-[18%] h-[24rem] w-[24rem] rounded-full bg-fuchsia-500/20 blur-[120px]" />
      </div>

      <main className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="glass-panel flex items-center justify-between p-8 sm:p-10">
          <div>
            <h1 className="text-3xl font-extrabold sm:text-5xl">Safety Tips</h1>
            <p className="mt-3 text-gray-300">Share quick cyber safety tips and help others stay protected.</p>
          </div>
          <Lightbulb size={34} className="text-cyan-300" />
        </section>

        <section className="grid gap-5 pb-20">
          {tips.length === 0 ? (
            <div className="glass-panel p-12 text-center text-gray-300">No tips yet. Be the first to post a safety tip.</div>
          ) : (
            tips.map((entry) => (
              <article key={entry.id} className="glass-panel p-6">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold">{entry.title}</h3>
                    <p className="mt-1 text-xs text-gray-400">By {entry.authorName || 'Anonymous Contributor'}</p>
                  </div>
                  {entry.category && (
                    <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200">
                      {entry.category}
                    </span>
                  )}
                </div>
                <p className="text-gray-200">{entry.tip}</p>
                <button
                  disabled={likingTipId === entry.id}
                  onClick={() => handleLike(entry)}
                  className={`mt-4 inline-flex items-center gap-2 text-sm ${likingTipId === entry.id ? 'opacity-50' : 'text-gray-300 hover:text-fuchsia-300'}`}
                >
                  <Heart size={18} className={entry.likesCount > 0 ? 'fill-fuchsia-400 text-fuchsia-400' : ''} />
                  {entry.likesCount || 0}
                </button>
              </article>
            ))
          )}
        </section>
      </main>

      <button onClick={() => setIsModalOpen(true)} className="btn-primary fixed bottom-7 right-6 z-40 rounded-full p-4 sm:right-8">
        <Plus size={30} />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="glass-panel relative w-full max-w-lg p-8">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-white">
              <X size={24} />
            </button>
            <h2 className="mb-5 bg-gradient-to-r from-cyan-300 to-fuchsia-400 bg-clip-text text-2xl font-bold text-transparent">Post Safety Tip</h2>
            {error && <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

            <form onSubmit={handleCreateTip} className="flex flex-col gap-4">
              <input type="text" className="input-field" placeholder="Tip title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <textarea rows="4" className="input-field resize-y" placeholder="Share your cyber safety tip..." value={tip} onChange={(e) => setTip(e.target.value)} required />
              <input type="text" className="input-field" placeholder="Category (optional)" value={category} onChange={(e) => setCategory(e.target.value)} />

              <button type="submit" className="btn-primary mt-2 w-full" disabled={loading}>
                {loading ? 'Posting...' : 'Publish Tip'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SafetyTips;

