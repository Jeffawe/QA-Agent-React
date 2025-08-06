import { useState } from "react";
import BetaWarning from "../../BetaWarning";

const defaultGoal = "Crawl the entire page";

const betaMessage = `QA Agent is currently in beta. Please note:

- Some features may not work as expected (Do reach out to me if they don't)
- The goal field is not yet configurable
- Analysis results may vary in accuracy (I'm still working heavily on better analysis per page)
- I appreciate your feedback as I improve the tool`;

const SetupAndUsage = () => {
    const [goal] = useState(defaultGoal);
    const [key, setKey] = useState('');
    const [url, setUrl] = useState('');
    const [port, setPort] = useState('3001');
    const [websocketport, setWebsocketPort] = useState('3002');
    const [testMode, setTestMode] = useState(false);

    const generateCommand = () => {
        return `agent-run --goal='${goal}' --key='${key}' --url='${url}' --port=${port} --websocket=${websocketport} --test-mode=${testMode}`;
    };

    const generateConfigCommand = () => {
        return `agent-run --config='~/Downloads/qa-agent-config.json'`;
    };

    const generateAndDownloadConfig = () => {
        const configContent = `{
            "goal": "${goal}",
            "key": "${key}",
            "url": "${url}",
            "port": ${port},
            "websocket": ${websocketport},
            "test-mode": ${testMode}
            }`;

        // Create blob and download
        const blob = new Blob([configContent], {
            type: 'application/json'
        });

        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = 'qa-agent-config.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="space-y-8 sm:space-y-12">
            <div>
                <h1 className="text-2xl sm:text-4xl font-bold mb-4 text-gray-800">Setup & Usage</h1>
                <p className="text-base sm:text-lg text-gray-600">Get started with QA Agent in minutes</p>
            </div>

            <BetaWarning message={betaMessage} />

            {/* Installation Section */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">Installation</h2>
                <p className="text-gray-600 mb-3 text-sm sm:text-base">Install globally using npm:</p>
                <div className="relative">
                    <pre className="bg-gray-900 text-green-400 p-3 sm:p-4 rounded-lg font-mono text-xs sm:text-sm overflow-x-auto">npm install -g qa-agent@beta</pre>
                    <button
                        onClick={() => copyToClipboard('npm install -g qa-agent@beta')}
                        className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3 py-1 rounded text-xs transition-colors duration-200"
                    >
                        Copy
                    </button>
                </div>
            </div>

            {/* Test Section */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">Beta Testing</h2>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                    Test Mode should only be set to true if you are a verified beta tester. If not, please leave it as false.
                    Verified testers do not need to input an API key (GenAI Key) instead use the unique key sent to your email.
                </p>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                    Users can join as beta testers to get limited access with a Gemini API key.
                    <span className="text-blue-600 hover:text-blue-800 underline ml-1 cursor-pointer">
                        Visit our Testing page
                    </span> to sign up and get your access credentials.
                </p>
            </div>

            {/* Usage Section */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">Basic Usage</h2>
                <p className="text-gray-600 mb-3 text-sm sm:text-base">Run the agent with the following command structure (Use the command generator below to get started):</p>
                <div className="relative mb-4">
                    <pre className="bg-gray-900 text-green-400 p-3 sm:p-4 rounded-lg font-mono text-xs sm:text-sm overflow-x-auto break-all sm:break-normal">agent-run --goal='...' --key='...' --url='...' --port=3001 --websocket=3002 --test-mode=false</pre>
                    <button
                        onClick={() => copyToClipboard("agent-run --goal='...' --key='...' --url='...' --port=3001 --websocket=3002 --test-mode=false")}
                        className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3 py-1 rounded text-xs transition-colors duration-200"
                    >
                        Copy
                    </button>
                </div>
                <p className="text-gray-600 mb-3 text-sm sm:text-base">Alternatively, you can use a configuration file for more advanced settings. Config files support many additional parameters beyond the basic command-line options:</p>
                <div className="relative mb-3">
                    <pre className="bg-gray-900 text-green-400 p-3 sm:p-4 rounded-lg font-mono text-xs sm:text-sm overflow-x-auto">agent-run --config='./path/to/config.json'</pre>
                    <button
                        onClick={() => copyToClipboard("agent-run --config='./path/to/config.json'")}
                        className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3 py-1 rounded text-xs transition-colors duration-200"
                    >
                        Copy
                    </button>
                </div>
                <p className="text-gray-600 text-sm sm:text-base">
                    <span className="font-medium">💡 Tip:</span> Config files include advanced parameters like custom crawling rules, timeout settings, output formats, and more.
                    <span className="text-blue-600 hover:text-blue-800 underline cursor-pointer ml-1">
                        Visit the Configuration section
                    </span> to explore all available options and create more powerful automation workflows.
                </p>
            </div>

            {/* Command Generator */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Command Generator</h2>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">Fill in the parameters below to generate your custom command:</p>

                <div className="space-y-4 sm:space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Testing Goal</label>
                        <input
                            placeholder="e.g., 'Find all broken links and UI inconsistencies'"
                            value={defaultGoal}
                            disabled
                            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed text-sm sm:text-base"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Google GenAI Key (We use Gemini as the model.) (For Test users set this as the unique key given to you)
                        </label>
                        <input
                            placeholder="Your Google Generative AI API key"
                            value={key}
                            onChange={e => setKey(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Target URL</label>
                        <input
                            placeholder="https://yourwebsite.com"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Port (Optional)</label>
                            <input
                                placeholder="3001"
                                value={port}
                                onChange={e => setPort(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Web Socket Port (Optional)</label>
                            <input
                                placeholder="3002"
                                value={websocketport}
                                onChange={e => setWebsocketPort(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Test Mode (Optional) (For Test Users set this as true)</label>
                        <select
                            value={testMode.toString()}
                            onChange={e => setTestMode(e.target.value === 'true')}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                        >
                            <option value="false">False</option>
                            <option value="true">True</option>
                        </select>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Generated Command (Copy this and paste in your terminal to run the service)</label>
                        <div className="relative">
                            <pre className="bg-gray-900 text-green-400 p-3 sm:p-4 rounded-lg font-mono text-xs sm:text-sm overflow-x-auto border-2 border-blue-200 break-all sm:break-normal whitespace-pre-wrap sm:whitespace-pre">
                                {generateCommand()}
                            </pre>
                            <button
                                onClick={() => copyToClipboard(generateCommand())}
                                className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3 py-1 rounded text-xs transition-colors duration-200"
                            >
                                Copy
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={generateAndDownloadConfig}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors duration-200 text-sm sm:text-base"
                        >
                            Generate Config File
                        </button>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Config File Command</label>
                        <div className="relative">
                            <pre className="bg-gray-900 text-green-400 p-3 sm:p-4 rounded-lg font-mono text-xs sm:text-sm overflow-x-auto border-2 border-blue-200">
                                {generateConfigCommand()}
                            </pre>
                            <button
                                onClick={() => copyToClipboard(generateConfigCommand())}
                                className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3 py-1 rounded text-xs transition-colors duration-200"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Updates Section */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">Live Updates</h2>
                <p className="text-gray-600 mb-3 text-sm sm:text-base">
                    You can view live updates from the model in the <span className="text-blue-600 hover:underline cursor-pointer">Updates</span> page.
                </p>
                <p className="text-gray-600 mb-3 text-sm sm:text-base">
                    Upon running the code. A new browser window will open (via puppeteer) to view the agent progress. The updates tab simply provide you a textual flow of the agents actions
                </p>
            </div>
        </div>
    );
};

export default SetupAndUsage;