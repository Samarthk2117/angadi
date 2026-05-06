import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Gamepad2, BookOpen, MessageSquareWarning } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 md:p-16 flex flex-col items-center">
      
      {/* Header Section */}
      <div className="w-full max-w-6xl mb-12">
        <div className="flex items-center gap-2 mb-8">
          <Shield size={28} className="text-[#aa3bff]" />
          <span className="text-xl font-bold tracking-wide">Sentinel</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
          Everything you need to stay safe<br/>online
        </h1>
        <p className="text-gray-400 text-lg">
          Four pillars to build real cybersecurity instinct — not just trivia.
        </p>
      </div>

      {/* Grid Section */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        
        {/* Card 1: Community */}
        <div 
          onClick={() => navigate('/community')}
          className="bg-[#12121a] border border-white/5 rounded-2xl p-6 cursor-pointer transition-all hover:-translate-y-1 hover:border-[#aa3bff]/50 group flex flex-col"
        >
          <div className="bg-[#1a1a2e] w-12 h-12 rounded-xl flex items-center justify-center mb-6">
            <Users size={24} className="text-[#aa3bff]" />
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Community</p>
          <h2 className="text-xl font-bold text-white mb-3">Community</h2>
          <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
            Share scams you've spotted, ask questions, upvote the best advice — Twitter meets Reddit for cybersecurity.
          </p>
        </div>

        {/* Card 2: Spot the Scam */}
        <div className="bg-[#12121a] border border-white/5 rounded-2xl p-6 opacity-70 cursor-not-allowed flex flex-col">
          <div className="bg-[#1a1a2e] w-12 h-12 rounded-xl flex items-center justify-center mb-6">
            <Gamepad2 size={24} className="text-[#aa3bff]" />
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Game</p>
          <h2 className="text-xl font-bold text-white mb-3">Spot the Scam</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Gamified training: real-world examples — guess spam vs. legit, fraud vs. safe. Build instinct fast.
          </p>
        </div>

        {/* Card 3: Learn Hub */}
        <div className="bg-[#12121a] border border-white/5 rounded-2xl p-6 opacity-70 cursor-not-allowed flex flex-col">
          <div className="bg-[#1a1a2e] w-12 h-12 rounded-xl flex items-center justify-center mb-6">
            <BookOpen size={24} className="text-[#aa3bff]" />
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Library</p>
          <h2 className="text-xl font-bold text-white mb-3">Learn Hub</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Videos, articles, FAQs and full courses uploaded by trusted creators. Always growing.
          </p>
        </div>

        {/* Card 4: AI Phishing Tutor */}
        <div className="bg-[#12121a] border border-white/5 rounded-2xl p-6 opacity-70 cursor-not-allowed flex flex-col">
          <div className="bg-[#1a1a2e] w-12 h-12 rounded-xl flex items-center justify-center mb-6">
            <MessageSquareWarning size={24} className="text-[#aa3bff]" />
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Always-On</p>
          <h2 className="text-xl font-bold text-white mb-3">AI Phishing Tutor</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Paste any suspicious email. Sentinel breaks down red flags and teaches you the pattern.
          </p>
        </div>

      </div>

      {/* Bottom Banner */}
      <div className="w-full max-w-6xl">
        <div className="bg-gradient-to-r from-[#12121a] to-[#1a1a2e] border border-white/5 rounded-3xl p-10 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <Shield size={48} className="text-[#aa3bff]" />
            <h2 className="text-3xl md:text-4xl font-bold text-white">Start your training in 60 seconds</h2>
          </div>
          {/* subtle glow effect */}
          <div className="absolute right-0 bottom-0 w-64 h-64 bg-[#aa3bff]/20 blur-[100px] rounded-full pointer-events-none"></div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
