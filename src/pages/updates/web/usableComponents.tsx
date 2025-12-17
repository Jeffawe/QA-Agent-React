import React from 'react';

// ===== INTERFACES =====
interface ToggleSwitchProps {
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    configFile?: boolean; // Show "(from config)" badge
}

interface ExpandableSectionProps {
    title: string;
    children: React.ReactNode;
    description: string | React.ReactNode; // Allow JSX for links
    isExpanded: boolean;
    onToggle: () => void;
    disabled?: boolean;
}

interface KeyValuePair {
    key: string;
    value: string;
    id: string;
}

interface KeyValuePairsProps {
    pairs: KeyValuePair[];
    setPairs: (pairs: KeyValuePair[]) => void;
    disabled?: boolean;
}

interface ConnectionStatusProps {
    status: 'connected' | 'connecting' | 'reconnecting' | 'error' | 'disconnected';
    reconnectAttempts?: number;
    maxAttempts?: number;
}

// ===== TOGGLE SWITCH =====
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ 
    label, 
    description, 
    checked, 
    onChange, 
    disabled = false,
    configFile = false 
}) => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <label className="flex items-center cursor-pointer">
            <input 
                type="checkbox" 
                checked={checked} 
                onChange={(e) => onChange(e.target.checked)} 
                disabled={disabled} 
                className="sr-only" 
            />
            <div className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ${
                checked ? "bg-blue-600" : "bg-gray-300"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ${
                    checked ? "translate-x-6" : "translate-x-1"
                }`} />
            </div>
            <span className="ml-3 text-sm font-medium text-gray-700">
                {label}
                {configFile && (
                    <span className="ml-2 text-xs text-blue-600">(from config)</span>
                )}
            </span>
        </label>
        <p className="text-sm text-blue-700 mt-2">{description}</p>
    </div>
);

// ===== EXPANDABLE SECTION =====
const ExpandableSection: React.FC<ExpandableSectionProps> = ({ 
    title, 
    description, 
    isExpanded, 
    onToggle, 
    disabled = false, 
    children 
}) => (
    <div className="border border-gray-200 rounded-lg">
        <button
            onClick={onToggle}
            disabled={disabled}
            className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 rounded-lg ${
                disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
            <div>
                <h4 className="font-medium text-gray-800">{title}</h4>
                <p className="text-sm text-gray-600">{description}</p>
            </div>
            <svg 
                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
            >
                <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 9l-7 7-7-7" 
                />
            </svg>
        </button>
        {isExpanded && (
            <div className="px-4 pb-4 border-t border-gray-100">
                <div className="space-y-3 mt-4">{children}</div>
            </div>
        )}
    </div>
);

// ===== KEY-VALUE PAIRS =====
const KeyValuePairs: React.FC<KeyValuePairsProps> = ({ pairs, setPairs, disabled = false }) => {
    const MAX = 10;

    const add = () => {
        if (pairs.length < MAX) {
            setPairs([...pairs, { key: "", value: "", id: crypto.randomUUID() }]);
        }
    };

    const remove = (id: string) => {
        if (pairs.length > 1) {
            setPairs(pairs.filter(p => p.id !== id));
        }
    };

    const update = (id: string, field: 'key' | 'value', value: string) => {
        setPairs(pairs.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    return (
        <>
            <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Add up to {MAX} custom key-value pairs</p>
                <button
                    onClick={add}
                    disabled={disabled || pairs.length >= MAX}
                    className={`text-sm px-3 py-1 rounded-md transition-colors ${
                        disabled || pairs.length >= MAX 
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    }`}
                >
                    Add Pair
                </button>
            </div>
            {pairs.map((pair) => (
                <div key={pair.id} className="flex space-x-2 items-center">
                    <input
                        type="text"
                        placeholder="Key"
                        value={pair.key}
                        onChange={(e) => update(pair.id, "key", e.target.value)}
                        disabled={disabled}
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                    <input
                        type="text"
                        placeholder="Value"
                        value={pair.value}
                        onChange={(e) => update(pair.id, "value", e.target.value)}
                        disabled={disabled}
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                    {pairs.length > 1 && (
                        <button
                            onClick={() => remove(pair.id)}
                            disabled={disabled}
                            className={`p-2 rounded-md transition-colors ${
                                disabled 
                                    ? "text-gray-400 cursor-not-allowed" 
                                    : "text-red-600 hover:bg-red-50"
                            }`}
                            aria-label="Remove pair"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                                />
                            </svg>
                        </button>
                    )}
                </div>
            ))}
        </>
    );
};

// ===== CONNECTION STATUS =====
const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
    status, 
    reconnectAttempts = 0, 
    maxAttempts = 3 
}) => {
    const colors: Record<typeof status, string> = {
        connected: "bg-green-500",
        connecting: "bg-yellow-500",
        reconnecting: "bg-blue-500",
        error: "bg-red-500",
        disconnected: "bg-gray-500"
    };

    const getText = () => {
        switch (status) {
            case "connected":
                return "Connected to Web Service";
            case "connecting":
                return "Connecting...";
            case "reconnecting":
                return `Reconnecting... (${reconnectAttempts}/${maxAttempts})`;
            case "error":
                return "Connection Error - Click Reconnect";
            default:
                return "Disconnected";
        }
    };

    return (
        <div className={`px-4 py-2 rounded-full text-white text-center font-semibold ${colors[status]}`}>
            {getText()}
        </div>
    );
};

export { ToggleSwitch, ExpandableSection, KeyValuePairs, ConnectionStatus };
export type { ToggleSwitchProps, ExpandableSectionProps, KeyValuePairsProps, ConnectionStatusProps, KeyValuePair };