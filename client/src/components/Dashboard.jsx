import React, { useState } from 'react';
import { Gem, Heart, Sparkles, Trophy, BookOpen, Star, AlertCircle, ArrowRight, Shield, Award } from 'lucide-react';
import { useSound } from '../hooks/useSound';

const Dashboard = ({ 
  user, 
  activeTab, 
  setActiveTab, 
  onStartLesson, 
  onRefillHearts, 
  onOpenPremium, 
  token, 
  onProgressUpdate 
}) => {
  const { playClick } = useSound();
  const [selectedNode, setSelectedNode] = useState(null); // Node details popover
  const [shopMsg, setShopMsg] = useState('');
  const [shopError, setShopError] = useState('');

  // Define Unit roadmap data
  const units = [
    {
      id: 1,
      title: "Unit 1: Introduce Yourself",
      description: "Learn basic greetings, state your name, and ask simple questions.",
      nodes: [
        { id: "u1_n1", title: "Form Greetings", xp: 10, type: "normal" },
        { id: "u1_n2", title: "Say Names", xp: 10, type: "normal" },
        { id: "u1_n3", title: "Ask Questions", xp: 15, type: "star" },
      ]
    },
    {
      id: 2,
      title: "Unit 2: Order at a Cafe",
      description: "Ask for food, drinks, discuss prices, and thank servers.",
      nodes: [
        { id: "u2_n1", title: "Order Coffee", xp: 10, type: "normal" },
        { id: "u2_n2", title: "Order Bread", xp: 10, type: "normal" },
        { id: "u2_n3", title: "Ask for Bill", xp: 15, type: "star" },
      ]
    },
    {
      id: 3,
      title: "Unit 3: Travel & Directions",
      description: "Ask where landmarks are, order taxis, and explore hotels.",
      nodes: [
        { id: "u3_n1", title: "Locate Train Station", xp: 10, type: "normal" },
        { id: "u3_n2", title: "Find Hotel Rooms", xp: 10, type: "normal" },
        { id: "u3_n3", title: "Hail Taxi Rides", xp: 15, type: "star" },
      ]
    },
    {
      id: 4,
      title: "Unit 4: Family & Hobbies",
      description: "Discuss brothers, sisters, and detail your favorite sports.",
      nodes: [
        { id: "u4_n1", title: "Introduce Siblings", xp: 10, type: "normal" },
        { id: "u4_n2", title: "Sports Vocabulary", xp: 10, type: "normal" },
        { id: "u4_n3", title: "Weekend Hobbies", xp: 20, type: "star" },
      ]
    },
    {
      id: 5,
      title: "Unit 5: Advanced Conversation",
      description: "Talk about future careers, review books, and argue opinions.",
      nodes: [
        { id: "u5_n1", title: "Describe Professions", xp: 15, type: "normal" },
        { id: "u5_n2", title: "Review Literature", xp: 15, type: "normal" },
        { id: "u5_n3", title: "Debate Current Topics", xp: 25, type: "star" },
      ]
    }
  ];

  // Helper to check if node is unlocked
  const isNodeUnlocked = (nodeId) => {
    // Locate node index
    let allNodes = [];
    units.forEach(u => allNodes.push(...u.nodes));
    const idx = allNodes.findIndex(n => n.id === nodeId);
    if (idx === 0) return true; // First node is always unlocked
    
    // Check if the previous node is marked completed in user.progress
    const currentLang = user.selectedLanguage || 'es';
    const prevNode = allNodes[idx - 1];
    return user.progress?.[currentLang]?.[prevNode.id] === true;
  };

  const isNodeCompleted = (nodeId) => {
    const currentLang = user.selectedLanguage || 'es';
    return user.progress?.[currentLang]?.[nodeId] === true;
  };

  const handleNodeClick = (node, e) => {
    playClick();
    e.stopPropagation();
    if (!isNodeUnlocked(node.id)) return;
    
    if (selectedNode?.id === node.id) {
      setSelectedNode(null);
    } else {
      setSelectedNode(node);
    }
  };

  const handleStartNodeLesson = (node) => {
    playClick();
    setSelectedNode(null);
    if (user.hearts <= 0 && !user.isPremium) {
      alert("You don't have any hearts left! Refill hearts in the Shop or practice to continue.");
      setActiveTab('shop');
      return;
    }
    onStartLesson(node.id, node.xp);
  };

  // Mock Shop Item Purchase
  const buyHeartsWithGems = async () => {
    playClick();
    setShopError('');
    setShopMsg('');
    if (user.gems < 350) {
      setShopError("You don't have enough gems! You need 350 gems.");
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/progress/heart-refill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ method: 'gems' })
      });
      if (response.ok) {
        const data = await response.json();
        onProgressUpdate({ hearts: data.hearts, gems: data.gems });
        setShopMsg("Hearts successfully refilled to 5!");
      } else {
        setShopError("Server rejected heart purchase.");
      }
    } catch (e) {
      setShopError("Network error buying hearts.");
    }
  };

  const buyGemsPack = async () => {
    playClick();
    setShopMsg('');
    // Simulating free gem reward for testing or buying gems
    try {
      const response = await fetch('http://localhost:5000/api/progress/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ gemsGained: 500, xpGained: 0 })
      });
      if (response.ok) {
        const data = await response.json();
        onProgressUpdate({ gems: data.gems });
        setShopMsg("Purchased 500 Gems successfully!");
      }
    } catch (err) {
      setShopError("Failed to purchase gems pack.");
    }
  };

  // Leagues rankings
  const mockLeagueUsers = [
    { username: 'LingoMaster', xp: 420 },
    { username: 'PolyglotQueen', xp: 350 },
    { username: user.username, xp: user.xp, isUser: true },
    { username: 'OwlFanatic', xp: 180 },
    { username: 'VocabWarrior', xp: 90 },
  ].sort((a, b) => b.xp - a.xp);

  // Status Bar header renders
  const renderHeader = () => (
    <div className="status-header">
      <div className="status-stat stat-streak">
        <span>🔥</span>
        <span>{user.streak} days</span>
      </div>
      <div className="status-stat stat-gems">
        <span>💎</span>
        <span>{user.gems}</span>
      </div>
      <div className="status-stat stat-hearts" onClick={() => setActiveTab('shop')}>
        <span>❤️</span>
        <span>{user.isPremium ? '∞' : user.hearts}</span>
      </div>
      {user.isPremium ? (
        <div className="status-stat stat-premium">
          <Sparkles size={16} style={{ display: 'inline', marginRight: '4px' }} />
          <span>SUPER</span>
        </div>
      ) : (
        <button 
          onClick={onOpenPremium} 
          className="btn-3d btn-super" 
          style={{ padding: '8px 14px', fontSize: '12px' }}
        >
          Go Super
        </button>
      )}
    </div>
  );

  return (
    <div onClick={() => setSelectedNode(null)}>
      {renderHeader()}

      {/* LEARN ROADMAP TREE VIEW */}
      {activeTab === 'learn' && (
        <div className="dashboard-grid">
          <div className="progress-tree">
            {units.map((unit) => {
              const currentLang = user.selectedLanguage || 'es';
              const completedCount = unit.nodes.filter(n => isNodeCompleted(n.id)).length;
              const isUnitCompleted = completedCount === unit.nodes.length;

              return (
                <div key={unit.id} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
                  <div className={`unit-banner ${user.isPremium ? 'premium-banner' : ''}`}>
                    <h2>{unit.title}</h2>
                    <p>{unit.description}</p>
                    <div style={{ fontSize: '13px', marginTop: '6px', fontWeight: '800' }}>
                      Progress: {completedCount} / {unit.nodes.length} Levels Completed
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
                    {unit.nodes.map((node, index) => {
                      const unlocked = isNodeUnlocked(node.id);
                      const completed = isNodeCompleted(node.id);
                      const isActive = unlocked && !completed;

                      // Zigzag alignment margins
                      let marginShift = '0px';
                      if (index % 3 === 1) marginShift = '60px';
                      else if (index % 3 === 2) marginShift = '-60px';

                      return (
                        <div 
                          key={node.id} 
                          className="tree-node-row" 
                          style={{ marginLeft: marginShift, position: 'relative' }}
                        >
                          <button
                            className={`tree-node ${completed ? 'completed' : ''} ${isActive ? 'active' : ''} ${!unlocked ? 'locked' : ''}`}
                            onClick={(e) => handleNodeClick(node, e)}
                            disabled={!unlocked}
                          >
                            {node.type === 'star' ? <Star size={24} fill={completed ? '#fff' : 'none'} /> : <BookOpen size={24} />}
                            
                            {/* Unlocked and Inactive visual indicators */}
                            {!unlocked && (
                              <div style={{
                                position: 'absolute',
                                bottom: '-8px',
                                right: '-4px',
                                background: '#777777',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid #fff',
                                fontSize: '10px'
                              }}>🔒</div>
                            )}
                          </button>

                          {selectedNode?.id === node.id && (
                            <div className="node-tooltip" onClick={(e) => e.stopPropagation()}>
                              <h4 style={{ fontSize: '15px', fontWeight: '800' }}>{node.title}</h4>
                              <p style={{ fontSize: '12px', color: '#ccc' }}>Reward: +{node.xp} XP & +5 Gems</p>
                              <button 
                                className="btn-3d btn-green"
                                style={{ width: '100%', padding: '8px', fontSize: '12px' }}
                                onClick={() => handleStartNodeLesson(node)}
                              >
                                Start Lesson
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <hr style={{ width: '80%', border: 'none', borderBottom: '2px dashed var(--color-gray-light)', margin: '20px 0' }} />
                </div>
              );
            })}
          </div>

          {/* SIDEBAR WIDGETS PANEL */}
          <div className="dashboard-widgets">
            {/* Daily Quests */}
            <div className="widget-card">
              <h3>Daily Quests</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span>Gain 50 XP today</span>
                    <span>{Math.min(50, user.xp)} / 50 XP</span>
                  </div>
                  <div style={{ height: '8px', background: '#f1f1f1', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, (user.xp / 50) * 100)}%`, height: '100%', background: 'var(--color-orange)' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span>Complete 1 Lesson</span>
                    <span>{Object.values(user.progress?.[user.selectedLanguage || 'es'] || {}).length > 0 ? '1' : '0'} / 1</span>
                  </div>
                  <div style={{ height: '8px', background: '#f1f1f1', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: Object.values(user.progress?.[user.selectedLanguage || 'es'] || {}).length > 0 ? '100%' : '0%', height: '100%', background: 'var(--color-blue)' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Leaderboard Leagues widget */}
            <div className="widget-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3>Sapphire League</h3>
                <span style={{ fontSize: '11px', color: 'var(--color-gray-dark)' }}>Top 3 Promote</span>
              </div>
              <div>
                {mockLeagueUsers.map((item, idx) => (
                  <div 
                    key={item.username} 
                    className="leaderboard-row"
                    style={{ backgroundColor: item.isUser ? '#f5faff' : 'transparent', padding: item.isUser ? '6px 8px' : '6px 0', borderRadius: '8px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className={`leaderboard-rank leaderboard-rank-${idx+1}`}>{idx + 1}</span>
                      <span style={{ fontSize: '14px', fontWeight: item.isUser ? '800' : '700' }}>
                        {item.username} {item.isUser && '(You)'}
                      </span>
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--color-gray-dark)', fontWeight: '800' }}>
                      {item.xp} XP
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Advertisements Widget (Free-only) */}
            {!user.isPremium && (
              <div className="ads-widget">
                <div className="ads-header">Sponsored Advertisement</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', background: '#ffd875', borderRadius: '8px', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '20px' }}>🍕</div>
                  <div>
                    <strong style={{ fontSize: '12px' }}>Duo Pizza Delivery</strong>
                    <p style={{ fontSize: '10px' }}>Get 20% off using promo LINGO20!</p>
                  </div>
                </div>
                <div className="ads-remove-btn" onClick={onOpenPremium}>Remove ads with Super Lingo</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FULL LEAGUES LEADERBOARD TABS */}
      {activeTab === 'leaderboard' && (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <Trophy size={48} style={{ color: 'var(--color-orange)', marginBottom: '10px' }} />
            <h2 style={{ fontSize: '28px', fontWeight: '900' }}>Sapphire League</h2>
            <p style={{ color: 'var(--color-gray-dark)' }}>Compete weekly with language learners around the world.</p>
          </div>
          
          <div className="widget-card">
            {mockLeagueUsers.map((item, idx) => (
              <div 
                key={item.username}
                className="leaderboard-row"
                style={{ 
                  padding: '16px', 
                  backgroundColor: item.isUser ? '#f5faff' : 'transparent',
                  borderBottom: '2px solid var(--color-gray-light)',
                  borderRadius: item.isUser ? '12px' : '0px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span className={`leaderboard-rank leaderboard-rank-${idx+1}`} style={{ fontSize: '18px' }}>{idx + 1}</span>
                  <span style={{ fontSize: '16px', fontWeight: '800' }}>{item.username}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '16px', fontWeight: '900', color: 'var(--color-blue)' }}>{item.xp}</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-gray-dark)' }}>XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INTERACTIVE SHOP VIEW */}
      {activeTab === 'shop' && (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '8px' }}>Lingo Shop</h2>
          <p style={{ color: 'var(--color-gray-dark)', marginBottom: '30px' }}>Spend your hard-earned gems to power up your lessons.</p>
          
          {shopMsg && <div style={{ background: '#d7ffb8', color: '#46a302', padding: '14px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px' }}>{shopMsg}</div>}
          {shopError && <div className="auth-error">{shopError}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="widget-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <Heart size={36} fill="var(--color-red)" style={{ color: 'var(--color-red)' }} />
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '800' }}>Refill Hearts</h4>
                  <p style={{ fontSize: '13px', color: 'var(--color-gray-dark)' }}>Restore health back to 5 hearts.</p>
                </div>
              </div>
              {user.isPremium ? (
                <span style={{ color: 'var(--color-super)', fontWeight: '800' }}>Unlimited Active</span>
              ) : (
                <button onClick={buyHeartsWithGems} className="btn-3d btn-blue" style={{ padding: '8px 16px', fontSize: '13px' }}>
                  350 💎
                </button>
              )}
            </div>

            <div className="widget-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <Gem size={36} fill="var(--color-blue)" style={{ color: 'var(--color-blue)' }} />
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '800' }}>500 Gems Booster</h4>
                  <p style={{ fontSize: '13px', color: 'var(--color-gray-dark)' }}>Simulate purchasing more gems.</p>
                </div>
              </div>
              <button onClick={buyGemsPack} className="btn-3d btn-green" style={{ padding: '8px 16px', fontSize: '13px' }}>
                FREE BUY
              </button>
            </div>

            {!user.isPremium && (
              <div className="widget-card" style={{ 
                background: 'var(--color-super-gradient)', 
                color: '#ffffff', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                boxShadow: 'var(--color-super-glowing)'
              }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <Sparkles size={36} style={{ color: '#ffea00' }} />
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>Super Lingo Subscription</h4>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>Unlimited Hearts & Ad-free experience.</p>
                  </div>
                </div>
                <button onClick={onOpenPremium} className="btn-3d btn-gray" style={{ padding: '8px 16px', fontSize: '13px', color: 'var(--color-super)', fontWeight: '800' }}>
                  TRY FREE
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '20px' }}>My Profile</h2>
          
          <div className="widget-card" style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: user.isPremium ? 'var(--color-super)' : 'var(--color-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '36px',
              fontWeight: '900',
              border: user.isPremium ? '4px solid #ffea00' : 'none'
            }}>
              {user.username.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h3 style={{ fontSize: '24px', marginBottom: '4px' }}>{user.username}</h3>
              <p style={{ color: 'var(--color-gray-dark)', fontSize: '14px', marginBottom: '8px' }}>Joined Lingo: {new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
              {user.isPremium && (
                <span style={{ 
                  background: 'var(--color-super-gradient)', 
                  color: '#ffffff', 
                  padding: '4px 8px', 
                  borderRadius: '8px', 
                  fontSize: '12px',
                  boxShadow: 'var(--color-super-glowing)'
                }}>
                  Super Lingo Supporter
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="widget-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px' }}>🔥</div>
              <h4 style={{ fontSize: '14px', color: 'var(--color-gray-dark)', margin: '4px 0' }}>Streak</h4>
              <div style={{ fontSize: '20px', fontWeight: '900' }}>{user.streak} Days</div>
            </div>

            <div className="widget-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px' }}>⚡</div>
              <h4 style={{ fontSize: '14px', color: 'var(--color-gray-dark)', margin: '4px 0' }}>Total XP</h4>
              <div style={{ fontSize: '20px', fontWeight: '900' }}>{user.xp} XP</div>
            </div>
          </div>

          <h3 style={{ fontSize: '20px', margin: '30px 0 15px 0' }}>Unlocked Achievements</h3>
          <div className="widget-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <Award size={32} style={{ color: '#ffea00' }} />
              <div>
                <h4 style={{ fontSize: '15px' }}>First Word</h4>
                <p style={{ fontSize: '12px', color: 'var(--color-gray-dark)' }}>Completed your first quiz challenge.</p>
              </div>
            </div>
            {user.streak > 0 && (
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <Award size={32} style={{ color: '#ff9600' }} />
                <div>
                  <h4 style={{ fontSize: '15px' }}>Flame Keeper</h4>
                  <p style={{ fontSize: '12px', color: 'var(--color-gray-dark)' }}>Activated a daily lesson streak.</p>
                </div>
              </div>
            )}
            {user.isPremium && (
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <Shield size={32} style={{ color: '#854dff' }} />
                <div>
                  <h4 style={{ fontSize: '15px' }}>Super Ascended</h4>
                  <p style={{ fontSize: '12px', color: 'var(--color-gray-dark)' }}>Unlocked unlimited health subscription benefits.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
