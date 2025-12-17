import type { ConfigFile } from "../../../types";

interface ConfigFileUploadProps {
    configFile: ConfigFile | null;
    configFileName: string;
    onFileUpload: (file: ConfigFile, fileName: string) => void;
    onClear: () => void;
    disabled?: boolean;
}

const ConfigFileUpload: React.FC<ConfigFileUploadProps> = ({
    configFile,
    configFileName,
    onFileUpload,
    onClear,
    disabled = false
}) => {
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                const parsed: ConfigFile = json;
                onFileUpload(parsed, file.name);
                alert("✅ Config file loaded successfully!");
            } catch (error) {
                alert("❌ Invalid JSON file. Please check the file format.");
                console.error("Error parsing config file:", error);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-3 mt-4">
            {!configFile ? (
                <div>
                    <label className="block">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200 cursor-pointer">
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleFileChange}
                                disabled={disabled}
                                className="hidden"
                            />
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                            >
                                <path
                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <p className="mt-2 text-sm text-gray-600">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                JSON file only
                            </p>
                        </div>
                    </label>
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-800">
                            <span className="font-semibold">Expected format:</span> Upload a JSON config with fields like goal, key, url, detailed, and data object.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                            <svg
                                className="w-5 h-5 text-green-600 mt-0.5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-green-800">
                                    Config file loaded
                                </p>
                                <p className="text-xs text-green-700 mt-1">
                                    {configFileName}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClear}
                            disabled={disabled}
                            className={`text-red-600 hover:text-red-800 transition-colors ${
                                disabled ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            aria-label="Clear config file"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConfigFileUpload;