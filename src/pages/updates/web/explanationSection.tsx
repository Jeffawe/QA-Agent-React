import { useState } from "react";

const ExplanationSection: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 border border-gray-200">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
            Web-Based Analysis
          </h3>
          {isExpanded && (
            <div>
              <p className="text-gray-600 leading-relaxed mb-4">
                Analyze any website using our cloud-based QA Agent. No local installation required - just provide a URL and your API key.
              </p>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">How it works:</h4>
                <ol className="text-sm text-purple-800 space-y-1">
                  <li>1. Enter the website URL you want to analyze</li>
                  <li>2. Provide your API key for authentication</li>
                  <li>3. Enter your testing goals e.g Crawl the Entire Site and Test it</li>
                  <li>4. Click "Start Analysis" to begin the process</li>
                  <li>5. Monitor real-time progress and results</li>
                </ol>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-shrink-0 ml-4 p-1 rounded-full hover:bg-yellow-200 transition-colors duration-200"
        >
          <svg
            className={`w-5 h-5 text-yellow-600 hover:text-yellow-800 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ExplanationSection;