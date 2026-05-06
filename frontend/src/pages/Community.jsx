import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ShieldAlert, LogOut, Send, Clock, Tag, MessageSquare, Heart, ChevronLeft } from 'lucide-react';

const Community = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Expand states for comments
  const [expandedComments, setExpandedComments] = useState({});
  const [commentsData, setCommentsData] = useState({});
  const [newComment, setNewComment] = useState({});

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      setError('Title and description are required.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const authorName = user?.uid ? 'Verified User' : 'Anonymous Operator';
      await api.post('/posts', { title, description, tag, imageUrl, authorName });
      setTitle('');
      setDescription('');
      setTag('');
      setImageUrl('');
      fetchPosts(); 
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const userId = user?.uid || 'anonymous_user';
      await api.post(`/posts/${postId}/like`, { userId });
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const loadComments = async (postId) => {
    try {
      const res = await api.get(`/posts/${postId}/comments`);
      setCommentsData(prev => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleComments = (postId) => {
    const isExpanded = !!expandedComments[postId];
    setExpandedComments(prev => ({ ...prev, [postId]: !isExpanded }));
    
    if (!isExpanded) {
      loadComments(postId);
    }
  };

  const handlePostComment = async (postId) => {
    const content = newComment[postId];
    if (!content) return;

    try {
      const authorName = user?.uid ? 'Verified User' : 'Anonymous Operator';
      await api.post(`/posts/${postId}/comments`, { content, authorName });
      setNewComment(prev => ({ ...prev, [postId]: '' }));
      loadComments(postId);
      fetchPosts(); 
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <nav className="flex justify-between items-center pb-8 mb-8 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white transition">
            <ChevronLeft size={24} />
          </button>
          <ShieldAlert size={32} className="text-[#00f3ff]" />
          <h1 className="text-2xl font-bold text-[#00f3ff]">Community</h1>
        </div>
        
        {user ? (
          <button className="btn-secondary gap-2 px-4 py-2" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        ) : (
          <button className="btn-primary px-6 py-2" onClick={() => navigate('/login')}>
            Login
          </button>
        )}
      </nav>

      <div className="glass-panel p-8 mb-8">
        <h2 className="text-xl font-semibold mb-6">Broadcast an Alert</h2>
        {error && <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20 mb-4">{error}</div>}
        
        <form onSubmit={handleCreatePost} className="flex flex-col gap-4">
          <input 
            type="text" 
            className="input-field"
            placeholder="Vulnerability Title..." 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea 
            rows="3" 
            className="input-field resize-y"
            placeholder="Describe the threat vectors or share intelligence..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="w-full flex-1 flex flex-col sm:flex-row gap-4">
              <input 
                type="text" 
                className="input-field flex-1"
                placeholder="Tag (e.g. Malware)" 
                value={tag} 
                onChange={(e) => setTag(e.target.value)}
              />
              <input 
                type="text" 
                className="input-field flex-1"
                placeholder="Image URL (optional)" 
                value={imageUrl} 
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary w-full sm:w-auto" disabled={loading}>
              <Send size={18} /> {loading ? 'Broadcasting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>

      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold text-gray-400 mb-2">Latest Intelligence</h2>
        
        {posts.length === 0 ? (
          <div className="glass-panel p-12 text-center text-gray-400">
            No intel available. Be the first to broadcast.
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="glass-panel p-6 transition-all duration-300 hover:border-white/20">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{post.title}</h3>
                  <div className="text-xs text-gray-500 mt-1">
                    Posted by <span className="text-gray-300 font-medium">{post.authorName || 'Anonymous'}</span>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock size={12} />
                  {post.createdAt ? new Date(post.createdAt._seconds * 1000).toLocaleString() : 'Just now'}
                </span>
              </div>
              
              <p className="text-gray-300 leading-relaxed mb-4">{post.description}</p>
              
              {post.imageUrl && (
                <div className="mb-4 rounded-xl overflow-hidden border border-white/10">
                  <img src={post.imageUrl} alt="Attachment" className="w-full h-auto max-h-96 object-cover" />
                </div>
              )}

              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/10">
                <button 
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#b026ff] transition"
                >
                  <Heart size={18} className={post.likesCount > 0 ? "fill-[#b026ff] text-[#b026ff]" : ""} /> 
                  {post.likesCount || 0}
                </button>
                <button 
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#00f3ff] transition"
                >
                  <MessageSquare size={18} /> 
                  {post.commentsCount || 0}
                </button>
                {post.tag && (
                  <span className="ml-auto flex items-center gap-1 bg-[#b026ff]/15 text-[#b026ff] px-2.5 py-1 rounded-md text-xs font-semibold">
                    <Tag size={12} /> {post.tag}
                  </span>
                )}
              </div>

              {/* Comments Section */}
              {expandedComments[post.id] && (
                <div className="mt-4 pt-4 bg-black/20 rounded-lg p-4">
                  <div className="flex gap-2 mb-4">
                    <input 
                      type="text" 
                      className="input-field py-2 text-sm"
                      placeholder="Add a comment..."
                      value={newComment[post.id] || ''}
                      onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                    />
                    <button 
                      onClick={() => handlePostComment(post.id)}
                      className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                      Post
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    {commentsData[post.id]?.length > 0 ? (
                      commentsData[post.id].map(comment => (
                        <div key={comment.id} className="text-sm border-b border-white/5 pb-2">
                          <span className="font-semibold text-[#00f3ff] mr-2">{comment.authorName}:</span>
                          <span className="text-gray-300">{comment.content}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-gray-500 text-center">No comments yet.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Community;
