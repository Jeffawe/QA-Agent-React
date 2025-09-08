import { useCallback, useEffect, useRef, useState } from "react";
import BetaWarning from "./BetaWarning";
import LocalTab from "./updates/LocalTab";
import WebTab from "./updates/WebTab";
import type { PageDetails } from "../types";

interface WebSocketData { message?: string; timestamp: number; page?: PageDetails; }

interface InitialData {
  pages: PageDetails[];
  messages: string[];
  timestamp: number;
}

const BASE_URL = import.meta.env.VITE_API_URL;

const message = `QA Agent is currently in beta. Please note:

- Some features may not work as expected
- I am going to add more features like pausing and resuming the agent
- The goal field is not yet configurable
- Analysis results may vary in accuracy (I'm still working heavily on better analysis per page)
- I appreciate your feedback as I improve the tool`;

// Main Updates Page Component with Tabs
const UpdatesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('web');
  const [port, setPort] = useState('3001');
  const [connected, setConnected] = useState(false);
  const [updates, setUpdates] = useState<PageDetails[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const socketRef = useRef<WebSocket | null>(null);

  //Loading
  const [stopServerloading, setStopServerLoading] = useState(false);
  const [connectedLoading, setConnectedLoading] = useState(false);

  // Handle URL hash changes for tab routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#tab=web') {
        setActiveTab('web');
      } else if (hash === '#tab=local') {
        setActiveTab('local');
      }
    };

    handleHashChange(); // Check initial hash
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    fetch(`${BASE_URL}/health`)
      .then(() => console.log('Backend is waking up...'))
      .catch(err => console.error('Wake-up ping failed:', err));
  }, []);

  const switchTab = (tab: string) => {
    setActiveTab(tab);
    window.location.hash = `#tab=${tab}`;
  };

  const connect = useCallback((socketLocalPort: string) => {
    try {
      console.log('Connecting to WebSocket...');
      setConnectedLoading(true);
      const ws = new WebSocket(socketLocalPort);

      ws.onopen = () => {
        setConnected(true);
        console.log('WebSocket connection opened.');
        setConnectedLoading(false);
      };

      ws.onerror = (error) => {
        setConnected(false);
        setConnectedLoading(false);
        alert('WebSocket connection error. Please check if the port is valid.');
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        setConnected(false);
        setConnectedLoading(false);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          console.log('Received WebSocket message:', message);

          switch (message.type) {
            case 'CONNECTION':
              alert(`🔗 Connection confirmed: ${message.data.message}`);
              break;
            case 'ISSUE':
              alert(`❗Issue detected: ${message.data.message}`);
              break;
            case 'STOP_WARNING':
              alert(`⚠️ ${message.data.message}`);
              break;
            case 'DONE':
              alert('Agent is Done! Leave a feedback of how he did!');
              break;
            case 'INITIAL_DATA':
              handleNewCrawlMapUpdate(message.data);
              handleMultipleNewLogs(message.data);
              break;
            case 'LOG':
              handleNewLog(message.data);
              break;
            case 'CRAWL_MAP_UPDATE':
              handleCrawlMapUpdate(message.data);
              break;
            default:
              console.log('Unknown event type:', message.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socketRef.current = ws;
    } catch (error) {
      setConnected(false);
      setConnectedLoading(false);
      alert('WebSocket connection error. Please check if the port is valid.');
      console.error('WebSocket connection error:', error);
    }
  }, []);

  const disconnect = () => {
    try {
      setStopServerLoading(true);
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setConnected(false);
      setLogs([]);
      setUpdates([]);
    } catch (error) {
      alert('Problem when stopping the Server. Please check if the port (for server and websocket) are valid.');
      console.error('Error Stopping:', error);
    } finally {
      setStopServerLoading(false);
    }
  };

  const handleNewLog = (data: WebSocketData) => {
    if (!data.message) return;
    setLogs(prev => [...prev.slice(-49), data.message!]);
  };

  const handleMultipleNewLogs = (data: InitialData) => {
    if (!data.messages) return;
    setLogs(data.messages);
  };

  const handleNewCrawlMapUpdate = (data: InitialData) => {
    if (!data.pages) return;
    setUpdates(data.pages);
  };

  const handleCrawlMapUpdate = (data: WebSocketData) => {
    if (!data.page) return;

    setUpdates(prev => {
      const existingIndex = prev.findIndex(update => update.url === data.page?.url);

      if (existingIndex !== -1) {
        const newUpdates = [...prev];
        newUpdates[existingIndex] = {
          ...newUpdates[existingIndex],
          ...data.page!
        };
        return newUpdates;
      } else {
        return [...prev.slice(-19), data.page!];
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <BetaWarning message={message} />

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-6 border border-gray-200 overflow-hidden">
          <div className="flex">
            <button
              onClick={() => switchTab('web')}
              className={`flex-1 px-4 sm:px-6 py-4 font-medium transition-all duration-200 relative ${activeTab === 'web'
                ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-500'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
                <span className="text-sm sm:text-base">Web Analysis</span>
              </div>
            </button>
            <button
              onClick={() => switchTab('local')}
              className={`flex-1 px-4 sm:px-6 py-4 font-medium transition-all duration-200 relative ${activeTab === 'local'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm sm:text-base">Local Agent</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {activeTab === 'local'
            ? <LocalTab
              logs={logs}
              connect={connect}
              disconnect={disconnect}
              setwebsocketPort={setPort}
              port={port}
              updates={updates}
              connected={connected}
              connectedLoading={connectedLoading}
              stopServerloading={stopServerloading}
            />
            : <WebTab logs={logs} connect={connect} disconnect={disconnect}
              updates={updates} connected={connected} />
          }
        </div>
      </div>
    </div>
  );
};

export default UpdatesPage;