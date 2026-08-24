import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LanguageSelector from './components/LanguageSelector';
import Lesson from './components/Lesson';
import PremiumModal from './components/PremiumModal';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('lingo_token') || '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Navigation tabs: learn, languages, leaderboard, shop, profile
  const [activeTab, setActiveTab] = useState('learn');
  const [activeLesson, setActiveLesson] = useState(null); // { nodeId, xp }
  const [isPremiumOpen, setIsPremiumOpen] = useState(false);

  // Fetch current user details on boot or token changes
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // Token expired or invalid, sign out
          handleLogout();
        }
      } catch (err) {
        console.error("Failed to connect to backend api:", err);
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const handleAuthSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('lingo_token');
    setToken('');
    setUser(null);
    setActiveTab('learn');
    setActiveLesson(null);
  };

  const handleSelectLanguage = async (langCode) => {
    if (!user) return;
    try {
      const response = await fetch('http://localhost:5000/api/progress/select-language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ languageCode: langCode })
      });
      if (response.ok) {
        const data = await response.json();
        setUser({
          ...user,
          selectedLanguage: data.selectedLanguage,
          progress: data.progress
        });
        // Switch back to learning roadmap
        setActiveTab('learn');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartLesson = (nodeId, xp) => {
    setActiveLesson({ nodeId, xp });
  };

  const handleLessonComplete = (newXp, newGems, newProgress) => {
    setUser({
      ...user,
      xp: newXp,
      gems: newGems,
      progress: newProgress
    });
  };

  const handleProgressUpdate = (updatedFields) => {
    setUser({
      ...user,
      ...updatedFields
    });
  };

  const handleSubscribeSuccess = (isPremiumStatus) => {
    setUser({
      ...user,
      isPremium: isPremiumStatus,
      hearts: 5 // Unlimited visual representation
    });
  };

  if (loading) {
    return (
      <div className="landing-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #e5e5e5',
          borderTopColor: 'var(--color-green)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <h3 style={{ marginTop: '20px', fontWeight: '800', color: 'var(--color-gray-dark)' }}>Connecting to Lingo DB...</h3>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Not Authenticated screen
  if (!user) {
    return <LandingPage onAuthSuccess={handleAuthSuccess} />;
  }

  // Active Lesson Screen View
  if (activeLesson) {
    return (
      <Lesson
        languageCode={user.selectedLanguage || 'es'}
        nodeId={activeLesson.nodeId}
        xpReward={activeLesson.xp}
        user={user}
        token={token}
        onClose={() => setActiveLesson(null)}
        onLessonComplete={handleLessonComplete}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        onOpenPremium={() => setIsPremiumOpen(true)}
      />

      {/* Main Panel views */}
      <main className="main-content">
        {activeTab === 'languages' ? (
          <LanguageSelector
            currentLanguage={user.selectedLanguage || 'es'}
            onSelectLanguage={handleSelectLanguage}
          />
        ) : (
          <Dashboard
            user={user}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onStartLesson={handleStartLesson}
            onRefillHearts={handleProgressUpdate}
            onOpenPremium={() => setIsPremiumOpen(true)}
            token={token}
            onProgressUpdate={handleProgressUpdate}
          />
        )}
      </main>

      {/* Subscription Paywall Modal */}
      <PremiumModal
        isOpen={isPremiumOpen}
        onClose={() => setIsPremiumOpen(false)}
        onSubscribeSuccess={handleSubscribeSuccess}
        token={token}
      />
    </div>
  );
}

export default App;
