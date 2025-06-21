
import React, { useState } from 'react';
import ImageUpload from '../components/ImageUpload';
import VoiceQuestions from '../components/VoiceQuestions';
import ProgressTracker from '../components/ProgressTracker';
import ListingReview from '../components/ListingReview';
import FeedbackComponent from '../components/FeedbackComponent';

type FlowStep = 'upload' | 'questions' | 'progress' | 'review' | 'feedback';

type ProgressStatus = 'analyzing' | 'searching' | 'pricing' | 'generating' | 'complete' | 'error';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('upload');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [voiceAnswers, setVoiceAnswers] = useState<Record<string, string>>({});
  const [progressStatus, setProgressStatus] = useState<ProgressStatus>('analyzing');
  const [generatedListing, setGeneratedListing] = useState<any>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    setCurrentStep('questions');
  };

  const handleQuestionsComplete = (answers: Record<string, string>) => {
    setVoiceAnswers(answers);
    setCurrentStep('progress');
    simulateAgenticWorkflow();
  };

  const simulateAgenticWorkflow = async () => {
    const steps: ProgressStatus[] = ['analyzing', 'searching', 'pricing', 'generating'];
    
    for (let i = 0; i < steps.length; i++) {
      setProgressStatus(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    setGeneratedListing({
      title: "Vintage Camera - Excellent Condition",
      description: "High-quality vintage camera in excellent working condition...",
      price: "$299.99",
      category: "Electronics"
    });
    
    setProgressStatus('complete');
    setCurrentStep('review');
  };

  const handleListingAccept = () => {
    console.log('Listing accepted - uploading to eBay...');
  };

  const handleListingReject = () => {
    setShowFeedback(true);
    setCurrentStep('feedback');
  };

  const handleFeedbackSubmit = (feedback: string) => {
    console.log('Feedback submitted:', feedback);
    setCurrentStep('progress');
    setProgressStatus('analyzing');
    simulateAgenticWorkflow();
  };

  const handleReupload = () => {
    setCurrentStep('upload');
    setUploadedImage(null);
    setProgressStatus('analyzing');
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-serif">
      <div className="container mx-auto px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-light text-stone-900 mb-4 tracking-wide">
            eBay Agent
          </h1>
          <p className="text-lg text-stone-600 font-light max-w-lg mx-auto leading-relaxed">
            Upload an image and let our AI create the perfect listing
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {currentStep === 'upload' && (
            <ImageUpload onImageUpload={handleImageUpload} />
          )}

          {currentStep === 'questions' && (
            <VoiceQuestions 
              uploadedImage={uploadedImage}
              onComplete={handleQuestionsComplete}
            />
          )}

          {currentStep === 'progress' && (
            <ProgressTracker 
              status={progressStatus}
              onReupload={handleReupload}
            />
          )}

          {currentStep === 'review' && (
            <ListingReview 
              listing={generatedListing}
              onAccept={handleListingAccept}
              onReject={handleListingReject}
            />
          )}

          {currentStep === 'feedback' && (
            <FeedbackComponent 
              onSubmit={handleFeedbackSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
