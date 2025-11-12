import React from 'react';

interface SubmitButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405Z" />
    </svg>
);


const SubmitButton: React.FC<SubmitButtonProps> = ({ onClick, disabled }) => {
    const baseClasses = "flex items-center justify-center gap-3 px-8 py-4 font-semibold text-white rounded-full shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed";
    const activeClasses = "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:ring-purple-400";
    
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${activeClasses}`}
            aria-label="Get response from AI"
        >
            <SendIcon className="w-6 h-6" />
            <span>Get Response</span>
        </button>
    );
};

export default SubmitButton;
