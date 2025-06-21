import React, { useState } from 'react';
import ImageUpload from '../components/ImageUpload';
import ProgressTracker from '../components/ProgressTracker';
import ListingReview from '../components/ListingReview';
import FeedbackComponent from '../components/FeedbackComponent';

type FlowStep = 'upload' | 'progress' | 'review' | 'feedback';
type ProgressStatus = 'analyzing' | 'complete' | 'error';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('upload');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile]   = useState<File | null>(null);
  const [progressStatus, setProgressStatus] = useState<ProgressStatus>('analyzing');
  const [generatedListing, setGeneratedListing] = useState<any>(null);

  // 1) Receive both the File and its preview URL
  const handleImageUpload = (file: File, imageUrl: string) => {
    setUploadedFile(file);
    setUploadedImage(imageUrl);
    setCurrentStep('progress');
    processImage(file);
  };

  // 2) Send to FastAPI
  const processImage = async (file: File) => {
    setProgressStatus('analyzing');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const resp = await fetch("http://localhost:8000/process-image", {
        method: "POST",
        body: formData,
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      // data.listing must exist
      setGeneratedListing(data.listing);
      setProgressStatus('complete');
      setCurrentStep('review');
    } catch (err) {
      console.error(err);
      setProgressStatus('error');
    }
  };

  const handleListingAccept = () => {
    console.log('Listing accepted:', generatedListing);
  };

  const handleListingReject = () => {
    setCurrentStep('feedback');
  };

  const handleFeedbackSubmit = (feedback: string) => {
    console.log('Feedback submitted:', feedback);
    // restart if desired
    setCurrentStep('progress');
    setProgressStatus('analyzing');
    if (uploadedFile) processImage(uploadedFile);
  };

  const handleReupload = () => {
    setCurrentStep('upload');
    setUploadedImage(null);
    setUploadedFile(null);
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

          {currentStep === 'progress' && (
            <ProgressTracker 
              status={progressStatus}
              onReupload={handleReupload}
            />
          )}

          {currentStep === 'review' && uploadedFile && generatedListing && (
            <ListingReview 
              listing   ={generatedListing}
              imageFile ={uploadedFile}
              onAccept  ={handleListingAccept}
              onReject  ={handleListingReject}
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
