import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BetaWarning from './BetaWarning';

const betaMessage: string = `QA Agent is currently in beta. Please note:

- Some features may not work as expected (Do reach out to me if they don't)
- The goal field is not yet configurable
- Analysis results may vary in accuracy (I'm still working heavily on better analysis per page)
- I appreciate your feedback as I improve the tool`;

const defaultGoal: string = "Crawl the entire page";

const HelpPage: React.FC = () => {
  const [goal] = useState(defaultGoal);
  const [key, setKey] = useState('');
  const [url, setUrl] = useState('');
  const [port, setPort] = useState('3001');
  const [websocketport, setWebsocketPort] = useState('3002');

  const generateCommand = () => {
    return `agent-run --goal='${goal}' --key='${key}' --url='${url}' --port=${port} --websocket=${websocketport}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold mb-8 text-gray-800">Setup & Usage</h2>

        <BetaWarning message={betaMessage} />

        {/* Explanation Box */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">How QA Agent Works</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                QA Agent is a powerful automated testing tool that crawls through your website, analyzes each page,
                and identifies potential bugs, UI issues, and accessibility problems. Simply provide your website URL,
                set your testing goals, and let the AI do the heavy lifting.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>Automated page crawling</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>AI-powered bug detection</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>Detailed reporting</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>Custom goal setting</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Installation Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">Installation</h3>
          <p className="text-gray-600 mb-3">Install globally using npm:</p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">npm install -g qa-agent@beta</pre>
        </div>

        {/* Usage Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">Basic Usage</h3>
          <p className="text-gray-600 mb-3">Run the agent with the following command structure (Use the command generator below to get started):</p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">agent-run --goal='...' --key='...' --url='...' --port=3001 --websocket=3002</pre>
        </div>

        {/* Command Generator */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Command Generator</h3>
          <p className="text-gray-600 mb-6">Fill in the parameters below to generate your custom command:</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Testing Goal</label>
              <input
                placeholder="e.g., 'Find all broken links and UI inconsistencies'"
                value={defaultGoal}
                disabled
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Google GenAI Key (We use Gemini as the model.)</label>
              <input
                placeholder="Your Google Generative AI API key"
                value={key}
                onChange={e => setKey(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                type="password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target URL</label>
              <input
                placeholder="https://yourwebsite.com"
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Port (Optional)</label>
              <input
                placeholder="3001"
                value={port}
                onChange={e => setPort(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Web Socket Port (Optional)</label>
              <input
                placeholder="3002"
                value={websocketport}
                onChange={e => setWebsocketPort(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Generated Command (Copy this and paste in your terminal to run the service)</label>
              <div className="relative">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto border-2 border-blue-200">
                  {generateCommand()}
                </pre>
                <button
                  onClick={() => navigator.clipboard.writeText(generateCommand())}
                  className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors duration-200"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Start Server Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">Starting the Server</h3>
          <p className="text-gray-600 mb-3">The Server will be running on the port. Simply run the command below to start the server or go to
            the <Link to="/updates" className="text-blue-600 hover:underline">Updates </Link> page
            to start it</p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">curl http://localhost:{port}/start/1</pre>
        </div>

        {/* Live Updates Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">Live Updates</h3>
          <p className="text-gray-600 mb-3">You can view live updates from the model in the <Link to="/updates" className="text-blue-600 hover:underline">Updates</Link> page.</p>
          <p className="text-gray-600 mb-3">Upon running the code. A new browser window will open (via puppeteer) to view the agent progress. The updates tab simply provide you a textual flow of the agents actions</p>
        </div>
      </div>
    </div>
  );
}

export default HelpPage;