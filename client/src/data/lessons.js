import { vocabulary } from './languages.js';

// Generates a lesson quiz with varied question types for a selected language
export const generateLesson = (langCode) => {
  const vocab = vocabulary[langCode] || vocabulary['es']; // Fallback to Spanish if not found
  const questions = [];

  // 1. Multiple Choice Vocabulary Question
  const wordsKeys = Object.keys(vocab).filter(k => k !== 'sentences');
  const mcKey = wordsKeys[Math.floor(Math.random() * wordsKeys.length)];
  const mcTargetAnswer = vocab[mcKey];
  const mcOptions = [mcTargetAnswer];
  
  // Pick 3 wrong options from other words or default list
  const otherKeys = wordsKeys.filter(k => k !== mcKey);
  const shuffledOtherKeys = otherKeys.sort(() => 0.5 - Math.random());
  for (let i = 0; i < Math.min(3, shuffledOtherKeys.length); i++) {
    mcOptions.push(vocab[shuffledOtherKeys[i]]);
  }
  // Fill up if too short
  while (mcOptions.length < 4) {
    mcOptions.push('random_' + mcOptions.length);
  }
  
  questions.push({
    type: 'multiple-choice',
    prompt: `Choose the correct translation for: "${mcKey.toUpperCase()}"`,
    question: `What is "${mcKey}" in this language?`,
    correctAnswer: mcTargetAnswer,
    options: mcOptions.sort(() => 0.5 - Math.random())
  });

  // 2. Match Pairs (5 pairs)
  const pairsCount = 5;
  const matchKeys = wordsKeys.sort(() => 0.5 - Math.random()).slice(0, pairsCount);
  const englishWords = matchKeys.map(k => ({ id: `en-${k}`, text: k, type: 'english', pairId: k }));
  const targetWords = matchKeys.map(k => ({ id: `tg-${k}`, text: vocab[k], type: 'target', pairId: k }));

  questions.push({
    type: 'match-pairs',
    prompt: 'Match the pairs',
    pairs: {
      left: englishWords.sort(() => 0.5 - Math.random()),
      right: targetWords.sort(() => 0.5 - Math.random())
    }
  });

  // 3. Translate Sentence: English -> Target (Word Bank)
  const sentenceIndex = Math.floor(Math.random() * vocab.sentences.length);
  const sentenceObj = vocab.sentences[sentenceIndex];
  
  // Split target sentence into individual word pills
  // Strip punctuation for cleaner word bank
  const cleanTargetWords = sentenceObj.target
    .replace(/[¿?¡!.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  // Generate word bank including correct words and some extra distractor words
  const correctPills = [...cleanTargetWords];
  const distractorPills = wordsKeys
    .filter(k => !correctPills.includes(vocab[k]))
    .slice(0, 4)
    .map(k => vocab[k]);
  
  const wordBank = [...correctPills, ...distractorPills]
    .map((word, idx) => ({ id: `pill-${idx}`, text: word }))
    .sort(() => 0.5 - Math.random());

  questions.push({
    type: 'translate-wordbank',
    prompt: 'Translate this sentence',
    englishSentence: sentenceObj.english,
    correctAnswer: cleanTargetWords.join(' '),
    wordBank: wordBank
  });

  // 4. Listening / Audio Spelling Question (Select matching words or type)
  // We pick another vocabulary word
  const audioKey = wordsKeys.sort(() => 0.5 - Math.random())[0];
  const audioTarget = vocab[audioKey];
  const audioOptions = [audioTarget];
  
  const otherAudioKeys = wordsKeys.filter(k => k !== audioKey);
  const shuffledOtherAudio = otherAudioKeys.sort(() => 0.5 - Math.random());
  for (let i = 0; i < Math.min(3, shuffledOtherAudio.length); i++) {
    audioOptions.push(vocab[shuffledOtherAudio[i]]);
  }

  questions.push({
    type: 'listening',
    prompt: 'Listen and select the correct translation',
    audioText: audioTarget, // We will speak this in speech synthesis!
    correctAnswer: audioTarget,
    options: audioOptions.sort(() => 0.5 - Math.random())
  });

  // 5. Translate Sentence: Target -> English (Type or select words)
  const sentenceIndex2 = (sentenceIndex + 1) % vocab.sentences.length;
  const sentenceObj2 = vocab.sentences[sentenceIndex2];
  
  const cleanEnglishWords = sentenceObj2.english
    .replace(/[¿?¡!.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  const correctEnglishPills = [...cleanEnglishWords];
  const distractorEnglishPills = ['cat', 'dog', 'house', 'coffee', 'happy', 'milk', 'apple']
    .filter(w => !correctEnglishPills.includes(w))
    .slice(0, 4);

  const englishWordBank = [...correctEnglishPills, ...distractorEnglishPills]
    .map((word, idx) => ({ id: `pill-en-${idx}`, text: word }))
    .sort(() => 0.5 - Math.random());

  questions.push({
    type: 'translate-target-to-english',
    prompt: 'Translate this sentence to English',
    targetSentence: sentenceObj2.target,
    correctAnswer: cleanEnglishWords.join(' '),
    wordBank: englishWordBank
  });

  return questions;
};
