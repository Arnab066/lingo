import React, { useState, useEffect } from 'react';
import { useSound } from '../hooks/useSound';
import { generateLesson } from '../data/lessons';
import { X, Volume2, CheckCircle, AlertOctagon, Heart, Award, ArrowRight, ShieldClose } from 'lucide-react';
import confetti from 'canvas-confetti';

const Lesson = ({ languageCode, nodeId, xpReward, user, token, onClose, onLessonComplete }) => {
  const { playClick, playCorrect, playIncorrect, playVictory } = useSound();
  
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [heartsState, setHeartsState] = useState(user.hearts);
  
  // Quiz running states
  const [selectedOption, setSelectedOption] = useState(''); // MC questions
  const [selectedPills, setSelectedPills] = useState([]); // Word bank questions
  const [matchSelectedLeft, setMatchSelectedLeft] = useState(null); // Match pairs
  const [matchSelectedRight, setMatchSelectedRight] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]); // Array of matched pairIds
  
  const [checked, setChecked] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [lessonFailed, setLessonFailed] = useState(false);
  const [lessonFinished, setLessonFinished] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  // Generate the quiz session
  useEffect(() => {
    const lessonQuestions = generateLesson(languageCode);
    setQuestions(lessonQuestions);
  }, [languageCode]);

  const currentQuestion = questions[currentIdx];

  // TTS Speech Synthesis voice helper
  const speakTargetText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const langMap = {
        es: 'es-ES',
        fr: 'fr-FR',
        de: 'de-DE',
        ja: 'ja-JP',
        ko: 'ko-KR',
        it: 'it-IT',
        zh: 'zh-CN',
        pt: 'pt-PT',
        ru: 'ru-RU',
        hi: 'hi-IN',
        es_mx: 'es-MX'
      };
      utterance.lang = langMap[languageCode] || 'en-US';
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  // Trigger TTS voice immediately on listening cards loading
  useEffect(() => {
    if (currentQuestion?.type === 'listening') {
      setTimeout(() => {
        speakTargetText(currentQuestion.audioText);
      }, 500);
    }
  }, [currentIdx, currentQuestion]);

  // Handle Match Pairs Click
  const handleMatchClick = (item) => {
    playClick();
    if (matchedPairs.includes(item.pairId)) return;

    if (item.type === 'english') {
      setMatchSelectedLeft(item);
      // Auto check if right already selected
      if (matchSelectedRight) {
        checkMatch(item, matchSelectedRight);
      }
    } else {
      setMatchSelectedRight(item);
      if (matchSelectedLeft) {
        checkMatch(matchSelectedLeft, item);
      }
    }
  };

  const checkMatch = (leftItem, rightItem) => {
    if (leftItem.pairId === rightItem.pairId) {
      // Correct Match!
      setMatchedPairs([...matchedPairs, leftItem.pairId]);
      playClick(); // Small chime or tap
    } else {
      // Mismatch, reset selections after a brief pause
      setTimeout(() => {
        // Red flash in styling can be handled
      }, 200);
    }
    setMatchSelectedLeft(null);
    setMatchSelectedRight(null);
  };

  // Word Bank Pill handling
  const handlePillClick = (pill) => {
    playClick();
    if (selectedPills.some(p => p.id === pill.id)) {
      // Remove it from selected
      setSelectedPills(selectedPills.filter(p => p.id !== pill.id));
    } else {
      // Add it to selected
      setSelectedPills([...selectedPills, pill]);
    }
  };

  // Quiz submission validator
  const handleCheckAnswer = async () => {
    let isCorrect = false;

    if (currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'listening') {
      isCorrect = selectedOption === currentQuestion.correctAnswer;
    } 
    else if (currentQuestion.type === 'translate-wordbank' || currentQuestion.type === 'translate-target-to-english') {
      const userSentence = selectedPills.map(p => p.text).join(' ');
      isCorrect = userSentence.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();
    } 
    else if (currentQuestion.type === 'match-pairs') {
      isCorrect = matchedPairs.length === 5;
    }

    setChecked(true);
    setIsAnswerCorrect(isCorrect);

    if (isCorrect) {
      playCorrect();
    } else {
      playIncorrect();
      // Deduct health
      if (!user.isPremium) {
        const nextHearts = heartsState - 1;
        setHeartsState(nextHearts);
        
        // Save heart deduction in backend
        try {
          await fetch('http://localhost:5000/api/progress/heart-deduct', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (e) {
          console.error("Deduct heart failed on backend:", e);
        }

        if (nextHearts <= 0) {
          setLessonFailed(true);
        }
      }
    }
  };

  const handleContinue = () => {
    playClick();
    // Reset answers
    setSelectedOption('');
    setSelectedPills([]);
    setMatchedPairs([]);
    setChecked(false);
    setIsAnswerCorrect(false);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Quiz victory completed!
      handleVictoryCompletion();
    }
  };

  const handleVictoryCompletion = async () => {
    playVictory();
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
    setSavingProgress(true);

    try {
      const response = await fetch('http://localhost:5000/api/progress/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          xpGained: xpReward,
          gemsGained: 5,
          levelNodeId: nodeId
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Update user state globally in App.jsx
        onLessonComplete(data.xp, data.gems, data.progress);
        setLessonFinished(true);
      }
    } catch (e) {
      console.error(e);
      // Fallback update on connection error
      onLessonComplete(user.xp + xpReward, user.gems + 5, user.progress);
      setLessonFinished(true);
    }
    setSavingProgress(false);
  };

  if (questions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <h3 style={{ fontSize: '24px' }}>Loading lesson details...</h3>
      </div>
    );
  }

  // Hearts failed Screen
  if (lessonFailed) {
    return (
      <div className="victory-screen" style={{ justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ background: '#ffdfe0', padding: '30px', borderRadius: '50%', color: 'var(--color-red)', marginBottom: '10px' }}>
          <Heart size={64} fill="var(--color-red)" />
        </div>
        <h2 style={{ fontSize: '32px', color: 'var(--color-red)', fontWeight: '900' }}>No Hearts Left!</h2>
        <p style={{ color: 'var(--color-gray-dark)', maxWidth: '400px' }}>
          You made too many mistakes in this practice. You can practice skills to refill health, purchase a refill, or subscribe to Super Lingo for unlimited health.
        </p>
        <div style={{ display: 'flex', gap: '16px', width: '100%', maxWidth: '360px', marginTop: '20px' }}>
          <button onClick={onClose} className="btn-3d btn-gray" style={{ flex: 1, padding: '14px' }}>
            Quit
          </button>
          <button 
            onClick={() => { playClick(); onClose(); }} 
            className="btn-3d btn-blue" 
            style={{ flex: 1, padding: '14px' }}
          >
            Refill Shop
          </button>
        </div>
      </div>
    );
  }

  // Quiz victory completed Screen
  if (lessonFinished) {
    return (
      <div className="victory-screen" style={{ justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ background: '#fff9e6', padding: '30px', borderRadius: '50%', color: '#ffc800', marginBottom: '10px' }}>
          <Award size={64} />
        </div>
        <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#ffc800' }}>Lesson Complete!</h2>
        <p style={{ color: 'var(--color-gray-dark)' }}>Excellent progress! You're moving closer to fluency.</p>
        
        <div className="stats-summary-row">
          <div className="stat-summary-card xp">
            <span style={{ fontSize: '24px' }}>⚡</span>
            <span className="stat-summary-val">+{xpReward}</span>
            <span style={{ fontSize: '12px' }}>XP GAINED</span>
          </div>
          <div className="stat-summary-card gems">
            <span style={{ fontSize: '24px' }}>💎</span>
            <span className="stat-summary-val">+5</span>
            <span style={{ fontSize: '12px' }}>BONUS GEMS</span>
          </div>
        </div>

        <button 
          onClick={onClose} 
          className="btn-3d btn-green" 
          style={{ width: '100%', maxWidth: '320px', padding: '14px' }}
        >
          Continue to Path
        </button>
      </div>
    );
  }

  const progressPercent = ((currentIdx) / questions.length) * 100;

  return (
    <div className="lesson-container">
      {/* Quiz Header Bar */}
      <div className="lesson-header">
        <button onClick={onClose} className="lesson-close">
          <X size={24} />
        </button>
        
        <div className="lesson-progress-bar-bg">
          <div className="lesson-progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-red)', fontWeight: '800' }}>
          <Heart size={22} fill="var(--color-red)" />
          <span>{user.isPremium ? '∞' : heartsState}</span>
        </div>
      </div>

      {/* Main interactive area */}
      <div className="lesson-content">
        <h3 className="lesson-prompt">{currentQuestion.prompt}</h3>

        {/* 1. Multiple Choice */}
        {currentQuestion.type === 'multiple-choice' && (
          <div>
            <p style={{ fontSize: '18px', color: 'var(--color-gray-dark)', marginBottom: '24px' }}>
              {currentQuestion.question}
            </p>
            <div className="options-grid">
              {currentQuestion.options.map((opt, idx) => (
                <button
                  key={opt}
                  className={`option-card ${selectedOption === opt ? 'selected' : ''}`}
                  onClick={() => { playClick(); setSelectedOption(opt); }}
                  disabled={checked}
                >
                  <span className="option-number">{idx + 1}</span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2. Match Pairs */}
        {currentQuestion.type === 'match-pairs' && (
          <div className="match-pairs-container">
            <div className="match-column">
              {currentQuestion.pairs.left.map((item) => {
                const isMatched = matchedPairs.includes(item.pairId);
                const isSelected = matchSelectedLeft?.id === item.id;
                return (
                  <button
                    key={item.id}
                    className={`match-card ${isSelected ? 'selected' : ''} ${isMatched ? 'matched' : ''}`}
                    onClick={() => handleMatchClick(item)}
                    disabled={isMatched || checked}
                  >
                    {item.text}
                  </button>
                );
              })}
            </div>
            
            <div className="match-column">
              {currentQuestion.pairs.right.map((item) => {
                const isMatched = matchedPairs.includes(item.pairId);
                const isSelected = matchSelectedRight?.id === item.id;
                return (
                  <button
                    key={item.id}
                    className={`match-card ${isSelected ? 'selected' : ''} ${isMatched ? 'matched' : ''}`}
                    onClick={() => handleMatchClick(item)}
                    disabled={isMatched || checked}
                  >
                    {item.text}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Translate sentence to target using wordbank */}
        {currentQuestion.type === 'translate-wordbank' && (
          <div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{
                background: '#f1f1f1',
                borderRadius: '16px',
                padding: '16px 24px',
                position: 'relative'
              }}>
                <span style={{ fontSize: '18px' }}>{currentQuestion.englishSentence}</span>
              </div>
            </div>

            {/* Translation compilation drawer line */}
            <div className="translation-area">
              {selectedPills.map((pill) => (
                <button 
                  key={pill.id} 
                  className="pill-card"
                  onClick={() => handlePillClick(pill)}
                  disabled={checked}
                >
                  {pill.text}
                </button>
              ))}
            </div>

            {/* Word bank pills */}
            <div className="word-bank">
              {currentQuestion.wordBank.map((pill) => {
                const isUsed = selectedPills.some(p => p.id === pill.id);
                return (
                  <button
                    key={pill.id}
                    className={`pill-card ${isUsed ? 'used' : ''}`}
                    onClick={() => !isUsed && handlePillClick(pill)}
                    disabled={isUsed || checked}
                  >
                    {pill.text}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Listening spelling question */}
        {currentQuestion.type === 'listening' && (
          <div style={{ textAlign: 'center' }}>
            <button 
              className="audio-player-button" 
              onClick={() => speakTargetText(currentQuestion.audioText)}
            >
              <Volume2 size={40} />
            </button>
            <p style={{ color: 'var(--color-gray-dark)', marginBottom: '30px', fontSize: '14px' }}>
              Click speaker to replay target pronunciation.
            </p>
            
            <div className="options-grid">
              {currentQuestion.options.map((opt, idx) => (
                <button
                  key={opt}
                  className={`option-card ${selectedOption === opt ? 'selected' : ''}`}
                  onClick={() => { playClick(); setSelectedOption(opt); }}
                  disabled={checked}
                >
                  <span className="option-number">{idx + 1}</span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 5. Translate target to english using wordbank */}
        {currentQuestion.type === 'translate-target-to-english' && (
          <div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
              <button 
                onClick={() => speakTargetText(currentQuestion.targetSentence)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-blue)' }}
              >
                <Volume2 size={24} />
              </button>
              <div style={{
                background: '#f1f1f1',
                borderRadius: '16px',
                padding: '16px 24px',
                position: 'relative'
              }}>
                <span style={{ fontSize: '18px' }}>{currentQuestion.targetSentence}</span>
              </div>
            </div>

            <div className="translation-area">
              {selectedPills.map((pill) => (
                <button 
                  key={pill.id} 
                  className="pill-card"
                  onClick={() => handlePillClick(pill)}
                  disabled={checked}
                >
                  {pill.text}
                </button>
              ))}
            </div>

            <div className="word-bank">
              {currentQuestion.wordBank.map((pill) => {
                const isUsed = selectedPills.some(p => p.id === pill.id);
                return (
                  <button
                    key={pill.id}
                    className={`pill-card ${isUsed ? 'used' : ''}`}
                    onClick={() => !isUsed && handlePillClick(pill)}
                    disabled={isUsed || checked}
                  >
                    {pill.text}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Answer Verification Footer Overlay */}
      <div className={`lesson-footer ${checked ? (isAnswerCorrect ? 'correct' : 'incorrect') : ''}`}>
        <div className="footer-content">
          {!checked ? (
            <>
              <div />
              <button
                className="btn-3d btn-green"
                onClick={handleCheckAnswer}
                disabled={
                  (currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'listening') ? !selectedOption :
                  (currentQuestion.type === 'translate-wordbank' || currentQuestion.type === 'translate-target-to-english') ? selectedPills.length === 0 :
                  currentQuestion.type === 'match-pairs' ? matchedPairs.length < 5 : false
                }
                style={{ padding: '16px 36px', minWidth: '150px' }}
              >
                Check
              </button>
            </>
          ) : (
            <>
              <div className="feedback-message">
                {isAnswerCorrect ? (
                  <>
                    <CheckCircle size={36} style={{ color: 'var(--color-green)' }} />
                    <div className="feedback-text">
                      <h4>Excellent!</h4>
                      <p>You got the correct answer.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertOctagon size={36} style={{ color: 'var(--color-red)' }} />
                    <div className="feedback-text">
                      <h4>Correct Solution:</h4>
                      <p>{currentQuestion.correctAnswer}</p>
                    </div>
                  </>
                )}
              </div>
              <button
                className={`btn-3d ${isAnswerCorrect ? 'btn-green' : 'btn-red'}`}
                onClick={handleContinue}
                style={{ padding: '16px 36px', minWidth: '150px' }}
                disabled={savingProgress}
              >
                {savingProgress ? 'Saving...' : 'Continue'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lesson;
