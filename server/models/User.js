import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  selectedLanguage: {
    type: String,
    default: 'es' // Default language is Spanish
  },
  streak: {
    type: Number,
    default: 0
  },
  gems: {
    type: Number,
    default: 500 // Start with some pocket gems
  },
  xp: {
    type: Number,
    default: 0
  },
  hearts: {
    type: Number,
    default: 5
  },
  lastHeartRefill: {
    type: Date,
    default: Date.now
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  premiumSubscribedAt: {
    type: Date
  },
  premiumTransactionId: {
    type: String
  },
  // Progress structure: { "es": { "unit_1_node_1": true, "unit_1_node_2": false }, "fr": {} }
  progress: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('User', UserSchema);
