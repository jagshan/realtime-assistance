import React from 'react';

interface ErrorDisplayProps {
  message: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  if (!message) return null;
  return (
    <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded-lg relative my-4 w-full" role="alert">
      <strong className="font-bold">Error: </strong>
      <span className="block sm:inline">{message}</span>
    </div>
  );
};

export default ErrorDisplay;
