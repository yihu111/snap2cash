
import React, { useState } from 'react';
import { Circle } from 'lucide-react';

interface FeedbackComponentProps {
  onSubmit: (feedback: string) => void;
}

const FeedbackComponent: React.FC<FeedbackComponentProps> = ({ onSubmit }) => {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (feedback.trim()) {
      setIsSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSubmit(feedback);
    }
  };

  const suggestions = [
    "Price seems too high",
    "Description needs more detail",
    "Wrong category",
    "Title could be better",
    "Missing specifications"
  ];

  return (
    <div className="w-full">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Circle className="w-6 h-6 text-orange-600" />
        </div>
        <h3 className="text-2xl font-light text-stone-900 mb-4">Help us improve</h3>
        <p className="text-stone-600 font-light">What would you like us to change?</p>
      </div>

      <div className="mb-8">
        <label className="text-sm text-stone-500 font-light block mb-4">Quick suggestions:</label>
        <div className="flex flex-wrap gap-2 mb-6">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setFeedback(prev => prev ? `${prev}\n${suggestion}` : suggestion)}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-200 hover:border-stone-300 rounded text-sm text-stone-600 hover:text-stone-800 font-light transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <label className="text-sm text-stone-500 font-light block mb-3">Your feedback:</label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Tell us what needs to be improved..."
          className="w-full bg-white border border-stone-200 rounded-lg p-4 text-stone-800 placeholder-stone-400 focus:border-stone-400 focus:outline-none transition-colors resize-none font-light"
          rows={6}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!feedback.trim() || isSubmitting}
        className="w-full bg-stone-800 hover:bg-stone-900 disabled:opacity-50 disabled:cursor-not-allowed text-stone-50 px-6 py-3 rounded-md font-light transition-colors"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-stone-300 border-t-transparent rounded-full animate-spin"></div>
            <span>Processing...</span>
          </span>
        ) : (
          'Submit feedback & regenerate'
        )}
      </button>

      <p className="text-center text-stone-500 text-sm mt-4 font-light">
        We'll use your feedback to improve the listing
      </p>
    </div>
  );
};

export default FeedbackComponent;
