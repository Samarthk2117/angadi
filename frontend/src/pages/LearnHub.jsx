import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import TopNav from '../components/TopNav';
import { BookOpen, Plus, X, Heart, MessageSquare, Link as LinkIcon, Video, FileText, GraduationCap, CircleHelp } from 'lucide-react';

const tabConfig = {
  videos: { label: 'Videos', icon: Video },
  articles: { label: 'Articles', icon: FileText },
  courses: { label: 'Courses', icon: GraduationCap },
  faqs: { label: 'FAQs', icon: CircleHelp },
};

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace('www.', '');

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const videoId = parsed.searchParams.get('v');
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts[0] === 'shorts' && parts[1]) return `https://www.youtube.com/embed/${parts[1]}`;
    }

    if (host === 'youtu.be') {
      const videoId = parsed.pathname.replace('/', '');
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch (error) {
    return null;
  }
  return null;
};

const LearnHub = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('faqs');

  const [courses, setCourses] = useState([]);
  const [videos, setVideos] = useState([]);
  const [articles, setArticles] = useState([]);
  const [faqs, setFaqs] = useState([]);

  const [expandedComments, setExpandedComments] = useState({});
  const [commentsData, setCommentsData] = useState({});
  const [newComment, setNewComment] = useState({});
  const [likingKey, setLikingKey] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [courseUrl, setCourseUrl] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [articleUrl, setArticleUrl] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [tags, setTags] = useState('');
  const [level, setLevel] = useState('');
  const [duration, setDuration] = useState('');
  const [readTime, setReadTime] = useState('');
  const [priority, setPriority] = useState('');

  const activeList = useMemo(() => {
    if (activeTab === 'courses') return courses;
    if (activeTab === 'videos') return videos;
    if (activeTab === 'articles') return articles;
    return faqs;
  }, [activeTab, courses, videos, articles, faqs]);

  const fetchCourses = async () => {
    const res = await api.get('/courses');
    setCourses(res.data || []);
  };

  const fetchLearn = async (type) => {
    const res = await api.get(`/learn/${type}`);
    if (type === 'videos') setVideos(res.data || []);
    if (type === 'articles') setArticles(res.data || []);
    if (type === 'faqs') setFaqs(res.data || []);
  };

  const refreshTab = async (tab) => {
    if (tab === 'courses') await fetchCourses();
    if (tab === 'videos' || tab === 'articles' || tab === 'faqs') await fetchLearn(tab);
  };

  useEffect(() => {
    refreshTab(activeTab).catch((err) => console.error('Error loading tab data:', err));
  }, [activeTab]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setCourseUrl('');
    setThumbnailFile(null);
    setVideoUrl('');
    setArticleUrl('');
    setQuestion('');
    setAnswer('');
    setTags('');
    setLevel('');
    setDuration('');
    setReadTime('');
    setPriority('');
  };

  const handleCreateContent = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'courses') {
        if (!title || !description) throw new Error('Title and description are required.');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('courseUrl', courseUrl);
        formData.append('authorName', user?.uid ? 'Verified Creator' : 'Anonymous Educator');
        if (thumbnailFile) formData.append('thumbnail', thumbnailFile);
        await api.post('/courses', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      if (activeTab === 'videos') {
        if (!title || !description || !videoUrl) throw new Error('Title, description, and video URL are required.');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('videoUrl', videoUrl);
        formData.append('category', category);
        formData.append('duration', duration);
        formData.append('level', level);
        formData.append('tags', tags);
        formData.append('authorName', user?.uid ? 'Verified Creator' : 'Anonymous Educator');
        if (thumbnailFile) formData.append('image', thumbnailFile);
        await api.post('/learn/videos', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      if (activeTab === 'articles') {
        if (!title || !description || !articleUrl) throw new Error('Title, summary, and article URL are required.');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('summary', description);
        formData.append('articleUrl', articleUrl);
        formData.append('category', category);
        formData.append('readTime', readTime);
        formData.append('level', level);
        formData.append('tags', tags);
        formData.append('authorName', user?.uid ? 'Verified Creator' : 'Anonymous Educator');
        if (thumbnailFile) formData.append('image', thumbnailFile);
        await api.post('/learn/articles', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      if (activeTab === 'faqs') {
        if (!question || !answer) throw new Error('Question and answer are required.');

        const payload = {
          question,
          answer,
          category,
          tags,
          priority,
          authorName: user?.uid ? 'Verified Creator' : 'Anonymous Educator',
        };
        await api.post('/learn/faqs', payload);
      }

      resetForm();
      setIsModalOpen(false);
      await refreshTab(activeTab);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to publish content.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (type, item) => {
    const key = `${type}-${item.id}`;
    if (likingKey === key) return;
    setLikingKey(key);

    try {
      if (type === 'courses') {
        await api.post(`/courses/${item.id}/like`, { userId: user?.uid || 'anonymous_user' });
        await fetchCourses();
      } else {
        await api.post(`/learn/${type}/${item.id}/like`, { userId: user?.uid || 'anonymous_user' });
        await fetchLearn(type);
      }
    } catch (err) {
      console.error('Like failed:', err);
    } finally {
      setLikingKey(null);
    }
  };

  const loadComments = async (type, itemId) => {
    try {
      const route = type === 'courses' ? `/courses/${itemId}/comments` : `/learn/${type}/${itemId}/comments`;
      const res = await api.get(route);
      setCommentsData((prev) => ({ ...prev, [`${type}-${itemId}`]: res.data || [] }));
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  const toggleComments = (type, itemId) => {
    const key = `${type}-${itemId}`;
    const isExpanded = !!expandedComments[key];
    setExpandedComments((prev) => ({ ...prev, [key]: !isExpanded }));
    if (!isExpanded) loadComments(type, itemId);
  };

  const handlePostComment = async (type, itemId) => {
    const key = `${type}-${itemId}`;
    const content = newComment[key];
    if (!content) return;

    try {
      const route = type === 'courses' ? `/courses/${itemId}/comments` : `/learn/${type}/${itemId}/comments`;
      await api.post(route, {
        content,
        authorName: user?.uid ? 'Verified Learner' : 'Anonymous Operator',
      });
      setNewComment((prev) => ({ ...prev, [key]: '' }));
      await loadComments(type, itemId);
      await refreshTab(type === 'courses' ? 'courses' : type);
    } catch (err) {
      console.error('Comment failed:', err);
    }
  };

  const emptyMessage = {
    videos: 'No videos yet. Creators can upload from the button above.',
    articles: 'No articles yet. Creators can upload from the button above.',
    courses: 'No courses yet. Creators can upload from the button above.',
    faqs: 'No FAQs yet. Creators can upload from the button above.',
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden px-4 pb-6 pt-28 sm:px-8 lg:px-12">
      <TopNav />
      <div className="pointer-events-none absolute inset-0 opacity-85">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -right-24 bottom-12 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
      </div>

      <main className="relative mx-auto w-full max-w-[1650px]">
        <section className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Learn Hub</h1>
            <p className="mt-2 text-xl text-gray-400">Videos, articles, FAQs and full courses curated by trusted creators.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary px-6 py-3">
            <Plus size={18} /> Become a creator
          </button>
        </section>

        <section className="mb-6 inline-flex rounded-xl border border-white/10 bg-[#111125] p-1">
          {Object.entries(tabConfig).map(([key, tab]) => {
            const Icon = tab.icon;
            const active = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  active ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </section>

        <section className="pb-20">
          {activeList.length === 0 ? (
            <div className="glass-panel p-16 text-center text-gray-400">{emptyMessage[activeTab]}</div>
          ) : (
            <div className="grid gap-5">
              {activeTab === 'faqs' &&
                faqs.map((faq) => (
                  <details key={faq.id} className="glass-panel p-4">
                    <summary className="cursor-pointer font-semibold text-cyan-200">{faq.question}</summary>
                    <p className="mt-2 text-sm text-gray-300">{faq.answer}</p>
                  </details>
                ))}

              {(activeTab === 'courses' || activeTab === 'videos' || activeTab === 'articles') &&
                activeList.map((item) => {
                  const key = `${activeTab}-${item.id}`;
                  const isCourse = activeTab === 'courses';
                  const link = isCourse ? item.courseUrl : activeTab === 'videos' ? item.videoUrl : item.articleUrl;
                  const videoEmbedUrl = activeTab === 'videos' ? getYouTubeEmbedUrl(link) : null;
                  const image = isCourse ? item.thumbnailUrl : activeTab === 'videos' ? item.thumbnailUrl : item.coverImageUrl;
                  const desc = isCourse ? item.description : activeTab === 'videos' ? item.description : item.summary;

                  return (
                    <article key={item.id} className="glass-panel p-5 sm:p-6">
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold">{item.title}</h3>
                          <p className="mt-1 text-xs text-gray-400">By {item.authorName || 'Anonymous Educator'}</p>
                        </div>
                        {item.category && <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200">{item.category}</span>}
                      </div>

                      <p className="mb-4 text-gray-200">{desc}</p>

                      {image && (
                        <div className="mb-4 overflow-hidden rounded-xl border border-white/15">
                          <img src={image} alt="content" className="max-h-[22rem] w-full object-contain bg-black/30" />
                        </div>
                      )}

                      {videoEmbedUrl && (
                        <div className="mb-4 max-w-2xl overflow-hidden rounded-xl border border-white/15 bg-black/40">
                          <iframe
                            src={videoEmbedUrl}
                            title={item.title || 'Video player'}
                            className="h-[260px] w-full sm:h-[320px]"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                          />
                        </div>
                      )}

                      {link && (
                        <a href={link} target="_blank" rel="noreferrer" className="mb-4 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-cyan-200 hover:bg-white/10">
                          <LinkIcon size={16} /> Open {activeTab === 'articles' ? 'Article' : activeTab === 'videos' ? 'Video' : 'Course'} Link
                        </a>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-5 border-t border-white/15 pt-4">
                        <button disabled={likingKey === key} onClick={() => handleLike(activeTab, item)} className={`flex items-center gap-2 text-sm ${likingKey === key ? 'opacity-50' : 'text-gray-300 hover:text-fuchsia-300'}`}>
                          <Heart size={18} className={item.likesCount > 0 ? 'fill-fuchsia-400 text-fuchsia-400' : ''} />
                          {item.likesCount || 0}
                        </button>

                        <button onClick={() => toggleComments(activeTab, item.id)} className="flex items-center gap-2 text-sm text-gray-300 hover:text-cyan-300">
                          <MessageSquare size={18} />
                          {item.commentsCount || 0}
                        </button>
                      </div>

                      {expandedComments[key] && (
                        <div className="mt-4 rounded-lg border border-white/10 bg-black/25 p-4">
                          <div className="mb-3 flex gap-2">
                            <input type="text" className="input-field py-2 text-sm" placeholder="Add your feedback..." value={newComment[key] || ''} onChange={(e) => setNewComment((prev) => ({ ...prev, [key]: e.target.value }))} />
                            <button onClick={() => handlePostComment(activeTab, item.id)} className="rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm">Post</button>
                          </div>
                          <div className="space-y-2">
                            {commentsData[key]?.length ? (
                              commentsData[key].map((comment) => (
                                <div key={comment.id} className="border-b border-white/5 pb-2 text-sm">
                                  <span className="mr-2 font-semibold text-cyan-300">{comment.authorName}:</span>
                                  <span className="text-gray-200">{comment.content}</span>
                                </div>
                              ))
                            ) : (
                              <div className="text-xs text-gray-500">No comments yet.</div>
                            )}
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
            </div>
          )}
        </section>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="glass-panel relative w-full max-w-lg p-8">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-white">
              <X size={24} />
            </button>
            <h2 className="mb-5 bg-gradient-to-r from-cyan-300 to-fuchsia-400 bg-clip-text text-2xl font-bold text-transparent">
              {activeTab === 'videos' && 'Upload Video'}
              {activeTab === 'articles' && 'Upload Article'}
              {activeTab === 'courses' && 'Upload Course'}
              {activeTab === 'faqs' && 'Add FAQ'}
            </h2>
            {error && <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

            <form onSubmit={handleCreateContent} className="flex flex-col gap-4">
              {activeTab === 'videos' && (
                <>
                  <input type="text" className="input-field" placeholder="Video title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  <textarea rows="3" className="input-field resize-y" placeholder="Video description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                  <input type="url" className="input-field" placeholder="Video URL" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} required />
                  <input type="text" className="input-field" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input type="text" className="input-field" placeholder="Duration (e.g. 12:30)" value={duration} onChange={(e) => setDuration(e.target.value)} />
                    <input type="text" className="input-field" placeholder="Level" value={level} onChange={(e) => setLevel(e.target.value)} />
                  </div>
                  <input type="text" className="input-field" placeholder="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
                </>
              )}

              {activeTab === 'articles' && (
                <>
                  <input type="text" className="input-field" placeholder="Article title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  <textarea rows="3" className="input-field resize-y" placeholder="Article summary" value={description} onChange={(e) => setDescription(e.target.value)} required />
                  <input type="url" className="input-field" placeholder="Article URL" value={articleUrl} onChange={(e) => setArticleUrl(e.target.value)} required />
                  <input type="text" className="input-field" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input type="text" className="input-field" placeholder="Read time (e.g. 6 min)" value={readTime} onChange={(e) => setReadTime(e.target.value)} />
                    <input type="text" className="input-field" placeholder="Level" value={level} onChange={(e) => setLevel(e.target.value)} />
                  </div>
                  <input type="text" className="input-field" placeholder="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
                </>
              )}

              {activeTab === 'courses' && (
                <>
                  <input type="text" className="input-field" placeholder="Course title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  <textarea rows="4" className="input-field resize-y" placeholder="What will learners get from this course?" value={description} onChange={(e) => setDescription(e.target.value)} required />
                  <input type="text" className="input-field" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
                  <input type="url" className="input-field" placeholder="Course URL (optional)" value={courseUrl} onChange={(e) => setCourseUrl(e.target.value)} />
                </>
              )}

              {activeTab === 'faqs' && (
                <>
                  <input type="text" className="input-field" placeholder="Question" value={question} onChange={(e) => setQuestion(e.target.value)} required />
                  <textarea rows="4" className="input-field resize-y" placeholder="Answer" value={answer} onChange={(e) => setAnswer(e.target.value)} required />
                  <input type="text" className="input-field" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input type="text" className="input-field" placeholder="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
                    <input type="number" className="input-field" placeholder="Priority" value={priority} onChange={(e) => setPriority(e.target.value)} />
                  </div>
                </>
              )}

              {activeTab !== 'faqs' && (
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/15 bg-black/25 px-4 py-3 hover:border-fuchsia-300">
                  <BookOpen size={18} className="text-fuchsia-300" />
                  <span className="truncate text-sm text-gray-300">{thumbnailFile ? thumbnailFile.name : 'Upload Thumbnail / Cover (optional)'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setThumbnailFile(e.target.files[0])} />
                </label>
              )}

              <button type="submit" className="btn-primary mt-2 w-full" disabled={loading}>
                {loading ? 'Uploading...' : `Publish ${tabConfig[activeTab].label.slice(0, -1)}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnHub;
