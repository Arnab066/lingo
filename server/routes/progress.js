import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Helper to handle time-based heart regeneration
const checkAndRegenHearts = async (user) => {
  if (user.isPremium || user.hearts >= 5) {
    return user;
  }

  const REGEN_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes per heart
  const now = new Date();
  const lastRefill = new Date(user.lastHeartRefill || user.createdAt);
  const elapsedMs = now.getTime() - lastRefill.getTime();

  if (elapsedMs >= REGEN_INTERVAL_MS) {
    const heartsToAdd = Math.floor(elapsedMs / REGEN_INTERVAL_MS);
    const newHeartsCount = Math.min(5, user.hearts + heartsToAdd);
    
    user.hearts = newHeartsCount;
    
    // If we capped out, set lastHeartRefill to now. Otherwise, increment by the consumed regen intervals
    if (newHeartsCount === 5) {
      user.lastHeartRefill = now;
    } else {
      user.lastHeartRefill = new Date(lastRefill.getTime() + (heartsToAdd * REGEN_INTERVAL_MS));
    }
    
    await user.save();
  }
  
  return user;
};

// @route   GET api/progress
// @desc    Get user progress state
router.get('/', auth, async (req, res) => {
  try {
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user = await checkAndRegenHearts(user);

    res.json({
      selectedLanguage: user.selectedLanguage,
      streak: user.streak,
      gems: user.gems,
      xp: user.xp,
      hearts: user.hearts,
      lastHeartRefill: user.lastHeartRefill,
      isPremium: user.isPremium,
      progress: user.progress
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// @route   POST api/progress/select-language
// @desc    Change user's selected language
router.post('/select-language', auth, async (req, res) => {
  const { languageCode } = req.body;
  if (!languageCode) {
    return res.status(400).json({ msg: 'Language code is required' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.selectedLanguage = languageCode;
    // Initialize language key in progress if it doesn't exist
    if (!user.progress) {
      user.progress = {};
    }
    if (!user.progress[languageCode]) {
      user.progress[languageCode] = {};
      user.markModified('progress');
    }

    await user.save();
    res.json({ selectedLanguage: user.selectedLanguage, progress: user.progress });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// @route   POST api/progress/save
// @desc    Save level complete progress, award gems, increase XP
router.post('/save', auth, async (req, res) => {
  const { xpGained, gemsGained, streakUpdated, levelNodeId } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (xpGained) user.xp += xpGained;
    if (gemsGained) user.gems += gemsGained;
    if (streakUpdated) user.streak = streakUpdated;

    if (levelNodeId) {
      const currentLang = user.selectedLanguage || 'es';
      if (!user.progress) {
        user.progress = {};
      }
      if (!user.progress[currentLang]) {
        user.progress[currentLang] = {};
      }
      // Unlock/Complete this node
      user.progress[currentLang][levelNodeId] = true;
      user.markModified('progress');
    }

    await user.save();
    res.json({
      xp: user.xp,
      gems: user.gems,
      streak: user.streak,
      progress: user.progress
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// @route   POST api/progress/heart-deduct
// @desc    Deduct a heart due to incorrect answer
router.post('/heart-deduct', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.isPremium) {
      // Premium user has unlimited hearts
      return res.json({ hearts: 5, isPremium: true });
    }

    if (user.hearts > 0) {
      // If heart goes below 5, update refill timer to now
      if (user.hearts === 5) {
        user.lastHeartRefill = new Date();
      }
      user.hearts -= 1;
      await user.save();
    }

    res.json({ hearts: user.hearts, lastHeartRefill: user.lastHeartRefill });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// @route   POST api/progress/heart-refill
// @desc    Refill hearts via gems or practicing
router.post('/heart-refill', auth, async (req, res) => {
  const { method } = req.body; // 'gems' or 'practice'

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (method === 'gems') {
      if (user.gems < 350) {
        return res.status(400).json({ msg: 'Not enough gems. You need 350 gems.' });
      }
      user.gems -= 350;
      user.hearts = 5;
      user.lastHeartRefill = new Date();
    } else if (method === 'practice') {
      user.hearts = Math.min(5, user.hearts + 1);
      if (user.hearts === 5) {
        user.lastHeartRefill = new Date();
      }
    } else {
      return res.status(400).json({ msg: 'Invalid refill method' });
    }

    await user.save();
    res.json({ hearts: user.hearts, gems: user.gems });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// @route   POST api/progress/subscribe
// @desc    Subscribe to Super Lingo Premium
router.post('/subscribe', auth, async (req, res) => {
  const { transactionId } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.isPremium = true;
    user.premiumSubscribedAt = new Date();
    user.premiumTransactionId = transactionId || `lingo_tx_${Date.now()}`;
    user.hearts = 5; // Restore fully, display unlimited

    await user.save();
    res.json({
      isPremium: user.isPremium,
      hearts: user.hearts,
      premiumTransactionId: user.premiumTransactionId
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

export default router;
