import React, { useState } from "react";

const initialConfig = {
    goal: "Crawl the entire site",
    key: "xxxxxxxxx",
    url: "https://example-store.com",
    port: 3001,
    "test-mode": false,
    "auto-start": true,
    headless: true,
    detailed: true,
    autoconnect: false,
    endpoint: true,
    data: {
        "header:x-api-key": "xxxxxxxxx",
        "endpoint:/ads/1345/create": {
            "query": {
                "choice": true,
            },
            "headers": {
                "x-api-key": "xxxxxxxxx",
            },
            "body": {
                name: "Fall Clearance Sale",
                main_goal: "sales",
                start_date: "2025-10-01",
                end_date: "2025-10-15",
                expected_sales: 500,
                expected_aov: 75,
                daily_campaign_budget: 200,
                location: ["United States", "Canada"],
                creative_notes:
                    "Highlight urgency",
                landing_page_link: "https://example-store.com/fall-clearance",
                client_name: "Autumn Apparel Co.",
                image: "https://example-store.com/images/fall-campaign-banner.jpg",
                total_ad_budget: 3000,
                audience: [
                    "Eco-conscious millennials",
                    "College students",
                    "Young professionals interested in fashion",
                ],
                youtube_links: "https://youtube.com/watch?v=fallcollectionpromo",
            }
        },
    },
};

const Examples: React.FC = () => {
    const [config, setConfig] = useState(initialConfig);

    const handleConfigChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        try {
            const newConfig = JSON.parse(e.target.value);
            setConfig(newConfig);
        } catch {
            // Ignore parsing error until valid JSON
        }
    };

    const handleDownload = () => {
        const blob = new Blob([JSON.stringify(config, null, 2)], {
            type: "application/json",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "qa-agent-config.json";
        link.click();
    };

    return (
        <div className="space-y-12">
            <h1 className="text-4xl font-bold mb-4 text-gray-800">Examples</h1>
            <p className="text-lg text-gray-600">Example configuration files</p>

            {/* Config JSON Editor */}
            <div className="bg-white p-6 rounded-lg shadow border">
                <h2 className="text-xl font-semibold mb-4">Config File Example</h2>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                    Modify the configuration below and click "Download JSON" to save the file.
                </p>
                
                <textarea
                    className="w-full h-96 font-mono text-sm border rounded p-3 bg-gray-50"
                    value={JSON.stringify(config, null, 2)}
                    onChange={handleConfigChange}
                />
                <button
                    onClick={handleDownload}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Download JSON
                </button>
            </div>
        </div>
    );
};

export default Examples;
