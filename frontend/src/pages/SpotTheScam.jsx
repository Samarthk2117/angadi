import React, { useMemo, useState } from 'react';
import { RotateCcw, ShieldAlert, ShieldCheck, Trophy } from 'lucide-react';
import TopNav from '../components/TopNav';

const quizItems = [
  {
    id: 1,
    scenario: 'You receive an SMS: "Your bank account is blocked. Verify now at secure-bank-verify-login.net".',
    answer: 'scam',
    reason: 'Urgent pressure + suspicious domain is a classic phishing pattern.',
  },
  {
    id: 2,
    scenario: 'Your company IT asks you in Slack to reset password through the official SSO portal link pinned in #it-help.',
    answer: 'safe',
    reason: 'Trusted channel and official known portal reduce risk, though users should still verify sender.',
  },
  {
    id: 3,
    scenario: 'An unknown caller says your relative is in jail and asks for immediate UPI transfer to release them.',
    answer: 'scam',
    reason: 'Emotional manipulation and urgency are common social engineering red flags.',
  },
  {
    id: 4,
    scenario: 'You get an email from your real shopping app confirming an order you actually placed with correct invoice details.',
    answer: 'safe',
    reason: 'Expected transaction and matching details make this likely legitimate.',
  },
  {
    id: 5,
    scenario: 'A "security update" pop-up says your phone is infected and asks to install an APK from a random site.',
    answer: 'scam',
    reason: 'Random downloads outside official app stores are high risk.',
  },
  {
    id: 6,
    scenario: 'A colleague asks for a one-time MFA code because they are "locked out" and need urgent access.',
    answer: 'scam',
    reason: 'MFA codes should never be shared, even with known contacts.',
  },
];

const SpotTheScam = () => {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const current = quizItems[index];
  const progress = useMemo(() => Math.round(((index + 1) / quizItems.length) * 100), [index]);
  const finished = index >= quizItems.length - 1 && showResult;

  const handleAnswer = (choice) => {
    if (showResult) return;
    const isCorrect = choice === current.answer;
    setSelected(choice);
    setShowResult(true);
    if (isCorrect) {
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const nextQuestion = () => {
    if (index < quizItems.length - 1) {
      setIndex((prev) => prev + 1);
      setSelected(null);
      setShowResult(false);
    }
  };

  const restartQuiz = () => {
    setIndex(0);
    setScore(0);
    setStreak(0);
    setSelected(null);
    setShowResult(false);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden px-4 pb-8 pt-28 sm:px-8 lg:px-12">
      <TopNav />
      <div className="pointer-events-none absolute inset-0 opacity-85">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
      </div>

      <main className="relative mx-auto w-full max-w-5xl">
        <section className="glass-panel mb-6 p-6 sm:p-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-extrabold sm:text-4xl">Spot the Scam</h1>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm text-gray-200">
              <Trophy size={16} className="text-yellow-300" /> Score: {score}/{quizItems.length}
            </div>
          </div>
          <p className="text-gray-300">Choose if each situation is a real/legit interaction or a cyber scam attempt.</p>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
              <span>Question {index + 1} of {quizItems.length}</span>
              <span>Current streak: {streak}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-400 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </section>

        <section className="glass-panel p-6 sm:p-8">
          <p className="mb-6 text-lg leading-relaxed text-gray-100 sm:text-xl">{current.scenario}</p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={() => handleAnswer('safe')}
              className={`rounded-xl border px-4 py-3 text-left font-semibold transition ${
                selected === 'safe'
                  ? 'border-emerald-400 bg-emerald-400/10 text-emerald-200'
                  : 'border-white/15 bg-white/5 text-gray-200 hover:border-emerald-300/50'
              }`}
            >
              <span className="inline-flex items-center gap-2"><ShieldCheck size={18} /> Legit / Safe</span>
            </button>
            <button
              onClick={() => handleAnswer('scam')}
              className={`rounded-xl border px-4 py-3 text-left font-semibold transition ${
                selected === 'scam'
                  ? 'border-red-400 bg-red-400/10 text-red-200'
                  : 'border-white/15 bg-white/5 text-gray-200 hover:border-red-300/50'
              }`}
            >
              <span className="inline-flex items-center gap-2"><ShieldAlert size={18} /> Scam</span>
            </button>
          </div>

          {showResult && (
            <div className="mt-5 rounded-xl border border-white/15 bg-black/20 p-4">
              <p className={`font-semibold ${selected === current.answer ? 'text-emerald-300' : 'text-red-300'}`}>
                {selected === current.answer ? 'Correct.' : 'Not quite.'} {current.reason}
              </p>

              {!finished ? (
                <button onClick={nextQuestion} className="btn-primary mt-4">Next Question</button>
              ) : (
                <div className="mt-4">
                  <p className="text-gray-300">Quiz complete. You scored {score}/{quizItems.length}.</p>
                  <button onClick={restartQuiz} className="btn-secondary mt-3 inline-flex items-center gap-2">
                    <RotateCcw size={16} /> Play Again
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default SpotTheScam;
