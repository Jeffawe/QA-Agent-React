import React from 'react';
import { X } from 'lucide-react';
import type { Statistics } from '../../../types';

interface DoneModalProps {
  stats: Statistics;
  onClose: () => void;
  onFeedbackClick: () => void;
}

const DoneModal: React.FC<DoneModalProps> = ({ 
  stats, 
  onClose,
  onFeedbackClick 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Heading */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Agent is Done with Analysis
          </h2>
          <p className="text-gray-600 mb-6">A summary of results</p>

          {/* Statistics Grid */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-gray-700 font-medium">Pages Visited</span>
              <span className="text-blue-600 font-bold text-lg">{stats.totalPagesVisited}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700 font-medium">Links Clicked</span>
              <span className="text-green-600 font-bold text-lg">{stats.totalLinksClicked}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-gray-700 font-medium">Bugs Found</span>
              <span className="text-red-600 font-bold text-lg">{stats.totalBugsFound}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-gray-700 font-medium">Token Usage</span>
              <span className="text-purple-600 font-bold text-lg">{stats.totalTokenUsage.toLocaleString()}</span>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="border-t pt-4">
            <p className="text-gray-600 text-sm mb-3">
              For feedback, click this button to leave feedback or go to{' '}
              <span className="font-mono text-blue-600">/docs/feedback</span>{' '}
              to leave feedback on how the agent did.
            </p>
            
            <button
              onClick={onFeedbackClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
            >
              Leave Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoneModal;