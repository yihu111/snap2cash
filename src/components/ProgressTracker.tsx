
import React from 'react';
import { Loader, Circle } from 'lucide-react';

interface ProgressTrackerProps {
  status: 'analyzing' | 'searching' | 'pricing' | 'generating' | 'complete' | 'error';
  onReupload: () => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ status, onReupload }) => {
  const steps = [
    { id: 'analyzing', title: 'Analyzing' },
    { id: 'searching', title: 'Researching' },
    { id: 'pricing', title: 'Pricing' },
    { id: 'generating', title: 'Creating' }
  ];

  const getStepStatus = (stepId: string) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === status);
    
    if (status === 'error') return 'error';
    if (status === 'complete') return 'complete';
    if (stepIndex < currentIndex) return 'complete';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const activities = [
    "Analyzing your image...",
    "Searching similar items...",
    "Calculating optimal price...",
    "Writing description...",
    "Finalizing listing..."
  ];

  const [currentActivity, setCurrentActivity] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivity(prev => (prev + 1) % activities.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (status === 'error') {
    return (
      <div className="w-full text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Circle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-xl font-light text-red-800 mb-4">Image too blurry</h3>
          <p className="text-red-600 mb-8 font-light">
            Please upload a clearer photo
          </p>
          <button
            onClick={onReupload}
            className="bg-stone-800 hover:bg-stone-900 text-stone-50 px-6 py-2 rounded-md font-light transition-colors"
          >
            Upload new image
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full text-center">
      <div className="mb-12">
        <h3 className="text-2xl font-light text-stone-900 mb-4">Creating your listing</h3>
        <p className="text-stone-600 font-light">Our AI is working on it</p>
      </div>

      <div className="flex justify-center gap-8 mb-12">
        {steps.map((step) => {
          const stepStatus = getStepStatus(step.id);
          
          return (
            <div key={step.id} className="text-center">
              <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center transition-all duration-300 ${
                stepStatus === 'complete' 
                  ? 'bg-stone-800 text-stone-50' 
                  : stepStatus === 'active'
                  ? 'bg-stone-200 text-stone-800'
                  : 'bg-stone-100 text-stone-400'
              }`}>
                {stepStatus === 'active' ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Circle className={`w-3 h-3 ${stepStatus === 'complete' ? 'fill-current' : ''}`} />
                )}
              </div>
              <p className={`text-sm font-light ${
                stepStatus === 'complete' ? 'text-stone-800' 
                : stepStatus === 'active' ? 'text-stone-700'
                : 'text-stone-400'
              }`}>
                {step.title}
              </p>
            </div>
          );
        })}
      </div>

      <div className="bg-stone-50 border border-stone-200 rounded-lg p-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <p className="text-stone-600 font-light">
          {activities[currentActivity]}
        </p>
      </div>
    </div>
  );
};

export default ProgressTracker;
