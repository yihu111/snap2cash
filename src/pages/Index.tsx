import React, { useEffect, useState } from 'react';
import ImageUpload from '../components/ImageUpload';
import ProgressTracker from '../components/ProgressTracker';
import ListingReview from '../components/ListingReview';
import FeedbackComponent from '../components/FeedbackComponent';
import { useMyAgent } from '../hooks/useMyAgent';

type FlowStep = 'upload' | 'progress' | 'chat' | 'review' | 'feedback';
type ProgressStatus = 'analyzing' | 'complete' | 'error';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('upload');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile]   = useState<File | null>(null);
  const [progressStatus, setProgressStatus] = useState<ProgressStatus>('analyzing');
  const [generatedListing, setGeneratedListing] = useState<any>(null);

  // --- Agent integration ---
  const [transcript, setTranscript] = useState<string>('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const convo = useMyAgent(evt => {
    setTranscript(t => t + `\n${evt.who === 'user' ? 'USER' : 'AI'}: ${evt.text}`);
  });
  // -----------------------------

  const handleImageUpload = (file: File, imageUrl: string) => {
    setUploadedFile(file);
    setUploadedImage(imageUrl);
    setCurrentStep('progress');
    processImage(file);
  };

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
      setGeneratedListing(data.listing);

      // start ElevenLabs convo
      setTranscript(''); // clear
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const id = await convo.startSession({
        agentId: 'agent_01jy86vgvjf3matvmemzb7fgmz',
        dynamicVariables: {
          image_analysis_result: data.image_analysis_result
        }
      });
      setConversationId(id);
      setCurrentStep('chat');
      setProgressStatus('complete');
    } catch (err) {
      console.error(err);
      setProgressStatus('error');
    }
  };

  // once chat ends, automatically move to review
  useEffect(() => {
    if (currentStep === 'chat' && convo.status === 'disconnected') {
      // you could POST transcript+ID here if you like
      setCurrentStep('review');
    }
  }, [convo.status, currentStep]);

  const handleListingAccept = () => {
    console.log('Listing accepted:', generatedListing);
  };

  const handleListingReject = () => {
    setCurrentStep('feedback');
  };

  const handleFeedbackSubmit = (feedback: string) => {
    console.log('Feedback submitted:', feedback);
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

          {/* Chat step */}
          {currentStep === 'chat' && (
            <div className="mb-6">
              <p>Status: {convo.status}</p>
              <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap h-48 overflow-y-auto">
                {transcript || 'Agent is listening...'}
              </pre>
              <audio src={convo.audioStreamUrl} autoPlay hidden />
              <button
                onClick={async () => {
                  // 1) close the session
                  await convo.endSession();
                  // 2) wait for socket to fully disconnect
                  while (convo.status !== 'disconnected') {
                    await new Promise(r => setTimeout(r, 100));
                  }
                  // 3) fetch the saved transcript from your FastAPI backend
                  const res = await fetch(`http://localhost:8000/api/getTranscript/${conversationId}`);
                  const body = await res.json();
                  console.log('Full transcript:', body.transcript);
                  // 4) advance to review
                  setCurrentStep('review');
                }}
                disabled={convo.status !== 'connected'}
                className="mt-2 px-3 py-1 bg-red-500 text-white rounded"
              >
                Hang Up
              </button>
            </div>
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
