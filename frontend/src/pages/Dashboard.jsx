import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ShieldAlert, LogOut, Send, Clock, Tag } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      // Sending request without auth requirement as per user request
      await api.post('/posts', { title, description, tag });
      setTitle('');
      setDescription('');
      setTag('');
      fetchPosts(); // Refresh feed
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <nav className="flex justify-between items-center pb-8 mb-8 border-b border-white/10">
        <div className="flex items-center gap-3">
          <ShieldAlert size={32} className="text-[#00f3ff]" />
          <h1 className="text-2xl font-bold text-[#00f3ff]">CyberHub Feed</h1>
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
            rows="4" 
            className="input-field resize-y"
            placeholder="Describe the threat vectors or share intelligence..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="w-full flex-1">
              <input 
                type="text" 
                className="input-field"
                placeholder="Tag (e.g. Malware, Phishing)" 
                value={tag} 
                onChange={(e) => setTag(e.target.value)}
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
            <div key={post.id} className="glass-panel p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20">
              <h3 className="text-xl font-semibold mb-2 text-white">{post.title}</h3>
              <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                {post.tag && (
                  <span className="flex items-center gap-1 bg-[#b026ff]/15 text-[#b026ff] px-2.5 py-1 rounded-md font-semibold">
                    <Tag size={12} /> {post.tag}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {post.createdAt ? new Date(post.createdAt._seconds * 1000).toLocaleString() : 'Just now'}
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed">{post.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
