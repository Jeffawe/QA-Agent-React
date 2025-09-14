import type { RefObject } from "react";

export interface PageDetails {
    title: string;
    url?: string;
    uniqueID: string;
    screenshot?: string;
    analysis?: Analysis;
    description: string;
    visited: boolean;
    links: LinkInfo[];
    testResults?: UITesterResult[];
}

export interface UITesterResult {
    element: unknown;
    testType: 'positive' | 'negative';
    testValue: unknown;
    success: boolean;
    error?: string;
    response?: string;
}

export interface ElementDetails {
    tagName: string;
    inputType?: string;
    role?: string;
    disabled?: boolean;
    required?: boolean;
    placeholder?: string;
    value?: string;
    options?: string[]; // for select elements
    min?: string;
    max?: string;
    pattern?: string;
    accept?: string; // for file inputs
}

export interface LinkInfo {
    text: string;
    selector: string;
    href: string;
    visited: boolean;
}

export interface TabProps {
    logs: string[];
    connect: (socketLocalPort: string) => void;
    disconnect: () => void;
    setwebsocketPort?: React.Dispatch<React.SetStateAction<string>>;
    port?: string;
    updates: PageDetails[];
    connected: boolean;
    connectedLoading?: boolean;
    stopServerloading?: boolean;
    socketRef?: RefObject<WebSocket | null>;
}


export interface Bug {
    description: string;
    selector: string;
    severity: 'high' | 'medium' | 'low';
}

export interface UIIssue {
    description: string;
    selector: string;
    severity: 'high' | 'medium' | 'low';
}

export interface Analysis {
    bugs: Bug[];
    ui_issues: UIIssue[];
    notes: string;
}

export interface WebSocketData {
    message?: string;
    timestamp: number;
    page?: PageDetails;
}

export interface ConnectionData {
    status: string;
    message: string;
}

export interface FirstConnectionData {
    pages: PageDetails[];
    messages: string[];
    timestamp: number;
}

// Enhanced message structure with sessionId
export interface RedisMessage {
    type: string;
    sessionId: string;
    data: WebSocketData | ConnectionData | FirstConnectionData;
    timestamp: string;
}