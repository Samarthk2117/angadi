import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, displayName);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-10 sm:px-8">
      <div className="pointer-events-none absolute inset-0 opacity-75">
        <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
      </div>

      <div className="glass-panel relative w-full max-w-md p-8 sm:p-10">
        <div className="mb-6 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/40 bg-cyan-300/10">
            <Shield size={30} className="text-cyan-300" />
          </div>
          <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-300 to-fuchsia-400">
            CyberHub
          </h1>
          <p className="text-gray-300">{isLogin ? 'Welcome back, operator.' : 'Join the resistance.'}</p>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Alias</label>
              <input type="text" className="input-field" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Neo" required />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Email</label>
            <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="neo@matrix.com" required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Password</label>
            <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="........" required />
          </div>

          <button type="submit" className="btn-primary mt-2 w-full" disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'Initialize Session' : 'Register Securely'}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-gray-300">
          {isLogin ? "Don't have an access code? " : 'Already registered? '}
          <button className="font-semibold text-cyan-300 hover:underline" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
