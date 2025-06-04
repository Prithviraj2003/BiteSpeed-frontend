import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Trash2, Filter, ChevronDown } from "lucide-react";
import { LogEntry } from "../types";

interface LogPanelProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

const LogPanel: React.FC<LogPanelProps> = ({ logs, onClearLogs }) => {
  const [filter, setFilter] = useState<
    "all" | "info" | "warn" | "error" | "debug"
  >("all");
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const filteredLogs = logs.filter(
    (log) => filter === "all" || log.level === filter
  );

  useEffect(() => {
    if (isAutoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [filteredLogs, isAutoScroll]);

  const handleScroll = () => {
    if (logContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setIsAutoScroll(isAtBottom);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "info":
        return "text-blue-400";
      case "warn":
        return "text-yellow-400";
      case "error":
        return "text-red-400";
      case "debug":
        return "text-gray-400";
      default:
        return "text-white";
    }
  };

  const getLevelBg = (level: string) => {
    switch (level) {
      case "info":
        return "bg-blue-900";
      case "warn":
        return "bg-yellow-900";
      case "error":
        return "bg-red-900";
      case "debug":
        return "bg-gray-900";
      default:
        return "bg-dark-800";
    }
  };

  const getLevelBorder = (level: string) => {
    switch (level) {
      case "info":
        return "border-l-blue-500";
      case "warn":
        return "border-l-yellow-500";
      case "error":
        return "border-l-red-500";
      case "debug":
        return "border-l-gray-500";
      default:
        return "border-l-dark-500";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 rounded-lg border border-dark-600 flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 items-center justify-between p-4 border-b border-dark-700">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-bitespeed-400" />
          <h2 className="text-lg font-semibold text-white">Real-time Logs</h2>
        </div>

        <div className="flex items-center space-x-2">
          {/* Filter Dropdown */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-1 text-sm bg-dark-700 border border-dark-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-bitespeed-500"
          >
            <option value="all">All Levels</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Error</option>
            <option value="debug">Debug</option>
          </select>

          {/* Auto-scroll toggle */}
          <button
            onClick={() => setIsAutoScroll(!isAutoScroll)}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              isAutoScroll
                ? "bg-bitespeed-600 text-white"
                : "bg-dark-700 text-dark-300 hover:bg-dark-600"
            }`}
          >
            Auto-scroll
          </button>

          {/* Clear logs */}
          <button
            onClick={onClearLogs}
            className="p-2 text-dark-400 hover:text-red-400 hover:bg-dark-700 rounded transition-colors"
            title="Clear logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Log entries */}
      <div
        ref={logContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-sm"
        style={{ minHeight: "300px", maxHeight: "500px" }}
      >
        <AnimatePresence initial={false}>
          {filteredLogs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className={`p-2 rounded border-l-4 ${getLevelBg(
                log.level
              )} ${getLevelBorder(log.level)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs text-dark-400">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded uppercase font-semibold ${getLevelColor(
                        log.level
                      )} bg-opacity-20`}
                    >
                      {log.level}
                    </span>
                    <span className="text-xs text-dark-500">
                      [{log.source}]
                    </span>
                  </div>
                  <div className="text-white break-words">{log.message}</div>
                  {log.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-bitespeed-400 hover:text-bitespeed-300">
                        Show data
                      </summary>
                      <pre className="mt-1 text-xs text-dark-300 bg-dark-900 p-2 rounded overflow-x-auto">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredLogs.length === 0 && (
          <div className="flex items-center justify-center h-full text-dark-500">
            <div className="text-center">
              <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No logs to display</p>
              <p className="text-sm mt-1">
                {filter !== "all"
                  ? `No ${filter} level logs found`
                  : "Logs will appear here in real-time"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Status indicator */}
      <div className="flex items-center justify-between px-4 py-2 bg-dark-900 border-t border-dark-700">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-dark-400">Real-time updates</span>
        </div>
        {!isAutoScroll && (
          <button
            onClick={() => {
              setIsAutoScroll(true);
              if (logContainerRef.current) {
                logContainerRef.current.scrollTop =
                  logContainerRef.current.scrollHeight;
              }
            }}
            className="text-xs text-bitespeed-400 hover:text-bitespeed-300 flex items-center space-x-1"
          >
            <ChevronDown className="w-3 h-3" />
            <span>Scroll to bottom</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default LogPanel;
