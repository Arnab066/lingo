import React from 'react';
import { Home, Trophy, ShoppingBag, User, Globe, Sparkles, LogOut } from 'lucide-react';
import { useSound } from '../hooks/useSound';

const Sidebar = ({ activeTab, setActiveTab, user, onLogout, onOpenPremium }) => {
  const { playClick } = useSound();

  const handleTabClick = (tabName) => {
    playClick();
    setActiveTab(tabName);
  };

  const isPremium = user?.isPremium;

  return (
    <div className="app-sidebar">
      <div className={`logo ${isPremium ? 'logo-super' : ''}`}>
        {isPremium ? <Sparkles size={28} /> : <span>🦉</span>}
        <span>Lingo</span>
      </div>

      <div className="sidebar-menu">
        <button 
          className={`menu-item ${activeTab === 'learn' ? (isPremium ? 'premium-active' : 'active') : ''}`}
          onClick={() => handleTabClick('learn')}
        >
          <Home size={22} />
          <span>Learn</span>
        </button>

        <button 
          className={`menu-item ${activeTab === 'languages' ? (isPremium ? 'premium-active' : 'active') : ''}`}
          onClick={() => handleTabClick('languages')}
        >
          <Globe size={22} />
          <span>Languages</span>
        </button>

        <button 
          className={`menu-item ${activeTab === 'leaderboard' ? (isPremium ? 'premium-active' : 'active') : ''}`}
          onClick={() => handleTabClick('leaderboard')}
        >
          <Trophy size={22} />
          <span>Leagues</span>
        </button>

        <button 
          className={`menu-item ${activeTab === 'shop' ? (isPremium ? 'premium-active' : 'active') : ''}`}
          onClick={() => handleTabClick('shop')}
        >
          <ShoppingBag size={22} />
          <span>Shop</span>
        </button>

        <button 
          className={`menu-item ${activeTab === 'profile' ? (isPremium ? 'premium-active' : 'active') : ''}`}
          onClick={() => handleTabClick('profile')}
        >
          <User size={22} />
          <span>Profile</span>
        </button>

        {isPremium ? (
          <div 
            className="menu-item super-tab" 
            style={{ 
              background: 'var(--color-super-gradient)', 
              color: '#ffffff',
              boxShadow: 'var(--color-super-glowing)',
              borderColor: 'transparent'
            }}
          >
            <Sparkles size={22} style={{ color: '#ffea00' }} />
            <span>Super Active</span>
          </div>
        ) : (
          <button 
            className="menu-item super-tab"
            onClick={() => { playClick(); onOpenPremium(); }}
          >
            <Sparkles size={22} style={{ animation: 'float 3s ease-in-out infinite' }} />
            <span>Get Super</span>
          </button>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="user-badge">
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: isPremium ? 'var(--color-super)' : 'var(--color-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: '900',
            fontSize: '14px',
            border: isPremium ? '2px solid #ffea00' : 'none'
          }}>
            {user?.username?.slice(0, 2).toUpperCase() || 'U'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '14px', fontWeight: '800' }}>{user?.username || 'User'}</span>
            <button className="logout-btn" onClick={() => { playClick(); onLogout(); }}>
              <LogOut size={12} style={{ display: 'inline', marginRight: '4px', verticalAlignment: 'middle' }} />
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
