import type { RefObject } from "react";

export interface PageDetails {
    title: string;
    url?: string;
    uniqueID: string;
    screenshot?: string;
    analysis?: Analysis;
    endpointResults?: EndPointTestResult[];
    description: string;
    visited: boolean;
    links: LinkInfo[];
    testResults?: UITesterResult[];
}

export interface EndPointTestResult {
    endpoint: string;           // "POST /users/{id}"
    success: boolean;
    error?: string;            // Error message if failed
    response?: {               // Response if successful
        status: number;          // HTTP status code
        statusText: string;      // HTTP status text
        headers: Record<string, string>;
        data: string | object | null              // Parsed response body (JSON or text)
        responseTime: number;   // Time taken in milliseconds
    };
}

export interface UITesterResult {
    element: UIElementInfo;
    ledTo?: string;
    testType: 'positive' | 'negative';
    testValue: string;
    success: boolean;
    error?: string;
    response?: string;
}

export interface UIElementInfo extends StageHandObserveResult {
    elementType: UIElementType;
    elementDetails: ElementDetails;
    testable: boolean;
    extractedAttributes?: Record<string, string | null>;
}

export type UIElementType =
    | 'button'
    | 'text_input'
    | 'email_input'
    | 'password_input'
    | 'number_input'
    | 'date_input'
    | 'file_input'
    | 'textarea'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'range'
    | 'color'
    | 'search'
    | 'tel'
    | 'url_input'
    | 'time'
    | 'datetime_local'
    | 'week'
    | 'month'
    | 'form'
    | 'link'
    | 'image'
    | 'video'
    | 'audio'
    | 'canvas'
    | 'iframe'
    | 'unknown';

export const UIElementTypeValues = {
    BUTTON: 'button',
    TEXT_INPUT: 'text_input',
    EMAIL_INPUT: 'email_input',
    PASSWORD_INPUT: 'password_input',
    NUMBER_INPUT: 'number_input',
    DATE_INPUT: 'date_input',
    FILE_INPUT: 'file_input',
    TEXTAREA: 'textarea',
    SELECT: 'select',
    CHECKBOX: 'checkbox',
    RADIO: 'radio',
    RANGE: 'range',
    COLOR: 'color',
    SEARCH: 'search',
    TEL: 'tel',
    URL_INPUT: 'url_input',
    TIME: 'time',
    DATETIME_LOCAL: 'datetime_local',
    WEEK: 'week',
    MONTH: 'month',
    FORM: 'form',
    LINK: 'link',
    IMAGE: 'image',
    VIDEO: 'video',
    AUDIO: 'audio',
    CANVAS: 'canvas',
    IFRAME: 'iframe',
    UNKNOWN: 'unknown'
} as const;

export interface StageHandObserveResult {
    description: string;
    method?: string;
    arguments?: string[];
    selector: string;
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