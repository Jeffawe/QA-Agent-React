import React, { useState } from "react";
import type { PageDetails } from "../types";

const MAX_STRING_LENGTH = 100;

interface PageAnalysisDisplayProps {
  logs: string[];
  updates: PageDetails[];
  showLogs?: boolean;
  onToggleLogs?: (show: boolean) => void;
}

interface CollapsibleSectionProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  borderColor: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  count,
  icon,
  bgColor,
  textColor,
  borderColor,
  children,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-3 sm:p-4`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between ${textColor} hover:opacity-80 transition-opacity`}
      >
        <h5 className="font-semibold mb-0 flex items-center text-sm sm:text-base">
          {icon}
          {title} ({count})
        </h5>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
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
        <div className="mt-3">
          {children}
        </div>
      )}
    </div>
  );
};

const PageAnalysisDisplay: React.FC<PageAnalysisDisplayProps> = ({
  logs,
  updates,
  showLogs: externalShowLogs,
  onToggleLogs,
}) => {
  const [internalShowLogs, setInternalShowLogs] = useState(false);

  const showLogs =
    externalShowLogs !== undefined ? externalShowLogs : internalShowLogs;
  const toggleLogs = onToggleLogs || setInternalShowLogs;

  const getSeverityColor = (severity: "high" | "medium" | "low") => {
    switch (severity) {
      case "high":
        return "bg-red-600 text-white";
      case "medium":
        return "bg-yellow-600 text-white";
      case "low":
        return "bg-green-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const getTestTypeColor = (
    testType: "positive" | "negative",
    success: boolean
  ) => {
    if (success) {
      return testType === "positive"
        ? "bg-green-100 text-green-800"
        : "bg-blue-100 text-blue-800";
    } else {
      return "bg-red-100 text-red-800";
    }
  };

  const getTestTypeIcon = (testType: "positive" | "negative") => {
    if (testType === "positive") {
      return (
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      );
    } else {
      return (
        <svg
          className="w-4 h-4 mr-2"
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
      );
    }
  };

  const bugIcon = (
    <svg
      className="w-4 h-4 mr-2"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z"
      />
    </svg>
  );

  const uiIcon = (
    <svg
      className="w-4 h-4 mr-2"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  );

  const notesIcon = (
    <svg
      className="w-4 h-4 mr-2"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );

  const testIcon = (
    <svg
      className="w-4 h-4 mr-2"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Logs Section */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
            Agent Logs
          </h3>
          <button
            onClick={() => toggleLogs(!showLogs)}
            className="text-sm text-blue-600 hover:text-blue-800 underline transition-colors duration-200"
          >
            {showLogs ? "Hide" : "Show"} Logs
          </button>
        </div>
        {showLogs && (
          <div className="bg-gray-900 text-green-400 p-3 sm:p-4 rounded-lg h-48 overflow-y-auto border-2 border-gray-700">
            <div className="text-xs font-mono">
              {logs.length === 0 ? (
                <div className="text-gray-500 italic">
                  No logs yet. Connect to the local agent to see live updates...
                </div>
              ) : (
                logs.map((line, idx) => (
                  <div key={idx} className="mb-1 break-words">
                    <span className="text-gray-500">
                      [{new Date().toLocaleTimeString()}]
                    </span>{" "}
                    {line}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Updates Section */}
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
          Live Page Analysis
        </h3>
        {updates.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-sm sm:text-base">
              No page analysis data yet.
            </p>
          </div>
        ) : (
          updates.map((page, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-2 sm:space-y-0">
                <div className="flex-1">
                  <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                    {page.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-blue-600 underline break-all">
                    {page.url}
                  </p>
                </div>
                <div className="flex-shrink-0 self-start">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Analyzed
                  </span>
                </div>
              </div>

              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                {page.description}
              </p>

              <div className="space-y-4">
                {/* Analysis Section */}
                {page.analysis && (
                  <>
                    {/* Bugs Section */}
                    <CollapsibleSection
                      title="Bugs Found"
                      count={page.analysis.bugs.length}
                      icon={bugIcon}
                      bgColor="bg-red-50"
                      textColor="text-red-900"
                      borderColor="border-red-200"
                      defaultExpanded={page.analysis.bugs.length > 0}
                    >
                      {page.analysis.bugs.length === 0 ? (
                        <p className="text-xs sm:text-sm text-red-700">
                          No bugs detected
                        </p>
                      ) : (
                        <ul className="space-y-2">
                          {page.analysis.bugs.map((bug, i) => (
                            <li key={i} className="text-xs sm:text-sm">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                                <span className="text-red-800 break-words">
                                  {bug.description}
                                </span>
                                <span
                                  className={`inline-block px-2 py-1 rounded text-xs self-start ${getSeverityColor(
                                    bug.severity
                                  )}`}
                                >
                                  {bug.severity}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CollapsibleSection>

                    {/* UI Issues Section */}
                    <CollapsibleSection
                      title="UI Issues"
                      count={page.analysis.ui_issues.length}
                      icon={uiIcon}
                      bgColor="bg-yellow-50"
                      textColor="text-yellow-900"
                      borderColor="border-yellow-200"
                      defaultExpanded={page.analysis.ui_issues.length > 0}
                    >
                      {page.analysis.ui_issues.length === 0 ? (
                        <p className="text-xs sm:text-sm text-yellow-700">
                          No UI issues detected
                        </p>
                      ) : (
                        <ul className="space-y-2">
                          {page.analysis.ui_issues.map((issue, i) => (
                            <li key={i} className="text-xs sm:text-sm">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                                <span className="text-yellow-800 break-words">
                                  {issue.description}
                                </span>
                                <span
                                  className={`inline-block px-2 py-1 rounded text-xs self-start ${getSeverityColor(
                                    issue.severity
                                  )}`}
                                >
                                  {issue.severity}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CollapsibleSection>

                    {/* Notes Section */}
                    {page.analysis.notes && (
                      <CollapsibleSection
                        title="Analysis Notes"
                        count={1}
                        icon={notesIcon}
                        bgColor="bg-blue-50"
                        textColor="text-blue-900"
                        borderColor="border-blue-200"
                        defaultExpanded={true}
                      >
                        <p className="text-xs sm:text-sm text-blue-800 italic break-words">
                          {page.analysis.notes}
                        </p>
                      </CollapsibleSection>
                    )}
                  </>
                )}

                {/* Test Results Section */}
                {page.testResults && page.testResults.length > 0 && (
                  <CollapsibleSection
                    title="Test Results"
                    count={page.testResults.length}
                    icon={testIcon}
                    bgColor="bg-purple-50"
                    textColor="text-purple-900"
                    borderColor="border-purple-200"
                    defaultExpanded={page.testResults.length > 0}
                  >
                    <ul className="space-y-3">
                      {page.testResults.map((test, i) => (
                        <li key={i} className="text-xs sm:text-sm">
                          <div className="bg-white rounded-lg p-3 border border-purple-200">
                            <div className="flex flex-col space-y-2">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                                <div className="flex items-center">
                                  {getTestTypeIcon(test.testType)}
                                  <span className="font-medium text-gray-800">
                                    {test.element.elementType} Test
                                  </span>
                                </div>
                                <span
                                  className={`inline-block px-2 py-1 rounded text-xs self-start ${getTestTypeColor(
                                    test.testType,
                                    test.success
                                  )}`}
                                >
                                  {test.testType} -{" "}
                                  {test.success ? "Success" : "Failed"}
                                </span>
                              </div>

                              <div className="text-gray-700">
                                <span className="font-medium">Test Value:</span>{" "}
                                {test.testValue}
                              </div>

                              {test.ledTo && (
                                <div className="text-gray-700">
                                  <span className="font-medium">Led to:</span>{" "}
                                  {test.ledTo.length > MAX_STRING_LENGTH
                                    ? `${test.ledTo.substring(0, MAX_STRING_LENGTH)}...`
                                    : test.response}
                                </div>
                              )}

                              {test.error && (
                                <div className="text-red-700 bg-red-50 p-2 rounded">
                                  <span className="font-medium">Error:</span>{" "}
                                  {test.error.length > MAX_STRING_LENGTH
                                    ? `${test.error.substring(
                                        0,
                                        MAX_STRING_LENGTH
                                      )}...`
                                    : test.response}
                                </div>
                              )}

                              {test.response && (
                                <div className="text-green-700 bg-green-50 p-2 rounded">
                                  <span className="font-medium">Response:</span>{" "}
                                  {test.response.length > MAX_STRING_LENGTH
                                    ? `${test.response.substring(
                                        0,
                                        MAX_STRING_LENGTH
                                      )}...`
                                    : test.response}
                                </div>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CollapsibleSection>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PageAnalysisDisplay;