import { useCallback, useEffect, useRef, useState } from "react";
import WebTab from "./updates/WebTab";
import type { PageDetails, Statistics } from "../types";
import DoneModal from "./updates/DoneModal";
import { useNavigate } from "react-router-dom";

interface WebSocketData { message?: string; timestamp: number; page?: PageDetails; }

interface InitialData {
  pages: PageDetails[];
  messages: string[];
  timestamp: number;
}

const BASE_URL = import.meta.env.VITE_API_URL;

// Main Updates Page Component with Tabs
const UpdatesPage: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [updates, setUpdates] = useState<PageDetails[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [donePageModalOpen, setDonePageModalOpen] = useState(false);
  const [donePageStats, setDonePageStats] = useState<Statistics | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const navigate = useNavigate();

  //Loading
  const [stopServerloading, setStopServerLoading] = useState(false);
  const [connectedLoading, setConnectedLoading] = useState(false);


  useEffect(() => {
    fetch(`${BASE_URL}/health`)
      .then(() => console.log('Backend is waking up...'))
      .catch(err => console.error('Wake-up ping failed:', err));
  }, []);

  // Handle URL hash changes for tab routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1); // remove leading "#"
      const params = new URLSearchParams(hash);

      const port = params.get('port');

      if (port) {
        const baseUrl = `http://localhost:${port}`;
        const url = new URL(baseUrl);
        const wsProtocol = url.protocol === "https:" ? "wss:" : "ws:";
        const cleanBaseUrlWithPort = `${wsProtocol}//${url.hostname}:${url.port}/websocket?sessionId=1`;
        connect(cleanBaseUrlWithPort);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gotoFeedbackPage = () => {
    navigate('/docs/feedback');
  }

  const connect = useCallback((socketLocalPort: string) => {
    try {
      console.log('Connecting to WebSocket...');
      setConnectedLoading(true);
      setLogs([]);
      setUpdates([]);
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
        console.log('WebSocket connection closed.');
        setConnected(false);
        setConnectedLoading(false); 
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          switch (message.type) {
            case 'CONNECTION_ACK':
              console.log(`🔗 Connection confirmed: ${message.data.message}`);
              break;
            case 'ISSUE':
              alert(`❗Issue detected: ${message.data.message}`);
              break;
            case 'STOP_WARNING':
              alert(`⚠️ ${message.data.message}`);
              break;
            case 'DONE':
              console.log('Agent is Done! Leave a feedback of how he did!');
              console.log(message);
              setDonePageStats(message.data.statistics);
              if(!message.data.statistics) {
                alert('Agent is done but no statistics were provided.');
                break;
              }
              setDonePageModalOpen(true);
              disconnect(false);
              break;
            case 'INITIAL_DATA':
              handleNewCrawlMapUpdate(message.data);
              handleMultipleNewLogs(message.data);
              break;
            case 'DISCONNECTION':
              console.log('Agent Disconnected.');
              disconnect();
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

  const disconnect = (showError: boolean = true) => {
    try {
      setStopServerLoading(true);
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setConnected(false);
    } catch (error) {
      if(showError) alert('Problem when stopping the Server. Please check if the port (for server and websocket) are valid.');
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

        {/* Content */}
        <WebTab
          connected={connected}
          connectedLoading={connectedLoading}
          stopServerloading={stopServerloading}
          logs={logs}
          updates={updates}
          connect={connect}
          disconnect={disconnect}
        />

        {donePageModalOpen && donePageStats !== null && donePageStats != undefined && (
          <DoneModal
            stats={donePageStats}
            onClose={() => setDonePageModalOpen(false)}
            onFeedbackClick={() => gotoFeedbackPage()}
          />
        )}
      </div>
    </div>
  );
};

export default UpdatesPage;