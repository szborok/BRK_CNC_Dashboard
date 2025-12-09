import { useState, useEffect } from "react";
import jsonScannerAPI from "../services/api/jsonScanner";
import toolManagerAPI from "../services/api/toolManager";
import platesManagerAPI from "../services/api/platesManager";

export default function BackendStatus() {
  const [apiStatus, setApiStatus] = useState<{
    jsonScanner: boolean;
    toolManager: boolean;
    platesManager: boolean;
  }>({
    jsonScanner: false,
    toolManager: false,
    platesManager: false,
  });

  useEffect(() => {
    checkAPIStatus();
    
    // Check API status every 10 seconds
    const interval = setInterval(() => {
      checkAPIStatus();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const checkAPIStatus = async () => {
    const status = {
      jsonScanner: false,
      toolManager: false,
      platesManager: false,
    };

    try {
      await jsonScannerAPI.getStatus();
      status.jsonScanner = true;
    } catch {
      void 0;
    }

    try {
      await toolManagerAPI.getStatus();
      status.toolManager = true;
    } catch {
      void 0;
    }

    try {
      await platesManagerAPI.getPlates();
      status.platesManager = true;
    } catch {
      void 0;
    }

    setApiStatus(status);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-600 dark:text-gray-400">Backend Status:</span>
      <div className="flex items-center gap-1.5">
        <span
          className={`h-2 w-2 rounded-full ${
            apiStatus.jsonScanner ? "bg-green-500" : "bg-red-500"
          }`}
          title="JSONScanner"
        />
        <span
          className={`h-2 w-2 rounded-full ${
            apiStatus.toolManager ? "bg-green-500" : "bg-red-500"
          }`}
          title="ToolManager"
        />
        <span
          className={`h-2 w-2 rounded-full ${
            apiStatus.platesManager ? "bg-green-500" : "bg-red-500"
          }`}
          title="PlatesManager"
        />
      </div>
    </div>
  );
}
