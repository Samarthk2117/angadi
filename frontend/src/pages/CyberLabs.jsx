import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, FlaskConical, Landmark, Users, BookOpen, Lock, Unlock, AlertTriangle, ShieldAlert, Mail, File, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const DDoSSimulation = ({ labConfig }) => {
  const [attackLevel, setAttackLevel] = useState(0);
  const [firewallEnabled, setFirewallEnabled] = useState(false);
  const [logs, setLogs] = useState(['> Normal business hours.']);
  const [bankStatus, setBankStatus] = useState('normal'); 
  
  const containerRef = useRef(null);
  const [entities, setEntities] = useState([]);
  const requestRef = useRef();

  const addLog = (msg) => {
    setLogs(prev => {
      const newLogs = [...prev, `> ${msg}`];
      return newLogs.slice(-5);
    });
  };

  useEffect(() => {
    let lastSpawnTime = Date.now();
    let lastBadSpawnTime = Date.now();

    const loop = () => {
      const now = Date.now();
      
      if (now - lastSpawnTime > 1500) {
        setEntities(prev => [...prev, { 
          id: Math.random(), type: 'good', x: 0, y: Math.random() * 80 + 10,
          speed: 0.4 + Math.random() * 0.2, stopX: 40 + Math.random() * 5 
        }]);
        lastSpawnTime = now;
      }

      if (attackLevel > 0) {
        const spawnRate = Math.max(30, 1000 - attackLevel * 10);
        if (now - lastBadSpawnTime > spawnRate) {
           setEntities(prev => [...prev, { 
             id: Math.random(), type: 'bad', x: 0, y: Math.random() * 80 + 10,
             speed: 0.5 + Math.random() * 0.3, stopX: 35 + Math.random() * 10
           }]);
           lastBadSpawnTime = now;
        }
      }

      setEntities(prev => {
        let newEntities = prev.map(e => {
          let nextX = e.x + e.speed;
          let nextY = e.y;

          if (!firewallEnabled && e.type === 'bad' && nextX >= e.stopX) {
             nextX = e.x; 
             nextY += (Math.random() - 0.5) * 1.5; 
          }
          
          if (!firewallEnabled && bankStatus === 'overwhelmed' && e.type === 'good' && nextX >= e.stopX - 5) {
             nextX = e.x;
             nextY += (Math.random() - 0.5) * 1.5;
          }

          nextY = Math.max(5, Math.min(95, nextY));
          return { ...e, x: nextX, y: nextY };
        }).filter(e => e.x < 100);

        newEntities = newEntities.filter(e => {
          if (firewallEnabled && e.type === 'bad' && e.x > 38) return false;
          return true;
        });

        if (newEntities.length > 300) newEntities = newEntities.slice(newEntities.length - 300);
        return newEntities;
      });

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [attackLevel, firewallEnabled, bankStatus]);

  useEffect(() => {
    const badNearBank = entities.filter(e => e.type === 'bad' && e.x >= 35).length;
    
    if (firewallEnabled && attackLevel > 0) {
      if (bankStatus !== 'secured') {
        setBankStatus('secured');
        addLog('Guards deployed: Fake crowd dispersed, doors clear.');
        addLog('Normal business hours.');
      }
    } else if (badNearBank > 30) {
      if (bankStatus !== 'overwhelmed') {
        setBankStatus('overwhelmed');
        addLog('Warning: Massive crowd blocking the doors!');
      }
    } else if (badNearBank > 10) {
      if (bankStatus !== 'crowded') {
        setBankStatus('crowded');
        addLog('Notice: Door becoming crowded.');
      }
    } else {
      if (bankStatus !== 'normal' && !firewallEnabled && attackLevel === 0) {
        setBankStatus('normal');
        addLog('Normal business hours.');
      }
    }
  }, [entities, firewallEnabled, attackLevel, bankStatus]);

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">DDoS Attack Simulator</h1>
      <p className="text-gray-400 mb-8">Understand how botnets overwhelm servers and how firewalls protect them.</p>
      <div className="mb-8 rounded-xl border border-cyan-300/20 bg-cyan-300/5 p-4 text-sm leading-relaxed text-gray-200">
        <p>
          Think of this like a real bank entrance. Normally, genuine customers can walk in and complete their work.
          In a DDoS attack, criminals send a huge fake crowd to the door at the same time. The goal is not to steal
          directly, but to cause chaos so real people cannot access the service.
        </p>
        <p className="mt-3">
          In this simulation, the <strong>Attack Level</strong> slider increases that fake crowd. You can then enable
          the <strong>Firewall</strong>, which behaves like trained security guards who block suspicious visitors and
          allow real customers to enter safely. This helps you understand why websites become slow or unavailable
          during attacks and how protection systems keep services running.
        </p>
      </div>

      <div className="bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden mb-8 shadow-lg">
        <div className="h-64 relative overflow-hidden bg-[#0d0d14]" ref={containerRef}>
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-10 w-36 h-36 bg-[#1a1a2e] rounded-2xl border-2 transition-colors duration-300 ${firewallEnabled ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : bankStatus === 'overwhelmed' ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse opacity-70' : 'border-white/10'}`}>
              <Landmark size={48} className={`transition-colors ${firewallEnabled ? 'text-green-400' : bankStatus === 'overwhelmed' ? 'text-red-500' : 'text-blue-400'}`} />
              <span className="font-bold text-xs mt-3 tracking-widest text-gray-300">BANK ENTRANCE</span>
              {firewallEnabled && (
                <div className="absolute -left-8 top-0 bottom-0 w-2 bg-green-500/50 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.8)]"></div>
              )}
            </div>

            {entities.map(e => (
              <div 
                key={e.id}
                className={`absolute transition-transform duration-75 ease-linear`}
                style={{ left: `${e.x}%`, top: `${e.y}%` }}
              >
                <Users size={16} className={e.type === 'bad' ? 'text-red-500' : 'text-[#3b82f6]'} />
                {e.type === 'bad' && e.x >= 35 && firewallEnabled && (
                  <span className="absolute -top-4 -left-2 text-[10px] text-red-400 font-bold whitespace-nowrap opacity-75">Blocked!</span>
                )}
              </div>
            ))}
        </div>

        <div className="bg-[#050505] p-4 border-t border-white/5 font-mono text-sm text-gray-400 min-h-[120px] flex flex-col justify-end">
            {logs.map((log, i) => (
              <div key={i} className={`${log.includes('Warning') ? 'text-red-400' : log.includes('Notice') ? 'text-yellow-400' : log.includes('Guards') ? 'text-green-400' : 'text-gray-500'}`}>{log}</div>
            ))}
        </div>

        <div className="p-6 bg-[#1a1a2e]/50 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/5">
            <div className="flex items-center gap-4 w-full md:w-1/2">
              <span className="text-sm font-medium whitespace-nowrap text-gray-300">Attack Level (Fake Crowd)</span>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={attackLevel} 
                onChange={(e) => setAttackLevel(Number(e.target.value))}
                className="w-full accent-red-500"
              />
              <span className="text-red-400 font-mono font-bold w-6">{attackLevel}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-300">Hire Security (Firewall)</span>
              <button 
                onClick={() => setFirewallEnabled(!firewallEnabled)}
                className={`w-14 h-7 rounded-full p-1 transition-colors ${firewallEnabled ? 'bg-green-500' : 'bg-gray-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${firewallEnabled ? 'translate-x-7' : 'translate-x-0'}`}></div>
              </button>
            </div>

            <button onClick={() => { setAttackLevel(0); setFirewallEnabled(false); setLogs(['> Normal business hours.']); setEntities([]); }} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap">
              Reset Day
            </button>
        </div>
      </div>
    </>
  );
};

const PhishingSimulation = () => {
  const [activeSite, setActiveSite] = useState('A');
  const [status, setStatus] = useState(null); // null, 'safe', 'hacked'
  const [hintActive, setHintActive] = useState(false);

  const siteA = {
    url: 'https://www.securebank.com',
    secure: true,
  };

  const siteB = {
    url: 'http://securebank-update-security-alert.com/login',
    secure: false,
  };

  const currentSite = activeSite === 'A' ? siteA : siteB;

  const handleTrust = (site) => {
    if (site === 'A') {
      setStatus('safe');
    } else {
      setStatus('hacked');
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Phishing Simulator</h1>
      <p className="text-gray-400 mb-8">Learn to identify fake websites by checking the URL.</p>
      <div className="mb-8 rounded-xl border border-cyan-300/20 bg-cyan-300/5 p-4 text-sm leading-relaxed text-gray-200">
        <p>
          Phishing is like a fake shop that looks exactly like a trusted brand. The page design may seem real, but
          the attacker is waiting for you to type your username, password, or bank details. Once shared, that
          information can be misused immediately.
        </p>
        <p className="mt-3">
          This simulation trains the most important habit: <strong>check the web address carefully</strong>. You will
          compare two similar-looking websites and decide which one is safe. Focus on small warning signs like odd
          extra words in the URL, missing secure lock, or unusual domain names. These checks take just a few seconds
          and can prevent major account compromise.
        </p>
      </div>

      <div className="bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden mb-8 shadow-lg p-6">
        <div className="bg-[#1a1a2e] rounded-xl border border-white/5 overflow-hidden flex flex-col h-[400px]">
          {/* Browser Top Bar */}
          <div className="bg-[#2a2a3e] p-4 flex items-center justify-center border-b border-white/5 relative">
            <div className="absolute left-4 flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className={`flex items-center gap-2 bg-[#12121a] px-4 py-2 rounded-full text-sm border transition-all duration-500 w-full max-w-lg ${hintActive && !currentSite.secure ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'border-white/10'}`}>
                {currentSite.secure ? <Lock size={14} className="text-green-500" /> : <Unlock size={14} className="text-gray-500" />}
                <span className={`font-mono truncate ${!currentSite.secure && hintActive ? 'text-red-400' : 'text-gray-300'}`}>{currentSite.url}</span>
            </div>
          </div>

          {/* Website Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
            <Landmark size={48} className="text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">SECURE BANK</h2>
            <p className="text-gray-400 mb-8">Please log in to continue</p>
            
            <div className="w-full max-w-xs space-y-4 opacity-30 pointer-events-none">
              <div className="text-xs text-gray-500 mb-1">Username</div>
              <div className="h-10 bg-white/5 rounded border border-white/10 mb-4"></div>
              <div className="text-xs text-gray-500 mb-1">Password</div>
              <div className="h-10 bg-white/5 rounded border border-white/10"></div>
              <div className="h-10 bg-blue-600 rounded mt-6"></div>
            </div>

            {/* Feedback Overlay */}
            {status && (
              <div className="absolute inset-0 bg-[#1a1a2e]/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
                  {status === 'safe' ? (
                    <div className="border border-green-500 bg-green-500/10 text-green-400 px-8 py-4 rounded-full font-bold shadow-[0_0_30px_rgba(34,197,94,0.3)] text-center text-lg">
                      Safe! You checked the URL and avoided the trap.
                    </div>
                  ) : (
                    <div className="border border-red-500 bg-red-500/10 text-red-400 px-8 py-4 rounded-full font-bold shadow-[0_0_30px_rgba(239,68,68,0.3)] text-center flex items-center gap-3 text-lg">
                      <AlertTriangle size={24} />
                      Hacked! You gave your credentials to a fake website.
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-400">Switch View</span>
            <button 
              onClick={() => { setActiveSite('A'); setStatus(null); setHintActive(false); }}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeSite === 'A' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
            >
              Website A
            </button>
            <button 
              onClick={() => { setActiveSite('B'); setStatus(null); setHintActive(false); }}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeSite === 'B' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
            >
              Website B
            </button>
            
            <button 
              onClick={() => setHintActive(true)}
              className="ml-auto px-6 py-2 rounded-lg text-sm bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-colors"
            >
              Get Hint
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
            <button onClick={() => handleTrust('A')} disabled={!!status} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Trust Website A
            </button>
            <button onClick={() => handleTrust('B')} disabled={!!status} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Trust Website B
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const RansomwareSimulation = () => {
  const [step, setStep] = useState(0); // 0: Idle, 1: Infecting, 2: Locked, 3: Demand
  const [defenses, setDefenses] = useState({
    shield: false,
    filter: false,
    backup: false
  });
  const [blocked, setBlocked] = useState(false);

  const startAttack = () => {
    if (step > 0) return;
    setStep(1);
    setBlocked(false);

    setTimeout(() => {
      if (defenses.shield || defenses.filter) {
        setBlocked(true);
      } else {
        setStep(2);
        setTimeout(() => {
          setStep(3);
        }, 1500);
      }
    }, 1500);
  };

  const reset = () => {
    setStep(0);
    setBlocked(false);
  };

  const restoreBackup = () => {
    if (defenses.backup) {
      reset();
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Digital City: Ransomware Defense</h1>
      <p className="text-gray-400 mb-8">Understand how ransomware locks your files and how backups save you.</p>
      <div className="mb-8 rounded-xl border border-cyan-300/20 bg-cyan-300/5 p-4 text-sm leading-relaxed text-gray-200">
        <p>
          Ransomware is a type of attack where criminals lock your files (photos, office documents, IDs, project data)
          and demand money to unlock them. It often starts from one careless click, such as opening a fake email
          attachment or downloading software from an untrusted source.
        </p>
        <p className="mt-3">
          In this simulation, you will see how an attack can spread and what defenses reduce damage:
          <strong> email filtering, protective shields, and backups</strong>. The key lesson is simple: prevention helps,
          but backups are your emergency recovery plan. If backups are ready, you can recover safely without depending
          on attackers.
        </p>
      </div>

      <div className="bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden mb-8 shadow-lg p-6 relative">
        <div className="h-[250px] bg-[#1a1a2e] rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-center bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]">
          
          <div className="absolute left-10 md:left-24 top-1/2 -translate-y-1/2 flex flex-col items-center">
             <div className="w-16 h-16 rounded-full border-2 border-red-500/50 flex items-center justify-center bg-red-500/10 z-10">
               <AlertTriangle size={32} className="text-red-500" />
             </div>
             <span className="mt-2 text-xs font-bold text-red-400">GIFT CARD OFFER</span>
          </div>

          <div className="absolute right-10 md:right-32 top-1/2 -translate-y-1/2 flex flex-col items-center">
             <div className="w-16 h-16 rounded-full border-2 border-blue-500/50 flex items-center justify-center bg-blue-500/10 z-10">
               <Users size={32} className="text-blue-400" />
             </div>
             <span className="mt-2 text-xs font-bold text-blue-400">USER</span>
             
             {step >= 2 && (
               <div className="absolute -top-12 flex gap-2 animate-bounce">
                 <div className="relative"><File size={24} className="text-gray-500"/><Lock size={12} className="text-red-500 absolute -bottom-1 -right-1"/></div>
                 <div className="relative -top-4"><File size={24} className="text-gray-500"/><Lock size={12} className="text-red-500 absolute -bottom-1 -right-1"/></div>
                 <div className="relative"><File size={24} className="text-gray-500"/><Lock size={12} className="text-red-500 absolute -bottom-1 -right-1"/></div>
               </div>
             )}
          </div>

          <div className="absolute left-32 right-40 top-1/2 h-0.5 bg-white/10 -translate-y-1/2 border-dashed border-t border-white/20"></div>

          {step > 0 && !blocked && step < 2 && (
            <div className="absolute left-32 top-1/2 -translate-y-1/2 animate-[slideRight_1.5s_linear_forwards]">
              <Mail size={24} className="text-red-500" />
            </div>
          )}

          {blocked && (
             <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20">
               <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg border border-green-500/50 font-bold flex items-center gap-2">
                  <ShieldAlert size={20} />
                  Threat Blocked
               </div>
             </div>
          )}

          {step === 3 && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black border-2 border-red-500 p-6 rounded-lg text-center shadow-[0_0_50px_rgba(239,68,68,0.4)] z-30 animate-in fade-in zoom-in">
               <h2 className="text-red-500 font-bold text-xl mb-2">!!! DEMAND !!!</h2>
               <p className="text-white mb-2">All files are LOCKED.</p>
               <p className="text-red-400 text-sm">Send Crypto-Coins now!</p>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-[#1a1a2e] p-6 rounded-xl border border-white/5">
             <h3 className="text-sm font-bold text-blue-400 mb-4 uppercase tracking-wider">-- Role: Conceptual User --</h3>
             <div className="space-y-4">
               <label className="flex items-center justify-between cursor-pointer">
                 <span className="flex items-center gap-2 text-gray-300 text-sm"><ShieldAlert size={16} className="text-blue-500"/> Fake Mailbox Shield</span>
                 <input type="checkbox" className="toggle" checked={defenses.shield} onChange={() => setDefenses(d => ({...d, shield: !d.shield}))}/>
               </label>
               <label className="flex items-center justify-between cursor-pointer">
                 <span className="flex items-center gap-2 text-gray-300 text-sm"><Lock size={16} className="text-blue-500"/> Trusted Filter</span>
                 <input type="checkbox" className="toggle" checked={defenses.filter} onChange={() => setDefenses(d => ({...d, filter: !d.filter}))}/>
               </label>
               <label className="flex items-center justify-between cursor-pointer">
                 <span className="flex items-center gap-2 text-gray-300 text-sm"><Database size={16} className="text-green-500"/> Fireproof Safe (Backup)</span>
                 <input type="checkbox" className="toggle" checked={defenses.backup} onChange={() => setDefenses(d => ({...d, backup: !d.backup}))}/>
               </label>
             </div>
           </div>

           <div className="bg-[#1a1a2e] p-6 rounded-xl border border-red-500/10">
             <h3 className="text-sm font-bold text-red-400 mb-4 uppercase tracking-wider">-- Role: Conceptual Attacker --</h3>
             
             {step === 0 || blocked ? (
               <button onClick={startAttack} className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 py-3 rounded-lg font-bold transition-colors">
                 {blocked ? 'Retry Attack' : 'Launch Attack'}
               </button>
             ) : step >= 2 ? (
               <div className="space-y-3">
                 <div className="w-full bg-red-900/50 text-red-300 border border-red-500/50 py-3 rounded-lg text-center font-bold">
                   System Locked!
                 </div>
                 {defenses.backup ? (
                    <button onClick={restoreBackup} className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/50 py-3 rounded-lg font-bold transition-colors animate-pulse">
                      Restore from Backup
                    </button>
                 ) : (
                    <button onClick={reset} className="w-full bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10 py-3 rounded-lg font-bold transition-colors">
                      Pay Ransom (Reset)
                    </button>
                 )}
               </div>
             ) : (
               <div className="w-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 py-3 rounded-lg text-center font-bold">
                 Infecting...
               </div>
             )}
           </div>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes slideRight {
            0% { left: 8rem; }
            100% { left: calc(100% - 10rem); }
          }
          .toggle {
            appearance: none;
            width: 40px;
            height: 20px;
            background: #334155;
            border-radius: 20px;
            position: relative;
            cursor: pointer;
            outline: none;
          }
          .toggle::after {
            content: '';
            position: absolute;
            top: 2px;
            left: 2px;
            width: 16px;
            height: 16px;
            background: white;
            border-radius: 50%;
            transition: 0.3s;
          }
          .toggle:checked {
            background: #3b82f6;
          }
          .toggle:checked::after {
            transform: translateX(20px);
          }
        `}} />
      </div>
    </>
  );
};

const CyberLabs = () => {
  const navigate = useNavigate();
  const [activeLab, setActiveLab] = useState('ddos');
  const [labConfig, setLabConfig] = useState(null);

  useEffect(() => {
    setLabConfig(null);
    const fetchLab = async () => {
      try {
        const res = await api.get(`/labs/${activeLab}`);
        setLabConfig(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLab();
  }, [activeLab]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Left Sidebar */}
      <div className="w-64 border-r border-white/10 p-6 flex flex-col hidden md:flex shrink-0">
        <div className="flex items-center gap-2 mb-8">
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white transition">
            <ChevronLeft size={24} />
          </button>
          <span className="text-xl font-bold tracking-wide">Sentinel Labs</span>
        </div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Available Labs</h3>
        <div className="flex flex-col gap-2">
          <div 
            onClick={() => setActiveLab('ddos')}
            className={`px-4 py-3 rounded-lg flex items-center gap-3 cursor-pointer transition ${activeLab === 'ddos' ? 'bg-[#aa3bff]/20 text-[#aa3bff] border border-[#aa3bff]/50' : 'text-gray-400 hover:bg-white/5 border border-transparent'}`}
          >
            <FlaskConical size={18} />
            <span className="font-medium text-sm">DDoS Attack</span>
          </div>
          <div 
            onClick={() => setActiveLab('phishing')}
            className={`px-4 py-3 rounded-lg flex items-center gap-3 cursor-pointer transition ${activeLab === 'phishing' ? 'bg-[#aa3bff]/20 text-[#aa3bff] border border-[#aa3bff]/50' : 'text-gray-400 hover:bg-white/5 border border-transparent'}`}
          >
             <AlertTriangle size={18} />
             <span className="font-medium text-sm">Phishing Simulation</span>
          </div>
          <div 
            onClick={() => setActiveLab('ransomware')}
            className={`px-4 py-3 rounded-lg flex items-center gap-3 cursor-pointer transition ${activeLab === 'ransomware' ? 'bg-[#aa3bff]/20 text-[#aa3bff] border border-[#aa3bff]/50' : 'text-gray-400 hover:bg-white/5 border border-transparent'}`}
          >
             <Lock size={18} />
             <span className="font-medium text-sm">Ransomware Defense</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto">
        {activeLab === 'ddos' ? (
          <DDoSSimulation labConfig={labConfig} />
        ) : activeLab === 'phishing' ? (
          <PhishingSimulation />
        ) : (
          <RansomwareSimulation />
        )}

        {/* Explanation Section */}
        {labConfig && (
          <div className="glass-panel p-8">
            <h2 className="text-xl font-bold mb-4 text-[#aa3bff] flex items-center gap-2">
              <BookOpen size={20} /> Under the Hood
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed whitespace-pre-wrap">
              {labConfig.explanation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CyberLabs;
