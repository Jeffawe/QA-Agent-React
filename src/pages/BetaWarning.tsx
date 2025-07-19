import React, { useState } from 'react';

interface BetaWarningProps { 
  message: string; 
}

const BetaWarning: React.FC<BetaWarningProps> = ({ message }) => { 
  const [isExpanded, setIsExpanded] = useState(true);

  return ( 
    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-md mb-6"> 
      <div className="flex items-start justify-between"> 
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex-shrink-0"> 
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"> 
              <svg className="w-5 h-5 text-yellow-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"> 
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" /> 
              </svg> 
            </div> 
          </div> 
          <div className="flex-1"> 
            <div className="flex items-center space-x-2 mb-2"> 
              <h3 className="text-lg font-semibold text-yellow-800">Beta Version</h3> 
              <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-medium"> 
                BETA 
              </span> 
            </div> 
            {isExpanded && (
              <p className="text-yellow-700 leading-relaxed"> 
                {message} 
              </p>
            )}
          </div> 
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-shrink-0 ml-4 p-1 rounded-full hover:bg-yellow-200 transition-colors duration-200"
          aria-label={isExpanded ? "Hide beta warning" : "Show beta warning"}
        >
          <svg className={`w-5 h-5 text-yellow-600 hover:text-yellow-800 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div> 
    </div> 
  ); 
};

export default BetaWarning;