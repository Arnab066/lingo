import React, { useState } from 'react';
import { useSound } from '../hooks/useSound';
import { X, ShieldAlert, Award, Star, Infinity as InfinityIcon, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const PremiumModal = ({ isOpen, onClose, onSubscribeSuccess, token }) => {
  const { playClick, playPremiumUpgrade } = useSound();
  const [step, setStep] = useState('benefits'); // benefits -> checkout -> processing -> success
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: ''
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setError('');
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      const matches = v.match(/\d{4,16}/g);
      const match = (matches && matches[0]) || '';
      const parts = [];

      for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
      }

      if (parts.length > 0) {
        setFormData({ ...formData, [name]: parts.join(' ') });
      } else {
        setFormData({ ...formData, [name]: v });
      }
    } 
    // Format expiry MM/YY
    else if (name === 'cardExpiry') {
      const v = value.replace(/\/+/g, '').replace(/[^0-9]/gi, '');
      if (v.length >= 2) {
        setFormData({ ...formData, [name]: `${v.slice(0, 2)}/${v.slice(2, 4)}` });
      } else {
        setFormData({ ...formData, [name]: v });
      }
    }
    // Limit CVV
    else if (name === 'cardCvv') {
      const v = value.replace(/[^0-9]/gi, '').slice(0, 3);
      setFormData({ ...formData, [name]: v });
    }
    else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleNextToCheckhold = () => {
    playClick();
    setStep('checkout');
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    playClick();

    const { cardName, cardNumber, cardExpiry, cardCvv } = formData;
    if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
      setError('Please fill in all payment details.');
      return;
    }

    if (cardNumber.replace(/\s+/g, '').length < 16) {
      setError('Invalid card number. Must be 16 digits.');
      return;
    }

    if (cardExpiry.length < 5) {
      setError('Invalid expiration date. Use MM/YY.');
      return;
    }

    if (cardCvv.length < 3) {
      setError('Invalid CVV. Must be 3 digits.');
      return;
    }

    setStep('processing');

    // Simulate Stripe payment gateway latency
    setTimeout(async () => {
      try {
        const response = await fetch('http://localhost:5000/api/progress/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ transactionId: `lingo_sub_${Date.now()}` })
        });

        if (response.ok) {
          const data = await response.json();
          playPremiumUpgrade();
          setStep('success');
          // Launch confetti celebration
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 }
          });
          onSubscribeSuccess(data.isPremium);
        } else {
          setError('Payment transaction rejected by bank. Please try another card.');
          setStep('checkout');
        }
      } catch (err) {
        console.error(err);
        setError('Connection error updating subscription.');
        setStep('checkout');
      }
    }, 2500);
  };

  return (
    <div className="premium-overlay">
      <div className="premium-card">
        {step !== 'processing' && step !== 'success' && (
          <button className="premium-close" onClick={onClose}>
            <X size={24} />
          </button>
        )}

        {step === 'benefits' && (
          <div>
            <div className="premium-logo">
              <Sparkles size={32} style={{ display: 'inline', marginRight: '8px' }} />
              Super Lingo
            </div>
            <p style={{ textAlign: 'center', marginBottom: '24px', opacity: 0.9 }}>
              Unlock the ultimate learning power-up.
            </p>

            <div className="premium-features">
              <div className="feature-row">
                <InfinityIcon size={24} style={{ color: '#ffea00' }} />
                <span><strong>Unlimited Hearts:</strong> Never run out of health during practice!</span>
              </div>
              <div className="feature-row">
                <Star size={24} style={{ color: '#ffea00' }} />
                <span><strong>No Ads:</strong> Enjoy completely focused, ad-free learning.</span>
              </div>
              <div className="feature-row">
                <Award size={24} style={{ color: '#ffea00' }} />
                <span><strong>Premium Badge:</strong> Stand out in leaderboards with a purple badge.</span>
              </div>
              <div className="feature-row">
                <ShieldAlert size={24} style={{ color: '#ffea00' }} />
                <span><strong>Free Practice:</strong> Automatic refilling of heart logs.</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <h4 style={{ fontSize: '20px', marginBottom: '4px' }}>$9.99 / month</h4>
              <p style={{ fontSize: '12px', opacity: 0.8, marginBottom: '20px' }}>Cancel anytime with 1 click.</p>
              
              <button 
                onClick={handleNextToCheckhold} 
                className="btn-3d btn-green"
                style={{ width: '100%', padding: '16px', fontSize: '18px' }}
              >
                Try Super Free
              </button>
            </div>
          </div>
        )}

        {step === 'checkout' && (
          <div>
            <h3 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '22px' }}>
              Checkout - Super Lingo
            </h3>
            
            <form onSubmit={handleSubmitPayment} className="payment-form">
              {error && <div className="auth-error">{error}</div>}
              
              <div className="form-group">
                <label>Cardholder Name</label>
                <input 
                  type="text" 
                  name="cardName" 
                  value={formData.cardName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="form-group">
                <label>Card Number</label>
                <input 
                  type="text" 
                  name="cardNumber" 
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="4000 1234 5678 9010"
                  maxLength="19"
                  required
                />
              </div>

              <div className="payment-row">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input 
                    type="text" 
                    name="cardExpiry" 
                    value={formData.cardExpiry}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    maxLength="5"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input 
                    type="password" 
                    name="cardCvv" 
                    value={formData.cardCvv}
                    onChange={handleInputChange}
                    placeholder="***"
                    maxLength="3"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-3d btn-super"
                style={{ width: '100%', marginTop: '20px', padding: '14px' }}
              >
                Pay $9.99 & Upgrade
              </button>
            </form>
          </div>
        )}

        {step === 'processing' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              border: '6px solid rgba(255,255,255,0.3)',
              borderTopColor: '#ffffff',
              borderRadius: '50%',
              margin: '0 auto 24px auto',
              animation: 'spin 1s linear infinite'
            }} />
            <h3 style={{ fontSize: '22px', marginBottom: '8px' }}>Processing Payment...</h3>
            <p style={{ opacity: 0.8 }}>Encrypting transaction details securely.</p>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <Sparkles size={64} style={{ color: '#ffea00', marginBottom: '20px', animation: 'float 4s ease-in-out infinite' }} />
            <h3 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '12px' }}>
              You are now SUPER!
            </h3>
            <p style={{ opacity: 0.9, marginBottom: '30px', fontSize: '16px' }}>
              Welcome to Super Lingo. Unlimited hearts and an ad-free journey are now active. Let's make learning fun!
            </p>

            <button 
              onClick={onClose} 
              className="btn-3d btn-green"
              style={{ width: '100%', padding: '14px' }}
            >
              Start Learning
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumModal;
