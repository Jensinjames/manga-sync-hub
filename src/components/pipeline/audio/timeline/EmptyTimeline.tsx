
import React from 'react';

export const EmptyTimeline: React.FC = () => {
  return (
    <div className="border border-dashed border-gray-500 rounded-lg p-12 flex flex-col items-center justify-center">
      <p className="text-gray-500 text-center">
        No panels available. Please generate narration first.
      </p>
    </div>
  );
};
