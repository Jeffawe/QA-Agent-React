import { useState, type JSX } from "react";
import Configuration from "./content/Configuration";
import GettingStarted from "./content/GettingStarted";
import SetupAndUsage from "./content/SetupAndUsage";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import TestingPage from "./content/TestingPage";

const docsStructure = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        component: GettingStarted,
        children: []
    },
    {
        id: 'setup',
        title: 'Setup',
        children: [
            {
                id: 'setup/installation',
                title: 'Installation',
                component: SetupAndUsage
            },
            {
                id: 'setup/configuration',
                title: 'Configuration',
                component: Configuration
            }
        ]
    },
        {
        id: 'testing',
        title: 'Testing',
        component: TestingPage,
        children: []
    }
];

const DocsPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false); // Changed default to false for mobile-first
    const [expandedSections, setExpandedSections] = useState(new Set(['setup', 'usage']));
    const [currentPath, setCurrentPath] = useState('getting-started');

    const toggleSection = (sectionId: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(sectionId)) {
            newExpanded.delete(sectionId);
        } else {
            newExpanded.add(sectionId);
        }
        setExpandedSections(newExpanded);
    };

    const navigateToSection = (path: string) => {
        setCurrentPath(path);
        // Close sidebar on mobile after navigation
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    };

    const findCurrentContent = () => {
        for (const item of docsStructure) {
            if (item.id === currentPath && item.component) {
                return item.component;
            }
            if (item.children) {
                for (const child of item.children) {
                    if (child.id === currentPath && child.component) {
                        return child.component;
                    }
                }
            }
        }
        return GettingStarted; // Default fallback
    };

    interface DocSection {
        id: string;
        title: string;
        component?: React.ComponentType;
        children?: DocSection[];
    }

    const renderSidebarItem = (item: DocSection, level: number = 0): JSX.Element => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedSections.has(item.id);
        const isActive = currentPath === item.id;
        const indent = level * 16;

        return (
            <div key={item.id}>
                <div
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${isActive
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    style={{ paddingLeft: `${12 + indent}px` }}
                    onClick={() => {
                        if (hasChildren) {
                            toggleSection(item.id);
                        } else {
                            navigateToSection(item.id);
                        }
                    }}
                >
                    <span className="font-medium text-sm sm:text-base">{item.title}</span>
                    {hasChildren && (
                        <span className="ml-2">
                            {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                            ) : (
                                <ChevronRight className="w-4 h-4" />
                            )}
                        </span>
                    )}
                </div>

                {hasChildren && isExpanded && (
                    <div className="mt-1">
                        {item.children!.map((child: DocSection) => renderSidebarItem(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    const CurrentContentComponent = findCurrentContent();

    return (
        <div className="min-h-screen bg-gray-50 flex relative">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:relative
                top-0 left-0 h-full
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                ${sidebarOpen ? 'w-80' : 'w-0 lg:w-80'}
                transition-all duration-300 
                bg-white border-r border-gray-200 
                flex flex-col shadow-lg
                z-50 lg:z-auto
                overflow-hidden
            `}>
                <div className="p-4 sm:p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between lg:justify-start">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">QA Agent Docs</h1>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">Complete documentation and guides</p>
                        </div>
                        {/* Close button for mobile */}
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 lg:hidden"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <nav className="space-y-2">
                        {docsStructure.map(item => renderSidebarItem(item))}
                    </nav>
                </div>

                <div className="p-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                        Version 1.0.0-beta
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between shadow-sm">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                        <Menu className="w-5 h-5 text-gray-600" />
                    </button>

                    <div className="flex items-center space-x-4">
                        <span className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                            Last updated: {new Date().toLocaleDateString()}
                        </span>
                        {/* Mobile version - shorter text */}
                        <span className="text-xs text-gray-500 sm:hidden">
                            Updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:max-w-3xl">
                        {CurrentContentComponent && <CurrentContentComponent />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocsPage;