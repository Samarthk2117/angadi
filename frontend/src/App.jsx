import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Community from './pages/Community';
import LearnHub from './pages/LearnHub';
import Reporting from './pages/Reporting';
import SafetyTips from './pages/SafetyTips';
import SpotTheScam from './pages/SpotTheScam';
import CyberLabs from './pages/CyberLabs';
import CyberChat from './components/CyberChat';
import GoogleTranslateWidget from './components/GoogleTranslateWidget';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return null;
  }

  return user ? children : <Navigate to="/login" replace />;
};

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return null;
  }

  return user ? <Navigate to="/dashboard" replace /> : children;
};

const ChatbotMount = () => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading || !user || location.pathname === '/login') {
    return null;
  }

  return <CyberChat initialScore={0} />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <GoogleTranslateWidget />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <AuthPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/community"
            element={
              <ProtectedRoute>
                <Community />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learn"
            element={
              <ProtectedRoute>
                <LearnHub />
              </ProtectedRoute>
            }
          />
          <Route
            path="/spot-the-scam"
            element={
              <ProtectedRoute>
                <SpotTheScam />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cyberlabs"
            element={
              <ProtectedRoute>
                <CyberLabs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reporting"
            element={
              <ProtectedRoute>
                <Reporting />
              </ProtectedRoute>
            }
          />
          <Route
            path="/safety-tips"
            element={
              <ProtectedRoute>
                <SafetyTips />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <ChatbotMount />
      </Router>
    </AuthProvider>
  );
}

export default App;
