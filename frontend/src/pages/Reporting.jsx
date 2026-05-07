import React from 'react';
import TopNav from '../components/TopNav';
import { PhoneCall, Link as LinkIcon, ShieldAlert, FileText, Lock, Landmark } from 'lucide-react';

const immediateSteps = [
  'Disconnect affected device from internet if suspicious activity is ongoing.',
  'Change passwords for email, banking, and social accounts from a safe device.',
  'Enable two-factor authentication on important accounts immediately.',
  'Call your bank/wallet support and request card/account freeze if money risk exists.',
  'Collect evidence: screenshots, transaction IDs, phone numbers, email headers, URLs.',
  'Report immediately on official cybercrime portal and helpline.',
];

const Reporting = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden px-4 pb-8 pt-28 sm:px-8 lg:px-12">
      <TopNav />
      <div className="pointer-events-none absolute inset-0 opacity-90">
        <div className="absolute left-[-14rem] top-[-8rem] h-[26rem] w-[26rem] rounded-full bg-cyan-400/20 blur-[120px]" />
        <div className="absolute right-[-12rem] top-[18%] h-[24rem] w-[24rem] rounded-full bg-fuchsia-500/20 blur-[120px]" />
      </div>

      <main className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="glass-panel p-8 sm:p-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-300/30 bg-red-400/10 px-4 py-1 text-sm font-semibold text-red-200">
            <ShieldAlert size={16} /> Incident Response
          </div>
          <h1 className="text-3xl font-extrabold sm:text-5xl">Cyber Incident Reporting</h1>
          <p className="mt-3 max-w-4xl text-gray-300">
            If a cyber incident happens, act fast. Use this page to follow recovery steps and report to official cybercrime channels.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <article className="glass-panel p-6 sm:p-8">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
              <PhoneCall size={22} className="text-cyan-300" /> Emergency Contacts
            </h2>
            <div className="space-y-3">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-gray-400">National Cybercrime Helpline (India)</p>
                <p className="text-2xl font-black text-cyan-200">1930</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-gray-400">Emergency Response</p>
                <p className="text-2xl font-black text-cyan-200">112</p>
              </div>
              <p className="text-xs text-gray-400">For financial fraud, call 1930 immediately to improve chances of fund hold/recovery.</p>
            </div>
          </article>

          <article className="glass-panel p-6 sm:p-8">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
              <LinkIcon size={22} className="text-cyan-300" /> Official Reporting Links
            </h2>
            <div className="space-y-3">
              <a
                href="https://cybercrime.gov.in/"
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl border border-white/10 bg-black/20 p-4 transition hover:border-cyan-300/40"
              >
                <p className="font-semibold text-cyan-200">National Cyber Crime Reporting Portal</p>
                <p className="mt-1 text-sm text-gray-300">https://cybercrime.gov.in/</p>
              </a>
              <a
                href="https://www.rbi.org.in/"
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl border border-white/10 bg-black/20 p-4 transition hover:border-cyan-300/40"
              >
                <p className="font-semibold text-cyan-200">RBI Consumer Awareness</p>
                <p className="mt-1 text-sm text-gray-300">Use for banking fraud awareness and guidance.</p>
              </a>
            </div>
          </article>
        </section>

        <section className="glass-panel p-6 sm:p-8">
          <h2 className="mb-4 text-2xl font-bold">What To Do Next (Step-by-Step)</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {immediateSteps.map((step, index) => (
              <div key={step} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-semibold tracking-widest text-cyan-300">STEP {index + 1}</p>
                <p className="mt-1 text-sm text-gray-200">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <article className="glass-panel p-6">
            <h3 className="mb-2 flex items-center gap-2 text-lg font-bold"><FileText size={18} className="text-cyan-300" /> Evidence Checklist</h3>
            <p className="text-sm text-gray-300">Keep screenshots, chat logs, account statements, UPI IDs, and suspect URLs. Evidence improves investigation quality.</p>
          </article>
          <article className="glass-panel p-6">
            <h3 className="mb-2 flex items-center gap-2 text-lg font-bold"><Lock size={18} className="text-cyan-300" /> Account Recovery</h3>
            <p className="text-sm text-gray-300">Log out from all sessions, reset compromised passwords, revoke unknown app access, and update recovery phone/email.</p>
          </article>
          <article className="glass-panel p-6">
            <h3 className="mb-2 flex items-center gap-2 text-lg font-bold"><Landmark size={18} className="text-cyan-300" /> Police Complaint</h3>
            <p className="text-sm text-gray-300">File a local police complaint with cyber portal acknowledgment and all evidence attachments for legal follow-up.</p>
          </article>
        </section>
      </main>
    </div>
  );
};

export default Reporting;

