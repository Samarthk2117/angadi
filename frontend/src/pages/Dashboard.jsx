import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Gamepad2, BookOpen, MessageSquareWarning, FileWarning, Lightbulb, ArrowUpRight } from 'lucide-react';
import TopNav from '../components/TopNav';


const modules = [
  {
    title: 'Community',
    tag: 'Live',
    description: 'Share scam intel, discuss tactics, and upvote the best practical security advice in real time.',
    icon: Users,
    enabled: true,
    action: '/community',
  },
  {
    title: 'Spot the Scam',
    tag: 'Game',
    description: 'Train with real-world cases and sharpen instincts against phishing, fraud, and social engineering.',
    icon: Gamepad2,
    enabled: true,
    action: '/spot-the-scam',
  },
  {
    title: 'Learn Hub',
    tag: 'Library',
    description: 'Structured cybersecurity guides, videos, and explainers curated for practical daily defense.',
    icon: BookOpen,
    enabled: true,
    action: '/learn',
  },
  {
    title: 'CyberLabs',
    tag: 'Assistant',
    description: 'Run interactive cyber attack simulations including DDoS, phishing, and ransomware defense.',
    icon: MessageSquareWarning,
    enabled: true,
    action: '/cyberlabs',
  },
  {
    title: 'Reporting',
    tag: 'Action',
    description: 'If an incident happens, follow exact next steps, call helplines, and file official cybercrime reports.',
    icon: FileWarning,
    enabled: true,
    action: '/reporting',
  },
  {
    title: 'Safety Tips',
    tag: 'Social',
    description: 'Post quick cyber safety tips and help others by liking useful advice from the community.',
    icon: Lightbulb,
    enabled: true,
    action: '/safety-tips',
  },
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full overflow-hidden px-4 pb-8 pt-28 sm:px-8 lg:px-12">
      <TopNav />
      <div className="pointer-events-none absolute inset-0 opacity-90">
        <div className="absolute left-[-14rem] top-[-8rem] h-[26rem] w-[26rem] rounded-full bg-cyan-400/20 blur-[120px]" />
        <div className="absolute right-[-12rem] top-[18%] h-[24rem] w-[24rem] rounded-full bg-fuchsia-500/20 blur-[120px]" />
      </div>

      <main className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-8">
        <section className="glass-panel overflow-hidden p-8 sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-sm font-medium text-cyan-200">
                <Shield size={16} /> Sentinel Command
              </div>
              <h1 className="max-w-4xl text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                Security training that looks good and works in the real world.
              </h1>
              <p className="mt-4 max-w-3xl text-base text-gray-300 sm:text-lg">
                Choose a module, sharpen your instincts, and build team-level cyber awareness with practical scenarios.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-black/20 p-5 text-right">
              <p className="text-xs uppercase tracking-widest text-gray-400">Status</p>
              <p className="mt-2 text-3xl font-black text-cyan-300">6/6</p>
              <p className="text-sm text-gray-300">modules live</p>
            </div>
          </div>
        </section>

        <section className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <article
                key={module.title}
                onClick={() => module.enabled && module.action && navigate(module.action)}
                className={`group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 ${module.enabled
                    ? 'cursor-pointer border-cyan-300/20 bg-white/[0.04] hover:-translate-y-1 hover:border-cyan-300/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.35)]'
                    : 'cursor-not-allowed border-white/10 bg-white/[0.02] opacity-75'
                  }`}
              >
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-cyan-400/10 to-transparent" />
                <div className="relative">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-black/25">
                    <Icon size={22} className="text-cyan-300" />
                  </div>
                  <div className="mb-2 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-wider text-gray-300">
                    {module.tag}
                  </div>
                  <h2 className="text-2xl font-bold">{module.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-gray-300">{module.description}</p>
                  {module.enabled && <ArrowUpRight className="mt-6 text-cyan-300 transition group-hover:translate-x-1 group-hover:-translate-y-1" />}
                </div>
              </article>
            );
          })}
        </section>

      </main>


    </div>
  );
};

export default Dashboard;
