import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Clock, Tag, MessageSquare, Heart, Plus, X, Image as ImageIcon } from 'lucide-react';
import TopNav from '../components/TopNav';

const Community = () => {
  const { user } = useContext(AuthContext);

  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const [commentsData, setCommentsData] = useState({});
  const [newComment, setNewComment] = useState({});
  const [likingPostId, setLikingPostId] = useState(null);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/posts');
      setPosts(res.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      setError('Title and description are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('tag', tag);
      formData.append('authorName', user?.uid ? 'Verified User' : 'Anonymous Operator');

      if (imageFile) {
        formData.append('image', imageFile);
      }

      await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setTitle('');
      setDescription('');
      setTag('');
      setImageFile(null);
      setIsModalOpen(false);
      fetchPosts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (post) => {
    if (likingPostId === post.id) return;

    setLikingPostId(post.id);
    const userId = user?.uid || 'anonymous_user';

    try {
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, likesCount: p.likesCount + 1 } : p)));
      await api.post(`/posts/${post.id}/like`, { userId });
      fetchPosts();
    } catch (err) {
      console.error(err);
      fetchPosts();
    } finally {
      setLikingPostId(null);
    }
  };

  const loadComments = async (postId) => {
    try {
      const res = await api.get(`/posts/${postId}/comments`);
      setCommentsData((prev) => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleComments = (postId) => {
    const isExpanded = !!expandedComments[postId];
    setExpandedComments((prev) => ({ ...prev, [postId]: !isExpanded }));
    if (!isExpanded) loadComments(postId);
  };

  const handlePostComment = async (postId) => {
    const content = newComment[postId];
    if (!content) return;

    try {
      const authorName = user?.uid ? 'Verified User' : 'Anonymous Operator';
      await api.post(`/posts/${postId}/comments`, { content, authorName });
      setNewComment((prev) => ({ ...prev, [postId]: '' }));
      loadComments(postId);
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden px-4 pb-6 pt-28 sm:px-8 lg:px-12">
      <TopNav />
      <div className="pointer-events-none absolute inset-0 opacity-85">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -right-24 bottom-12 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
      </div>

      <main className="relative mx-auto w-full max-w-[1650px]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-200">Latest Intelligence</h2>
          <div className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-gray-300">{posts.length} posts</div>
        </div>

        <section className="grid gap-5 pb-28">
          {posts.length === 0 ? (
            <div className="glass-panel p-12 text-center text-gray-300">No intel available. Be the first to broadcast.</div>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="glass-panel p-5 sm:p-6 transition-all duration-300 hover:border-cyan-300/40">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">{post.title}</h3>
                    <div className="mt-1 text-xs text-gray-400">
                      Posted by <span className="font-medium text-gray-200">{post.authorName || 'Anonymous'}</span>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={12} />
                    {post.createdAt ? new Date(post.createdAt._seconds * 1000).toLocaleString() : 'Just now'}
                  </span>
                </div>

                <p className="mb-4 leading-relaxed text-gray-200">{post.description}</p>

                {post.imageUrl && (
                  <div className="mb-4 overflow-hidden rounded-xl border border-white/15">
                    <img src={post.imageUrl} alt="Attachment" className="max-h-[32rem] w-full object-contain bg-black/30" />
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-5 border-t border-white/15 pt-4">
                  <button
                    disabled={likingPostId === post.id}
                    onClick={() => handleLike(post)}
                    className={`flex items-center gap-2 text-sm transition ${
                      likingPostId === post.id ? 'cursor-not-allowed opacity-50' : 'text-gray-300 hover:text-fuchsia-300'
                    }`}
                  >
                    <Heart size={18} className={post.likesCount > 0 ? 'fill-fuchsia-400 text-fuchsia-400' : ''} />
                    {post.likesCount || 0}
                  </button>

                  <button onClick={() => toggleComments(post.id)} className="flex items-center gap-2 text-sm text-gray-300 transition hover:text-cyan-300">
                    <MessageSquare size={18} />
                    {post.commentsCount || 0}
                  </button>

                  {post.tag && (
                    <span className="ml-auto inline-flex items-center gap-1 rounded-md border border-fuchsia-400/20 bg-fuchsia-500/10 px-2.5 py-1 text-xs font-semibold text-fuchsia-300">
                      <Tag size={12} /> {post.tag}
                    </span>
                  )}
                </div>

                {expandedComments[post.id] && (
                  <div className="mt-4 rounded-lg border border-white/10 bg-black/25 p-4">
                    <div className="mb-4 flex gap-2">
                      <input
                        type="text"
                        className="input-field py-2 text-sm"
                        placeholder="Add a comment..."
                        value={newComment[post.id] || ''}
                        onChange={(e) => setNewComment((prev) => ({ ...prev, [post.id]: e.target.value }))}
                      />
                      <button onClick={() => handlePostComment(post.id)} className="rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/20">
                        Post
                      </button>
                    </div>

                    <div className="flex flex-col gap-3">
                      {commentsData[post.id]?.length > 0 ? (
                        commentsData[post.id].map((comment) => (
                          <div key={comment.id} className="border-b border-white/5 pb-2 text-sm">
                            <span className="mr-2 font-semibold text-cyan-300">{comment.authorName}:</span>
                            <span className="text-gray-200">{comment.content}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-xs text-gray-500">No comments yet.</div>
                      )}
                    </div>
                  </div>
                )}
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
            <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-gray-400 transition hover:text-white">
              <X size={24} />
            </button>

            <h2 className="mb-6 bg-gradient-to-r from-cyan-300 to-fuchsia-400 bg-clip-text text-2xl font-bold text-transparent">Broadcast Alert</h2>
            {error && <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

            <form onSubmit={handleCreatePost} className="flex flex-col gap-4">
              <input type="text" className="input-field" placeholder="Vulnerability Title..." value={title} onChange={(e) => setTitle(e.target.value)} required />
              <textarea
                rows="4"
                className="input-field resize-y"
                placeholder="Describe the threat vectors or share intelligence..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />

              <input type="text" className="input-field" placeholder="Tag (e.g. Malware, Phishing)" value={tag} onChange={(e) => setTag(e.target.value)} />

              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/15 bg-black/25 px-4 py-3 transition hover:border-fuchsia-300">
                <ImageIcon size={20} className="text-fuchsia-300" />
                <span className="truncate text-sm text-gray-300">{imageFile ? imageFile.name : 'Upload Image...'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files[0])} />
              </label>

              <button type="submit" className="btn-primary mt-2 w-full" disabled={loading}>
                {loading ? 'Broadcasting & Uploading...' : 'Broadcast'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
