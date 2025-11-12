import React, { useState, useEffect, useRef } from 'react';
import { generateResponse } from './services/geminiService';
import RecordButton from './components/RecordButton';
import TemperatureSelector from './components/TemperatureSelector';
import Spinner from './components/Spinner';
import ResponseDisplay from './components/ResponseDisplay';
import ErrorDisplay from './components/ErrorDisplay';
import ImageCropper from './components/ImageCropper';
import SubmitButton from './components/SubmitButton';

// FIX: Add minimal Web Speech API types to fix TypeScript errors.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start(): void;
  stop(): void;
}
interface SpeechRecognitionEvent extends Event { readonly resultIndex: number; readonly results: SpeechRecognitionResultList; }
interface SpeechRecognitionResultList { readonly length: number; item(index: number): SpeechRecognitionResult;[index: number]: SpeechRecognitionResult; }
interface SpeechRecognitionResult { readonly isFinal: boolean; readonly length: number; item(index: number): SpeechRecognitionAlternative;[index: number]: SpeechRecognitionAlternative; }
interface SpeechRecognitionAlternative { readonly transcript: string; }
interface SpeechRecognitionErrorEvent extends Event { readonly error: string; }
interface SpeechRecognitionStatic { new (): SpeechRecognition; }
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

const parseDataUrl = (dataUrl: string) => {
    const match = dataUrl.match(/data:(.*);base64,(.*)/);
    if (!match) return null;
    return { mimeType: match[1], b64: match[2] };
};

const App: React.FC = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [temperature, setTemperature] = useState<number>(0.3);
  const [llmResponse, setLlmResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isSupported, setIsSupported] = useState<boolean>(false);
  
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!transcribedText.trim() && !croppedImage) {
        setError("Please provide text or an image before submitting.");
        return;
    }

    setIsLoading(true);
    setError('');
    setLlmResponse('');
    try {
        const imagePayload = croppedImage ? parseDataUrl(croppedImage) : null;
        const response = await generateResponse(transcribedText, temperature, imagePayload);
        setLlmResponse(response);
    } catch (e: any) {
        setError(e.message || 'An unknown error occurred.');
    } finally {
        setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (SpeechRecognitionAPI) {
      setIsSupported(true);
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = false; 

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        setTranscribedText(prev => prev + finalTranscript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setError(`Speech recognition error: ${event.error}. Please check microphone permissions.`);
        console.error('Speech recognition error', event);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      setError("Speech recognition is not supported in this browser. Please try Chrome or Edge.");
    }
    
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (e) => {
              setImageToCrop(e.target?.result as string);
            };
            reader.readAsDataURL(blob);
          }
          event.preventDefault(); 
          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  const clearPromptState = () => {
      setTranscribedText('');
      setCroppedImage(null);
      setLlmResponse('');
      setError('');
  };

  const handleToggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      clearPromptState();
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files.length > 0) {
          const file = event.target.files[0];
          const reader = new FileReader();
          reader.addEventListener('load', () => {
              setImageToCrop(reader.result as string);
          });
          reader.readAsDataURL(file);
          event.target.value = ''; // Reset file input
      }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6">
      <main className="w-full max-w-5xl mx-auto flex flex-col items-center">
        {imageToCrop && (
            <ImageCropper
                imageSrc={imageToCrop}
                onCrop={(img) => {
                    setCroppedImage(img);
                    setImageToCrop(null);
                }}
                onCancel={() => setImageToCrop(null)}
            />
        )}
        <header className="text-center my-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Multimodal AI Assistant
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Speak, attach an image, and get intelligent responses from Gemini.
          </p>
        </header>

        {!isSupported ? (
          <ErrorDisplay message={error} />
        ) : (
          <>
            <div className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6 rounded-xl shadow-lg flex flex-col gap-4">
              <label htmlFor="transcript" className="font-semibold text-gray-300">
                Your prompt (speak or type):
              </label>
              <textarea
                id="transcript"
                rows={4}
                value={transcribedText}
                onChange={(e) => setTranscribedText(e.target.value)}
                placeholder={isRecording ? "Listening..." : "Your speech or text will appear here..."}
                className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isLoading}
              />
               {croppedImage && (
                  <div className="relative w-48 h-48 group">
                      <img src={croppedImage} alt="User-provided context" className="rounded-lg w-full h-full object-cover" />
                      <button 
                          onClick={() => setCroppedImage(null)}
                          className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 group-hover:opacity-100 opacity-0 transition-opacity"
                          aria-label="Remove image"
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                      </button>
                  </div>
              )}
              <div className="flex flex-wrap items-center gap-4">
                  <RecordButton isRecording={isRecording} onClick={handleToggleRecording} disabled={isLoading} />
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50">
                      Attach Image
                  </button>
              </div>
               <p className="text-xs text-gray-800">Or paste an image from your clipboard (Ctrl+V).</p>
              <TemperatureSelector value={temperature} onChange={setTemperature} />
            </div>

            <div className="my-8">
                <SubmitButton onClick={handleSubmit} disabled={isLoading || (!transcribedText && !croppedImage)} />
            </div>
            
            <div className="w-full">
                {isLoading && <Spinner />}
                {!isLoading && error && <ErrorDisplay message={error} />}
                {!isLoading && llmResponse && <ResponseDisplay response={llmResponse} />}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default App;