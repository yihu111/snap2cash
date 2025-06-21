
import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceQuestionsProps {
  uploadedImage: string | null;
  onComplete: (answers: Record<string, string>) => void;
}

const questions = [
  "What condition is this item in?",
  "Where did you originally purchase this?",  
  "How long have you owned it?",
  "Are there any defects or issues?",
  "What's your preferred starting price range?"
];

const VoiceQuestions: React.FC<VoiceQuestionsProps> = ({ uploadedImage, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');

  const handleRecord = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        setCurrentAnswer("Voice response recorded");
      }, 2000);
    }
  };

  const handleNext = () => {
    const newAnswers = { ...answers, [questions[currentQuestion]]: currentAnswer || "Voice response" };
    setAnswers(newAnswers);
    setCurrentAnswer('');

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onComplete(newAnswers);
    }
  };

  const handleSkip = () => {
    const newAnswers = { ...answers, [questions[currentQuestion]]: "Skipped" };
    setAnswers(newAnswers);
    setCurrentAnswer('');

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onComplete(newAnswers);
    }
  };

  return (
    <div className="w-full text-center">
      <div className="mb-8">
        <div className="w-32 h-32 rounded-full overflow-hidden border border-stone-200 mx-auto mb-8">
          <img 
            src={uploadedImage || ''} 
            alt="Uploaded item" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="mb-8">
        <div className="mb-6">
          <span className="text-sm text-stone-500 font-light">
            Question {currentQuestion + 1} of {questions.length}
          </span>
        </div>
        
        <div className="w-full bg-stone-200 rounded-full h-1 mb-8">
          <div 
            className="bg-stone-800 h-1 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="mb-12">
        <h4 className="text-xl text-stone-800 mb-8 font-light leading-relaxed max-w-md mx-auto">
          {questions[currentQuestion]}
        </h4>

        <div className="mb-8">
          <button
            onClick={handleRecord}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 mx-auto ${
              isRecording 
                ? 'bg-red-100 border-2 border-red-300 shadow-lg scale-110' 
                : 'bg-stone-100 border-2 border-stone-300 hover:bg-stone-200 hover:border-stone-400 hover:scale-105'
            }`}
          >
            {isRecording && (
              <div className="absolute inset-0 rounded-full border-2 border-red-300 animate-ping"></div>
            )}
            {isRecording ? 
              <MicOff className="w-8 h-8 text-red-600" /> : 
              <Mic className="w-8 h-8 text-stone-600" />
            }
          </button>
          <p className="text-sm text-stone-500 mt-4 font-light">
            {isRecording ? 'Recording...' : 'Tap to speak'}
          </p>
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <button
          onClick={handleSkip}
          className="px-6 py-2 text-stone-500 hover:text-stone-700 font-light transition-colors"
        >
          Skip
        </button>
        <button
          onClick={handleNext}
          disabled={!currentAnswer && !isRecording}
          className="px-8 py-2 bg-stone-800 hover:bg-stone-900 disabled:opacity-50 disabled:cursor-not-allowed text-stone-50 rounded-md font-light transition-colors"
        >
          {currentQuestion === questions.length - 1 ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default VoiceQuestions;
