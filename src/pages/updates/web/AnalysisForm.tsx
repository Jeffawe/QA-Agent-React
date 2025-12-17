import { useState } from "react";
import { ExpandableSection, KeyValuePairs, ToggleSwitch } from "./usableComponents";
import ConfigFileUpload from "./configFileUpload";
import type { ConfigFile } from "../../../types";

interface AnalysisForm {
    websiteUrl: string;
    setWebsiteUrl: (url: string) => void;
    apiKey: string;
    setApiKey: (key: string) => void;
    goal: string;
    setGoal: (goal: string) => void;
    detailed: boolean;
    setDetailed: (detailed: boolean) => void;
    endpointMode: boolean;
    setEndpointMode: (endpointMode: boolean) => void;
    crossPlatform: boolean;
    setCrossPlatform: (crossPlatform: boolean) => void;
    optimizeImage: boolean;
    setOptimizeImage: (optimizeImage: boolean) => void;
    isAnalyzing: boolean;
    onStart: () => void;
    onStop: () => void;
    connected: boolean;
    connectionStatus: string;
    keyValuePairs: { key: string; value: string; id: string }[];
    setKeyValuePairs: (pairs: { key: string; value: string; id: string }[]) => void;
    handleConfigFileUpload: (file: ConfigFile | null, fileName: string) => void;
    attemptReconnection: () => void;
    isReconnecting: boolean;
}

const AnalysisForm: React.FC<AnalysisForm> = ({
    websiteUrl, setWebsiteUrl, apiKey, setApiKey, goal, setGoal,
    detailed, setDetailed, endpointMode, setEndpointMode,
    crossPlatform, setCrossPlatform, optimizeImage, setOptimizeImage,
    isAnalyzing, onStart, onStop, connected, handleConfigFileUpload, keyValuePairs, setKeyValuePairs, connectionStatus,
    attemptReconnection, isReconnecting
}) => {
    const [moreInfoExpanded, setMoreInfoExpanded] = useState(false);
    const [additionalInfoExpanded, setAdditionalInfoExpanded] = useState(false);
    const [configFileExpanded, setConfigFileExpanded] = useState(false);
    const [configFileName, setConfigFileName] = useState<string>("");
    const [configFile, setConfigFile] = useState<ConfigFile | null>(null);

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Website Analysis</h3>

            <div className="space-y-4">
                {/* URL Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                    <p className="text-xs text-gray-500 mb-2">Enter the URL of the website you want to analyze e.g https://example.com</p>
                    <input
                        type="url"
                        placeholder="https://example.com"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        disabled={isAnalyzing}
                    />
                </div>

                {/* API Key Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gemini API Key</label>
                    <p className="text-xs text-gray-500 mb-2">Enter your Gemini API key. Use FREE-TRIAL to test for free</p>
                    <input
                        type="password"
                        placeholder="Enter your API key e.g FREE-TRIAL"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        disabled={isAnalyzing}
                    />
                </div>

                {/* Goal Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Goal of the Agent</label>
                    <p className="text-xs text-gray-500 mb-2">Enter your testing goal e.g Crawl the Entire Site and Test it</p>
                    <input
                        type="text"
                        placeholder="Enter your Goal e.g Crawl the Entire Site and Test it"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        disabled={isAnalyzing}
                    />
                </div>

                {/* Toggle Switches */}
                <ToggleSwitch
                    label="Detailed Analysis"
                    description="Enable detailed analysis to get comprehensive results on every UI element per page. Note: This will take more time to complete."
                    checked={detailed}
                    onChange={setDetailed}
                    disabled={isAnalyzing}
                />

                <ToggleSwitch
                    label="Cross Platform"
                    description="Enable cross-platform analysis for agent to test on multiple platforms (Mobile, Desktop and Tablet)."
                    checked={crossPlatform}
                    onChange={setCrossPlatform}
                    disabled={isAnalyzing}
                />

                {/* More Options */}
                <ExpandableSection
                    title="More Options"
                    description="Further control over the analysis process"
                    isExpanded={moreInfoExpanded}
                    onToggle={() => setMoreInfoExpanded(!moreInfoExpanded)}
                    disabled={isAnalyzing}
                >
                    <ToggleSwitch
                        label="Endpoint Mode"
                        description="Use Endpoint mode if you're testing API endpoints instead of a website."
                        checked={endpointMode}
                        onChange={setEndpointMode}
                        disabled={isAnalyzing}
                    />
                    <ToggleSwitch
                        label="Optimize Images"
                        description="Optimize images on a page. It will lead to more accurate results but take more time."
                        checked={optimizeImage}
                        onChange={setOptimizeImage}
                        disabled={isAnalyzing}
                    />
                </ExpandableSection>

                {/* Additional Information */}
                <ExpandableSection
                    title="Additional Information"
                    description={<>Add custom key-value pairs to provide extra content for the agent to use. Check out our <a href="/docs/web/configuration" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">documentation</a> for more information (optional)</>}
                    isExpanded={additionalInfoExpanded}
                    onToggle={() => setAdditionalInfoExpanded(!additionalInfoExpanded)}
                    disabled={isAnalyzing}
                >
                    <KeyValuePairs
                        pairs={keyValuePairs}
                        setPairs={setKeyValuePairs}
                        disabled={isAnalyzing}
                    />
                </ExpandableSection>

                <ExpandableSection
                    title="Config File Upload"
                    description="Upload a JSON config file to auto-populate settings (optional)"
                    isExpanded={configFileExpanded}
                    onToggle={() => setConfigFileExpanded(!configFileExpanded)}
                    disabled={isAnalyzing}
                >
                    <ConfigFileUpload
                        configFile={configFile}
                        configFileName={configFileName}
                        onFileUpload={() => { handleConfigFileUpload(configFile, configFileName) }}
                        onClear={() => {
                            setConfigFile(null);
                            setConfigFileName("");
                        }}
                        disabled={isAnalyzing}
                    />
                </ExpandableSection>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                        onClick={onStart}
                        className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${isAnalyzing ? "bg-gray-400 cursor-not-allowed text-white" : "bg-purple-600 hover:bg-purple-700 text-white"
                            }`}
                        disabled={isAnalyzing}
                    >
                        {isAnalyzing ? (
                            <span className="flex items-center justify-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Analyzing...</span>
                            </span>
                        ) : (
                            "Start Analysis"
                        )}
                    </button>

                    {connectionStatus === "error" && isAnalyzing && (
                        <button
                            onClick={attemptReconnection}
                            disabled={isReconnecting}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
                        >
                            {isReconnecting ? "Reconnecting..." : "Try Reconnect"}
                        </button>
                    )}

                    {(connected || isAnalyzing) && (
                        <button
                            onClick={onStop}
                            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200"
                        >
                            Stop Analysis
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalysisForm;