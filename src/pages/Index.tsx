import React, { useEffect, useState } from 'react';
import ImageUpload from '../components/ImageUpload';
import ProgressTracker from '../components/ProgressTracker';
import ListingReview from '../components/ListingReview';
import FeedbackComponent from '../components/FeedbackComponent';
import { useMyAgent } from '../hooks/useMyAgent';

type FlowStep = 'upload' | 'progress' | 'chat' | 'review' | 'feedback';
type ProgressStatus = 'analyzing' | 'complete' | 'error';

const Index = () => {
  // ─── UI STATE ────────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<FlowStep>('upload');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [progressStatus, setProgressStatus] = useState<ProgressStatus>('analyzing');
  const [generatedListing, setGeneratedListing] = useState<any>(null);

  // ─── IMAGE ANALYSIS RESULT ──────────────────────────────────────────────────
  const [imageAnalysisResult, setImageAnalysisResult] = useState<string>('');

  // ─── VOICE AGENT STATE ──────────────────────────────────────────────────────
  const [transcript, setTranscript] = useState<string>('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const convo = useMyAgent(evt => {
    setTranscript(t => t + `\n${evt.who === 'user' ? 'USER' : 'AI'}: ${evt.text}`);
  });

  // ─── 1) UPLOAD IMAGE & START CHAT ────────────────────────────────────────────
  const handleImageUpload = (file: File, imageUrl: string) => {
    setUploadedFile(file);
    setUploadedImage(imageUrl);
    setCurrentStep('progress');
    processImage(file);
  };

  async function processImage(file: File) {
    setProgressStatus('analyzing');
    const formData = new FormData();
    formData.append('file', file);

    try {
      // a) call /process-image
      const resp = await fetch('http://localhost:8000/process-image', {
        method: 'POST',
        body: formData,
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();

      // b) get just the analysis text back
      const analysis = data.image_analysis_result;
      console.log('🖼️ image analysis result:', analysis);
      setImageAnalysisResult(analysis);

      // c) open voice session
      setTranscript('');
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const id = await convo.startSession({
        agentId: 'agent_01jy86vgvjf3matvmemzb7fgmz',
        userAudioStream: micStream,
        dynamicVariables: { image_analysis_result: analysis },
      });
      console.log('🎤 convo started, id =', id);
      (convo as any).micStream = micStream;
      setConversationId(id);
      setCurrentStep('chat');
      setProgressStatus('complete');
    } catch (err) {
      console.error('❌ processImage error:', err);
      setProgressStatus('error');
    }
  }

  // ─── 2) ON CHAT END: FETCH TRANSCRIPT → PRICE FLOW → REVIEW ──────────────────
  useEffect(() => {
    console.log('🚦 post-chat effect:', {
      currentStep,
      convoStatus: convo.status,
      conversationId,
    });

    if (currentStep === 'chat' && convo.status === 'disconnected' && conversationId) {
      (async () => {
        try {
          // a) stop mic
          const mic = (convo as any).micStream as MediaStream;
          mic?.getTracks().forEach(t => t.stop());

          // b) fetch transcript
          console.log('📨 fetching transcript for', conversationId);
          const tsRes = await fetch(`http://localhost:8000/api/getTranscript/${conversationId}`);
          if (!tsRes.ok) throw new Error(`HTTP ${tsRes.status}`);
          const tsBody = await tsRes.json();
          console.log('📖 transcript:', tsBody.transcript);
          setTranscript(tsBody.transcript);

          // c) call price-analysis, sending both transcript and description
          console.log('💰 calling price-analysis');
          const priceRes = await fetch(`http://localhost:8000/price-analysis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              transcript: tsBody.transcript,
              description: imageAnalysisResult
            }),
          });
          if (!priceRes.ok) throw new Error(`HTTP ${priceRes.status}`);
          const priceBody = await priceRes.json();
          console.log('📝 listing from price-analysis:', priceBody.listing);

          // d) set listing & advance
          setGeneratedListing(priceBody.listing);
          setCurrentStep('review');
        } catch (err) {
          console.error('❌ post-chat flow error:', err);
          setProgressStatus('error');
        }
      })();
    }
  }, [convo.status, conversationId, currentStep]);

  // ─── 3) USER ACTIONS ─────────────────────────────────────────────────────────
  const handleListingAccept = () => {
    console.log('✅ Listing accepted:', generatedListing);
  };
  const handleListingReject = () => {
    setCurrentStep('feedback');
  };
  const handleFeedbackSubmit = (feedback: string) => {
    console.log('✍️ Feedback submitted:', feedback);
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

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-serif">
      <div className="container mx-auto px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-light text-stone-900 mb-4 tracking-wide">
             snap2cash
          </h1>
          <p className="text-lg text-stone-600 font-light max-w-lg mx-auto leading-relaxed">
            Upload a photo and let our AI create the perfect listing for your item
          </p>
        </div>
        <div className="max-w-2xl mx-auto">

          {currentStep === 'upload' && (
            <ImageUpload onImageUpload={handleImageUpload} />
          )}

          {currentStep === 'progress' && (
            <ProgressTracker status={progressStatus} onReupload={handleReupload} />
          )}

          {currentStep === 'chat' && (
            <div className="mb-6">
              <p>Status: {convo.status}</p>
              <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap h-48 overflow-y-auto">
                {transcript || 'Agent is listening...'}
              </pre>
              <audio src={convo.audioStreamUrl} autoPlay hidden />
              <button
                onClick={() => convo.endSession()}
                disabled={convo.status !== 'connected'}
                className="mt-2 px-3 py-1 bg-red-500 text-white rounded"
              >
                Hang Up
              </button>
            </div>
          )}

          {currentStep === 'review' && uploadedFile && generatedListing && (
            <ListingReview
              listing={generatedListing}
              imageFile={uploadedFile}
              onAccept={handleListingAccept}
              onReject={handleListingReject}
            />
          )}

          {currentStep === 'feedback' && (
            <FeedbackComponent onSubmit={handleFeedbackSubmit} />
          )}

        </div>
      </div>
    </div>
  );
};

export default Index;
