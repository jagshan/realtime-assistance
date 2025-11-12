import React from 'react';

interface ResponseDisplayProps {
  response: string;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ response }) => {
  if (!response) return null;

  return (
    <div className="w-full mt-8 p-6 bg-gray-800 border border-gray-700 rounded-xl shadow-md">
      <h3 className="text-2xl font-semibold text-blue-400 mb-4">Model Response</h3>
      <div className="prose prose-invert max-w-none whitespace-pre-wrap text-gray-200 text-lg max-h-96 overflow-y-auto">
        {response}
      </div>
    </div>
  );
};

export default ResponseDisplay;