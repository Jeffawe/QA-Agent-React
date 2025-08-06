import { useState } from "react";

interface ConfigField {
    key: string;
    label: string;
    type: 'text' | 'password' | 'url' | 'number' | 'boolean' | 'select';
    defaultValue: string | number | boolean;
    description: string;
    placeholder?: string;
    required: boolean;
    disabled: boolean;
    note?: string;
    options?: Array<{value: string | number | boolean, label: string}>; // For select fields
}

interface ConfigState {
    [key: string]: string | number | boolean;
}

// External configuration array - easily extensible
const configurationFields: ConfigField[] = [
    {
        key: "goal",
        label: "Testing Goal",
        type: "text",
        defaultValue: "Crawl the entire page",
        description: "Define what the QA Agent should focus on during testing. This guides the AI's analysis and reporting priorities.",
        placeholder: "e.g., 'Find all broken links and UI inconsistencies'",
        required: true,
        disabled: true,
        note: "Currently not configurable in beta version"
    },
    {
        key: "key",
        label: "Google GenAI API Key",
        type: "password",
        defaultValue: "",
        description: "Your Google Generative AI API key for accessing Gemini models. For beta testers, use the unique key provided via email instead.",
        placeholder: "Your Google Generative AI API key",
        required: true,
        disabled: false,
        note: "Keep this secure and never share publicly"
    },
    {
        key: "url",
        label: "Target URL",
        type: "url",
        defaultValue: "",
        description: "The website URL where QA Agent will start crawling and testing. Must be a valid, accessible URL.",
        placeholder: "https://yourwebsite.com",
        required: true,
        disabled: false,
        note: "Works perfectly with public websites. Still testing with local ones but feel free to try it out!"
    },
    {
        key: "port",
        label: "Server Port",
        type: "number",
        defaultValue: 3001,
        description: "The port number for the QA Agent server. Choose an available port on your system.",
        placeholder: "3001",
        required: false,
        disabled: false,
        note: "Default is 3001, change if port is already in use"
    },
    {
        key: "websocket",
        label: "WebSocket Port",
        type: "number",
        defaultValue: 3002,
        description: "Port for real-time communication and live updates. Should be different from the server port.",
        placeholder: "3002",
        required: false,
        disabled: false,
        note: "Used for live monitoring in the Updates page"
    },
    {
        key: "test-mode",
        label: "Test Mode",
        type: "boolean",
        defaultValue: false,
        description: "Enable test mode for verified beta testers. Regular users should keep this disabled.",
        required: false,
        disabled: false,
        note: "Only enable if you're a verified beta tester"
    }
];

