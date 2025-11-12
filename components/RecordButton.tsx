import React from 'react';

interface RecordButtonProps {
  isRecording: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const MicIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3ZM17 12a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-2.08A7 7 0 0 0 19 12h-2Z" />
    </svg>
);

const StopIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M6 6h12v12H6V6Z" />
    </svg>
);

const RecordButton: React.FC<RecordButtonProps> = ({ isRecording, onClick, disabled }) => {
  const baseClasses = "flex items-center justify-center gap-3 px-6 py-3 font-semibold text-white rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed";
  const recordingClasses = "bg-red-600 hover:bg-red-700 focus:ring-red-400";
  const notRecordingClasses = "bg-blue-600 hover:bg-blue-700 focus:ring-blue-400";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${isRecording ? recordingClasses : notRecordingClasses}`}
      aria-label={isRecording ? "Stop recording" : "Start recording"}
    >
      {isRecording ? (
        <>
          <StopIcon className="w-6 h-6"/>
          <span>Stop Recording</span>
        </>
      ) : (
        <>
          <MicIcon className="w-6 h-6"/>
          <span>Start Recording</span>
        </>
      )}
    </button>
  );
};

export default RecordButton;
