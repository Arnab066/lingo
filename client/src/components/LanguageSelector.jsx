import React from 'react';
import { allLanguages } from '../data/languages';
import { Globe, Award } from 'lucide-react';
import { useSound } from '../hooks/useSound';

const LanguageSelector = ({ currentLanguage, onSelectLanguage }) => {
  const { playClick } = useSound();
  
  // Group languages by category
  const categories = {
    'Popular': [],
    'Europe': [],
    'Asia': [],
    'Americas & Africa': [],
    'Classical & Fantasy': []
  };

  allLanguages.forEach(lang => {
    if (categories[lang.category]) {
      categories[lang.category].push(lang);
    } else {
      categories['Popular'].push(lang);
    }
  });

  const handleLangSelect = (code) => {
    playClick();
    onSelectLanguage(code);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
        <Globe size={28} style={{ color: 'var(--color-blue)' }} />
        <h2 style={{ fontSize: '26px', fontWeight: '800' }}>I want to learn...</h2>
      </div>
      <p style={{ color: 'var(--color-gray-dark)', marginBottom: '24px' }}>
        Choose from our 50 high-quality language courses. Switch anytime!
      </p>

      {Object.keys(categories).map(catName => {
        if (categories[catName].length === 0) return null;
        return (
          <div key={catName} style={{ marginBottom: '30px' }}>
            <h3 className="category-title">{catName}</h3>
            <div className="language-grid">
              {categories[catName].map(lang => (
                <div 
                  key={lang.code} 
                  className={`lang-card ${currentLanguage === lang.code ? 'active' : ''}`}
                  onClick={() => handleLangSelect(lang.code)}
                >
                  <span className="lang-flag">{lang.flag}</span>
                  <span className="lang-name">{lang.name}</span>
                  {currentLanguage === lang.code && (
                    <Award size={16} style={{ color: 'var(--color-green)', marginTop: '8px' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LanguageSelector;
