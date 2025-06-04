import React, { useState, useEffect, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion } from "framer-motion";
import { Database, Activity, Wifi, WifiOff, RefreshCw } from "lucide-react";

// Components
import ApiTestForm from "./components/ApiTestForm";
import ContactNode from "./components/ContactNode";
import LogPanel from "./components/LogPanel";

// Services
import ApiService from "./services/api";
import websocketService from "./services/websocket";

// Types
import {
  Contact,
  LogEntry,
  ApiTestResult,
  ContactNode as ContactNodeType,
  ContactEdge,
} from "./types";

// Custom node types
const nodeTypes = {
  contact: ContactNode,
};

function App() {
  // State
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [lastApiResult, setLastApiResult] = useState<ApiTestResult | null>(
    null
  );

  // Create log entry
  const addLog = useCallback(
    (
      level: LogEntry["level"],
      message: string,
      data?: any,
      source: LogEntry["source"] = "system"
    ) => {
      const newLog: LogEntry = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        level,
        message,
        data,
        source,
      };

      setLogs((prev) => [...prev.slice(-99), newLog]); // Keep last 100 logs
    },
    []
  );

  // Load real contact data from backend
  const loadRealContacts = useCallback(async () => {
    try {
      addLog("info", "Loading contacts from backend...", null, "system");
      const contactsData = await ApiService.getAllContacts();

      setContacts(contactsData);
      addLog(
        "info",
        "Loaded real contact data from backend",
        { count: contactsData.length },
        "database"
      );
    } catch (error) {
      addLog(
        "error",
        "Failed to load contacts from backend",
        { error: error instanceof Error ? error.message : String(error) },
        "database"
      );

      // Fallback to empty state
      setContacts([]);
    }
  }, [addLog]);

  // Convert contacts to nodes and edges
  const updateVisualization = useCallback(() => {
    const primaryContacts = contacts.filter(
      (c) => c.linkPrecedence === "primary"
    );
    const secondaryContacts = contacts.filter(
      (c) => c.linkPrecedence === "secondary"
    );

    const newNodes: ContactNodeType[] = [];
    const newEdges: ContactEdge[] = [];

    let xOffset = 100;
    let yOffset = 100;

    // Create consolidated nodes for primary contacts (matching PRD requirements)
    primaryContacts.forEach((primary, index) => {
      const relatedSecondary = secondaryContacts.filter(
        (s) => s.linkedId === primary.id
      );

      // Build consolidated emails array with primary contact's email first
      const allEmails = [
        primary.email,
        ...relatedSecondary.map((s) => s.email),
      ].filter(Boolean) as string[];

      // Remove duplicates while preserving primary contact's data as first element
      const consolidatedEmails = allEmails.reduce((acc, email) => {
        if (!acc.includes(email)) {
          acc.push(email);
        }
        return acc;
      }, [] as string[]);

      // Build consolidated phone numbers array with primary contact's number first
      const allPhoneNumbers = [
        primary.phoneNumber,
        ...relatedSecondary.map((s) => s.phoneNumber),
      ].filter(Boolean) as string[];

      // Remove duplicates while preserving primary contact's data as first element
      const consolidatedPhoneNumbers = allPhoneNumbers.reduce((acc, phone) => {
        if (!acc.includes(phone)) {
          acc.push(phone);
        }
        return acc;
      }, [] as string[]);

      newNodes.push({
        id: primary.id,
        type: "contact",
        position: { x: xOffset, y: yOffset },
        data: {
          contact: primary,
          isPrimary: true,
          emails: consolidatedEmails,
          phoneNumbers: consolidatedPhoneNumbers,
          secondaryCount: relatedSecondary.length,
        },
      });

      // Create individual nodes for secondary contacts (for visualization purposes)
      relatedSecondary.forEach((secondary, secIndex) => {
        const secXOffset = xOffset + 400;
        const secYOffset = yOffset + secIndex * 200;

        newNodes.push({
          id: secondary.id,
          type: "contact",
          position: { x: secXOffset, y: secYOffset },
          data: {
            contact: secondary,
            isPrimary: false,
            emails: secondary.email ? [secondary.email] : [],
            phoneNumbers: secondary.phoneNumber ? [secondary.phoneNumber] : [],
            secondaryCount: 0,
          },
        });

        // Create edge from primary to secondary
        newEdges.push({
          id: `${primary.id}-${secondary.id}`,
          source: primary.id,
          target: secondary.id,
          type: "smoothstep",
          animated: true,
          label: "linked to",
        });
      });

      yOffset += Math.max(300, relatedSecondary.length * 200 + 100);
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [contacts, setNodes, setEdges]);

  // Handle API test results
  const handleApiResult = useCallback(
    (result: ApiTestResult) => {
      setLastApiResult(result);

      if (result.success) {
        addLog("info", "Identity API call successful", result.data, "api");

        // Refresh contacts from the server after successful API call
        setTimeout(() => {
          loadRealContacts();
          addLog("info", "Refreshed contacts after API call", null, "database");
        }, 500);
      } else {
        addLog(
          "error",
          "Identity API call failed",
          { error: result.error },
          "api"
        );
      }
    },
    [addLog, loadRealContacts]
  );

  // Clear logs
  const clearLogs = useCallback(() => {
    setLogs([]);
    addLog("info", "Logs cleared", null, "system");
  }, [addLog]);

  // WebSocket event listeners
  useEffect(() => {
    const handleWebSocketConnected = () => {
      setIsWebSocketConnected(true);
      addLog("info", "WebSocket connected", null, "system");
    };

    const handleWebSocketDisconnected = () => {
      setIsWebSocketConnected(false);
      addLog("warn", "WebSocket disconnected", null, "system");
    };

    const handleNewLogEntry = (event: CustomEvent) => {
      setLogs((prev) => [...prev.slice(-99), event.detail]);
    };

    const handleDatabaseUpdate = (event: CustomEvent) => {
      addLog("info", "Database updated", event.detail, "database");
    };

    const handleContactChange = (event: CustomEvent) => {
      addLog("info", "Contact change detected", event.detail, "database");
    };

    // Add event listeners
    window.addEventListener("websocket-connected", handleWebSocketConnected);
    window.addEventListener(
      "websocket-disconnected",
      handleWebSocketDisconnected
    );
    window.addEventListener(
      "new-log-entry",
      handleNewLogEntry as EventListener
    );
    window.addEventListener(
      "database-update",
      handleDatabaseUpdate as EventListener
    );
    window.addEventListener(
      "contact-change",
      handleContactChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "websocket-connected",
        handleWebSocketConnected
      );
      window.removeEventListener(
        "websocket-disconnected",
        handleWebSocketDisconnected
      );
      window.removeEventListener(
        "new-log-entry",
        handleNewLogEntry as EventListener
      );
      window.removeEventListener(
        "database-update",
        handleDatabaseUpdate as EventListener
      );
      window.removeEventListener(
        "contact-change",
        handleContactChange as EventListener
      );
    };
  }, [addLog]);

  // Initialize app
  useEffect(() => {
    addLog(
      "info",
      "BiteSpeed Identity Reconciliation Dashboard started",
      null,
      "system"
    );

    // Initialize WebSocket connection after a short delay to ensure backend is ready
    setTimeout(() => {
      websocketService.initialize();
    }, 1000);

    loadRealContacts();
  }, [addLog, loadRealContacts]);

  // Update visualization when contacts change
  useEffect(() => {
    updateVisualization();
  }, [contacts, updateVisualization]);

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-800 border-b border-dark-700 px-6 py-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Database className="w-8 h-8 text-bitespeed-500" />
              <div>
                <h1 className="text-xl font-bold text-white">
                  BiteSpeed Identity Reconciliation
                </h1>
                <p className="text-sm text-dark-400">
                  Real-time Contact Management Dashboard
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isWebSocketConnected ? (
                <Wifi className="w-5 h-5 text-green-400" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-400" />
              )}
              <span className="text-sm text-dark-300">
                {isWebSocketConnected ? "Connected" : "Disconnected"}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-bitespeed-400" />
              <span className="text-sm text-dark-300">
                {contacts.length} Contacts
              </span>
            </div>

            <button
              onClick={loadRealContacts}
              className="flex items-center space-x-2 px-3 py-1.5 bg-bitespeed-600 hover:bg-bitespeed-700 text-white rounded-lg transition-colors duration-200"
              title="Refresh contacts from backend"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm">Refresh</span>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - API Test */}
        <div className="w-96 p-6 border-r border-dark-700 overflow-y-auto">
          <ApiTestForm onResult={handleApiResult} />
        </div>

        {/* Center Panel - Visualization */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
            className="bg-dark-900"
          >
            <Background color="#334155" gap={20} size={1} />
            <Controls className="bg-dark-800 border border-dark-600" />
            <MiniMap
              className="bg-dark-800 border border-dark-600"
              nodeColor="#3b82f6"
              maskColor="#1e293b"
            />
          </ReactFlow>

          {/* Overlay info */}
          <div className="absolute top-4 left-4 bg-dark-800 bg-opacity-90 backdrop-blur-sm rounded-lg border border-dark-600 p-4">
            <h3 className="font-semibold text-white mb-2">
              Contact Relationships
            </h3>
            <div className="space-y-1 text-sm text-dark-300">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-bitespeed-500 rounded"></div>
                <span>Primary Contact</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-dark-500 rounded"></div>
                <span>Secondary Contact</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-0.5 bg-dark-500"></div>
                <span>Linked Relationship</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Logs */}
        <div className="w-96 p-6 border-l border-dark-700">
          <LogPanel logs={logs} onClearLogs={clearLogs} />
        </div>
      </div>
    </div>
  );
}

export default App;
