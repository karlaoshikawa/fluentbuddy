import React, { useState } from 'react';
import { CEFRLevel } from '../types';
import { ChevronRight, CheckmarkFilled } from '@carbon/icons-react';

interface LevelTestProps {
  onComplete: (level: CEFRLevel) => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  level: CEFRLevel;
}

const questions: Question[] = [
  {
    id: 1,
    question: "Hello! What's your name?",
    options: [
      "My name is...",
      "I am have name...",
      "Name my is...",
      "Is name..."
    ],
    correctAnswer: 0,
    level: 'A1'
  },
  {
    id: 2,
    question: "Complete: I ___ to the gym every morning.",
    options: [
      "go",
      "goes",
      "going",
      "went"
    ],
    correctAnswer: 0,
    level: 'A2'
  },
  {
    id: 3,
    question: "Which sentence is correct?",
    options: [
      "I have been working here for 3 years.",
      "I am working here for 3 years.",
      "I work here for 3 years.",
      "I working here for 3 years."
    ],
    correctAnswer: 0,
    level: 'B1'
  },
  {
    id: 4,
    question: "Choose the best option: The project was ___ more challenging than we anticipated.",
    options: [
      "considerably",
      "considerable",
      "consider",
      "consideration"
    ],
    correctAnswer: 0,
    level: 'B2'
  },
  {
    id: 5,
    question: "Select the most appropriate phrase: Had I known about the meeting earlier, I ___ my schedule.",
    options: [
      "would have rearranged",
      "will rearrange",
      "would rearrange",
      "have rearranged"
    ],
    correctAnswer: 0,
    level: 'C1'
  },
  {
    id: 6,
    question: "Which sentence demonstrates the most sophisticated use of English?",
    options: [
      "The paradigm shift in organizational dynamics necessitated a comprehensive reassessment of our strategic imperatives.",
      "We needed to change our business strategy because things changed.",
      "The company had to think about new strategies.",
      "Our strategy needed some updates."
    ],
    correctAnswer: 0,
    level: 'C2'
  }
];

export function LevelTest({ onComplete }: LevelTestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleAnswer = () => {
    if (selectedOption === null) return;
    
    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate level based on answers
      const level = calculateLevel(newAnswers);
      onComplete(level);
    }
  };

  const calculateLevel = (userAnswers: number[]): CEFRLevel => {
    let correctCount = 0;
    
    questions.forEach((q, index) => {
      if (userAnswers[index] === q.correctAnswer) {
        correctCount++;
      }
    });

    // Determine level based on correct answers
    if (correctCount === 6) return 'C2';
    if (correctCount === 5) return 'C1';
    if (correctCount === 4) return 'B2';
    if (correctCount === 3) return 'B1';
    if (correctCount === 2) return 'A2';
    return 'A1';
  };

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-gray-100 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Quick Level Assessment
          </h2>
          <p className="text-slate-600 text-sm">
            Let's determine your starting point. Answer {questions.length} questions to begin your personalized journey.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-slate-600 to-slate-800 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">
            {question.question}
          </h3>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedOption(index)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedOption === index
                    ? 'border-slate-700 bg-slate-100 shadow-md'
                    : 'border-slate-200 hover:border-slate-400 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-800 font-medium">{option}</span>
                  {selectedOption === index && (
                    <CheckmarkFilled size={20} className="text-slate-700" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={handleAnswer}
          disabled={selectedOption === null}
          className="w-full bg-slate-700 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
        >
          <span>{currentQuestion === questions.length - 1 ? 'Complete Assessment' : 'Next Question'}</span>
          <ChevronRight size={20} />
        </button>

        {/* Privacy Note */}
        <p className="text-xs text-slate-500 text-center">
          This test appears only once. Your progress will be saved locally.
        </p>
      </div>
    </div>
  );
}