const Configuration = () => {
    // Initialize state from configuration fields
    const [config, setConfig] = useState<ConfigState>(() => {
        const initialConfig: ConfigState = {};
        configurationFields.forEach(field => {
            initialConfig[field.key] = field.defaultValue;
        });
        return initialConfig;
    });

    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleFieldChange = (key: string, value: string | number | boolean) => {
        setConfig(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const generateConfigFile = () => {
        return JSON.stringify(config, null, 4);
    };

    const downloadConfigFile = () => {
        const configContent = generateConfigFile();
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

    const renderField = (field: ConfigField) => {
        const value = config[field.key];

        switch (field.type) {
            case 'boolean':
                return (
                    <select
                        value={value.toString()}
                        onChange={(e) => handleFieldChange(field.key, e.target.value === 'true')}
                        disabled={field.disabled}
                        className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                            field.disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                        }`}
                    >
                        <option value="false">False</option>
                        <option value="true">True</option>
                    </select>
                );

            case 'number':
                return (
                    <input
                        type="number"
                        value={value as number}
                        onChange={(e) => handleFieldChange(field.key, Number(e.target.value))}
                        placeholder={field.placeholder}
                        disabled={field.disabled}
                        className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                            field.disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                        }`}
                    />
                );

            case 'password':
                return (
                    <input
                        type="password"
                        value={value as string}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        disabled={field.disabled}
                        className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                            field.disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                        }`}
                    />
                );

            default: // text, url, etc.
                return (
                    <input
                        type={field.type}
                        value={value as string}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        disabled={field.disabled}
                        className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                            field.disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                        }`}
                    />
                );
        }
    };

    return (
        <div className="space-y-8 sm:space-y-12">
            <div>
                <h1 className="text-2xl sm:text-4xl font-bold mb-4 text-gray-800">Configuration</h1>
                <p className="text-base sm:text-lg text-gray-600">Customize QA Agent settings and parameters</p>
            </div>

            {/* Overview Section */}
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
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Configuration Files</h2>
                        <p className="text-gray-600 leading-relaxed mb-4 text-sm sm:text-base">
                            Configuration files provide a clean way to manage QA Agent settings without long command-line arguments. 
                            Create, customize, and reuse configurations for different testing scenarios.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-700">
                            <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></span>
                                <span>Reusable configurations</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></span>
                                <span>Environment-specific settings</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></span>
                                <span>Version control friendly</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></span>
                                <span>Easy team sharing</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Configuration Fields */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-0">Configuration Parameters</h2>
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="text-sm text-blue-600 hover:text-blue-800 underline transition-colors duration-200 self-start sm:self-center"
                    >
                        {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                    </button>
                </div>

                <div className="space-y-6">
                    {configurationFields.map((field, index) => (
                        <div key={field.key} className={`${index > 2 && !showAdvanced ? 'hidden' : ''}`}>
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-0">
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                    {field.disabled && <span className="text-amber-500 ml-2">(Beta - Not Configurable)</span>}
                                </label>
                            </div>
                            
                            {renderField(field)}
                            
                            <div className="mt-2 space-y-1">
                                <p className="text-xs sm:text-sm text-gray-600">{field.description}</p>
                                {field.note && (
                                    <p className="text-xs text-blue-600 font-medium">💡 {field.note}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Generated Configuration */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Generated Configuration</h2>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                    Preview and download your configuration file. Save this as <code className="bg-gray-100 px-2 py-1 rounded text-sm">qa-agent-config.json</code> and use it with the config command.
                </p>

                <div className="relative mb-4">
                    <pre className="bg-gray-900 text-green-400 p-3 sm:p-4 rounded-lg font-mono text-xs sm:text-sm overflow-x-auto max-h-64 sm:max-h-96">
{generateConfigFile()}
                    </pre>
                    <button
                        onClick={() => copyToClipboard(generateConfigFile())}
                        className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3 py-1 rounded text-xs transition-colors duration-200"
                    >
                        Copy JSON
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={downloadConfigFile}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors duration-200 text-sm sm:text-base"
                    >
                        Download Config File
                    </button>
                </div>
            </div>

            {/* Usage Instructions */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">Using Configuration Files</h2>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                    Once you've downloaded your configuration file, use it with the following command:
                </p>
                
                <div className="relative mb-4">
                    <pre className="bg-gray-900 text-green-400 p-3 sm:p-4 rounded-lg font-mono text-xs sm:text-sm overflow-x-auto">agent-run --config='./qa-agent-config.json'</pre>
                    <button
                        onClick={() => copyToClipboard("agent-run --config='./qa-agent-config.json'")}
                        className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3 py-1 rounded text-xs transition-colors duration-200"
                    >
                        Copy
                    </button>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-semibold text-amber-900 mb-2 text-sm sm:text-base">Best Practices:</h4>
                    <ul className="text-xs sm:text-sm text-amber-800 space-y-1 ml-4">
                        <li>• Store configuration files in your project directory</li>
                        <li>• Use descriptive names for different environments (dev-config.json, prod-config.json)</li>
                        <li>• Never commit API keys to version control</li>
                        <li>• Test your configuration with a small website first</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Configuration;