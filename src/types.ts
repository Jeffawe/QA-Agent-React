export interface PageDetails {
    title: string;
    url?: string;
    uniqueID: string;
    screenshot?: string;
    analysis?: Analysis;
    description: string;
    visited: boolean;
    links: LinkInfo[];
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
  websocketport?: string;
  updates: PageDetails[];
  connected: boolean;
  connectedLoading?: boolean;
  stopServerloading?: boolean;
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