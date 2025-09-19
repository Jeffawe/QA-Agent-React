import { useMemo, useState } from "react";

interface ConfigState {
    data: Record<string, unknown>;
}

type KVRow = { id: string; k: string; v: string; };

const uid = () => Math.random().toString(36).slice(2, 9);

// attempt to coerce strings to number/boolean/null/json; otherwise return original string
const coerceValue = (raw: string): unknown => {
    const s = raw.trim();
    if (s === "true" || s === "false" || s === "null") {
        return JSON.parse(s);
    }
    // number?
    if (!Number.isNaN(Number(s)) && s !== "") {
        // avoid converting things like "01a"
        const asNum = Number(s);
        if (String(asNum) === s || String(asNum) === s.replace(/^0+/, "") || /^0$/.test(s)) {
            return asNum;
        }
    }
    // try JSON object/array
    if ((s.startsWith("{") && s.endsWith("}")) || (s.startsWith("[") && s.endsWith("]"))) {
        try {
            return JSON.parse(s);
        } catch {
            return raw;
        }
    }
    return raw;
};

const WebConfig = () => {
    // Initialize state from configuration fields + data: {}
    const [config, setConfig] = useState<ConfigState>(() => {
        const initialConfig: ConfigState = { data: {} }; // <— NEW default container
        return initialConfig;
    });

    // Editable rows for data{}
    const initialPairs: KVRow[] = useMemo(() => {
        const d = (config.data ?? {}) as Record<string, unknown>;
        return Object.entries(d).map(([k, v]) => ({
            id: uid(),
            k,
            v: typeof v === "string" ? v : JSON.stringify(v),
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // only on mount

    const [pairs, setPairs] = useState<KVRow[]>(initialPairs);
    const [dataError, setDataError] = useState<string | null>(null);

    const syncPairsToConfig = (rows: KVRow[]) => {
        // build object from rows; last occurrence of a duplicate key wins
        const obj: Record<string, unknown> = {};
        const seen = new Set<string>();
        let dup = false;
        for (const r of rows) {
            const key = r.k.trim();
            if (!key) continue;
            if (seen.has(key)) dup = true;
            seen.add(key);
            obj[key] = coerceValue(r.v);
        }
        setConfig((prev) => ({ ...prev, data: obj }));
        setDataError(dup ? "Duplicate keys detected. The last occurrence will be used." : null);
    };

    const addPair = () => {
        const next = [...pairs, { id: uid(), k: "", v: "" }];
        setPairs(next);
        syncPairsToConfig(next);
    };

    const updatePair = (id: string, keyOrValue: "k" | "v", val: string) => {
        const next = pairs.map((r) => (r.id === id ? { ...r, [keyOrValue]: val } : r));
        setPairs(next);
        syncPairsToConfig(next);
    };

    const removePair = (id: string) => {
        const next = pairs.filter((r) => r.id !== id);
        setPairs(next);
        syncPairsToConfig(next);
    };

    const generateConfigFile = () => {
        return JSON.stringify(config, null, 4);
    };

    const useConfigFile = () => {
        localStorage.setItem("qa-agent-config", generateConfigFile());

        window.location.href = "/updates";
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="space-y-8 sm:space-y-12">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-4xl font-bold mb-4 text-gray-800">Web Setup</h1>
                <p className="text-base sm:text-lg text-gray-600">
                    Customize QA Agent settings and parameters
                </p>
            </div>

            {/* Live Updates Section */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">Live Updates</h2>
                <p className="text-gray-600 mb-3 text-sm sm:text-base">
                    You can use the QA-Agent Web version at <span className="text-blue-600 hover:underline cursor-pointer" onClick={() => window.location.href = "/updates"}>Updates</span> page.
                </p>
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
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Data Items</h2>
                        <p className="text-gray-600 leading-relaxed mb-4 text-sm sm:text-base">
                            Add key-value pairs containing data the QA Agent will need during testing. This can include usernames, passwords, or any other fillable elements required by your test scenarios.
                        </p>
                    </div>
                </div>
            </div>


            {/* NEW: Custom Data (Key → Value) */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Custom Data (Key → Value)</h2>
                    <button
                        onClick={addPair}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors duration-200"
                    >
                        + Add Pair
                    </button>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                    Add arbitrary key/value pairs that will be available to the QA Agent at <code className="bg-gray-100 px-1 rounded">config.data</code>.
                    Example: <code className="bg-gray-100 px-1 rounded">username</code> → <code className="bg-gray-100 px-1 rounded">john</code>
                </p>

                {dataError && (
                    <div className="mb-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded p-2">
                        {dataError}
                    </div>
                )}

                <div className="space-y-3">
                    {pairs.length === 0 && (
                        <div className="text-sm text-gray-500">No custom data yet. Click “Add Pair”.</div>
                    )}

                    {pairs.map((row) => (
                        <div key={row.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 items-center">
                            <input
                                type="text"
                                value={row.k}
                                onChange={(e) => updatePair(row.id, "k", e.target.value)}
                                placeholder="key (e.g., username)"
                                className="sm:col-span-5 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                            <input
                                type="text"
                                value={row.v}
                                onChange={(e) => updatePair(row.id, "v", e.target.value)}
                                placeholder='value (e.g., john or {"roles":["qa"]})'
                                className="sm:col-span-6 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                            <button
                                onClick={() => removePair(row.id)}
                                className="sm:col-span-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm"
                                title="Remove"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-3 text-xs text-gray-500">
                    Notes: Values are auto-parsed when possible (numbers, <code>true</code>/<code>false</code>/<code>null</code>, JSON objects/arrays). Otherwise, they’re saved as strings.
                </div>
            </div>

            {/* Generated Configuration */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Generated Configuration</h2>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                    Preview and use your configuration file.
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
                        onClick={useConfigFile}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors duration-200 text-sm sm:text-base"
                    >
                        Use Config File
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WebConfig;
