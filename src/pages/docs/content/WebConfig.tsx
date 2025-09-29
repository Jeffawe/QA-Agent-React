import { EndpointTesting } from "./EndpointTesting";

const WebConfig = () => {
  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-bold mb-4 text-gray-800">Web Setup</h1>
        <p className="text-base sm:text-lg text-gray-600">
          Customize QA Agent settings and parameters
        </p>
      </div>

      {/* Web Testing Overview */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">Web Testing</h2>
        <p className="text-gray-600 mb-4 text-sm sm:text-base">
          Web testing allows users to easily use QA-Agent right from the browser. Simply head over to the <span className="text-blue-600 hover:underline cursor-pointer" onClick={() => window.location.href = "/updates"}>Updates</span> tab and set the URL, API-key and goal and get testing.
        </p>
        <p className="text-gray-600 text-sm sm:text-base">
          You can also fill in Key-Value pairs for custom information you want the system to use or know (use the existing Data Items block below).
        </p>
      </div>

      {/* Detailed Mode Section */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">Detailed Mode</h2>
        <p className="text-gray-600 text-sm sm:text-base mb-3">
          Users can also turn on detailed mode to have more detailed analysis. Detailed mode tests all UI elements, buttons, forms on a page to ensure everything is working perfectly.
        </p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-yellow-800 text-sm">
            ⏱️ This takes more time (but we are always working to make it faster).
          </p>
        </div>
      </div>

      {/* Data Items Section */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-shrink-0 self-center sm:self-start">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Data Items</h2>
            <p className="text-gray-600 leading-relaxed mb-4 text-sm sm:text-base">
              Add key-value pairs containing data the QA Agent will need during testing. This can include usernames, passwords, or any other fillable elements required by your test scenarios.
            </p>
          </div>
        </div>
      </div>

      {/* Endpoint Testing Component */}
      <EndpointTesting />
    </div>
  );
};

export default WebConfig;