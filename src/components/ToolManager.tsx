import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Wrench,
  Activity,
  AlertCircle,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { BackendDataLoader } from "../services/BackendDataLoader";

interface BackendTool {
  toolName: string;
  totalUsageTime: number;
  usageCount: number;
  projectCount: number;
  status: string;
}

interface ToolManagerData {
  reportInfo: {
    generatedAt: string;
    summary: {
      excelFilesProcessed: number;
      jsonFilesProcessed: number;
      matrixToolsUsed: number;
      nonMatrixToolsUsed: number;
    };
  };
  matrixTools: BackendTool[];
  nonMatrixTools: BackendTool[];
}

interface ToolManagerProps {
  currentUser: any;
  view?: "available" | "remaining" | "non-matrix";
}

const ToolManager: React.FC<ToolManagerProps> = ({
  currentUser: _currentUser,
  view = "non-matrix",
}) => {
  const [toolData, setToolData] = useState<ToolManagerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());

  const toggleToolExpansion = (toolType: string) => {
    setExpandedTools((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(toolType)) {
        newSet.delete(toolType);
      } else {
        newSet.add(toolType);
      }
      return newSet;
    });
  };

  useEffect(() => {
    loadToolData();
  }, []);

  const loadToolData = async () => {
    setIsLoading(true);
    try {
      // First try to load from backend API (this will also update localStorage)
      const toolManagerData = await BackendDataLoader.loadToolManagerData();
      if (toolManagerData) {
        setToolData(toolManagerData);
        console.log(
          `✅ Loaded ${
            toolManagerData.matrixTools.length + toolManagerData.nonMatrixTools.length
          } tools from ToolManager backend`
        );
        return;
      }

      // Fall back to localStorage
      const storedData = localStorage.getItem("toolManagerResults");
      if (storedData) {
        const data = JSON.parse(storedData);
        setToolData(data);
        console.log(
          `✅ Loaded ${
            data.matrixTools.length + data.nonMatrixTools.length
          } tools from localStorage cache`
        );
      } else {
        console.log("ℹ️ No ToolManager results found");
        setToolData(null);
      }
    } catch (error) {
      console.error("Failed to load tool data:", error);
      setToolData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Force reload from backend API
      const toolManagerData = await BackendDataLoader.loadToolManagerData();
      if (toolManagerData) {
        setToolData(toolManagerData);
        console.log(
          `✅ Refreshed ${
            toolManagerData.matrixTools.length + toolManagerData.nonMatrixTools.length
          } tools from ToolManager backend`
        );
      } else {
        console.log("⚠️ No tool data available from backend");
        setToolData(null);
      }
    } catch (error) {
      console.error("Failed to refresh tool data:", error);
      // Try to fall back to existing data
      await loadToolData();
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!toolData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Tool Data Available</h3>
          <p className="text-gray-600 mb-4">
            Run ToolManager to generate tool tracking data
          </p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Refresh
          </Button>
        </div>
      </div>
    );
  }

  // Determine what to show based on view prop
  let displayTools: BackendTool[] = [];
  let viewTitle = "";
  let viewDescription = "";

  // Helper function to extract tool type from full tool name
  const extractToolType = (fullToolName: string): string => {
    const lastUnderscoreIndex = fullToolName.lastIndexOf("_");
    if (lastUnderscoreIndex === -1) {
      return fullToolName; // No underscore found, return as-is
    }
    return fullToolName.substring(0, lastUnderscoreIndex);
  };

  // Helper function to extract diameter from tool name (after underscore, before L)
  const extractDiameter = (fullToolName: string): string => {
    const parts = fullToolName.split("_");
    if (parts.length < 2) return "";
    
    // Extract diameter from specs like "H100M16L100" -> "16" (M16 = diameter 16mm)
    const specs = parts[1];
    const diameterMatch = specs.match(/[MFH](\d+(?:\.\d+)?)/);
    return diameterMatch ? `Ø${diameterMatch[1]}` : "";
  };

  // Helper function to get tool image path
  const getToolImagePath = (toolType: string) => {
    const manufacturers: Record<string, string> = {
      "GUH": "GUH",
      "TGT": "TGT",
      "FRA": "FRA",
      "AURA": "AURA",
    };

    // Find manufacturer from tool type prefix
    const manufacturer = Object.keys(manufacturers).find(key => toolType.startsWith(key));
    
    if (!manufacturer) {
      return ""; // No image available
    }

    // Strip common suffixes from tool type (e.g., TGT-VLM42-L → TGT-VLM42)
    const baseToolType = toolType.replace(/(-L|-AF\d+|-R\d+|-\d+R\d+)$/i, '');
    
    // Try multiple extensions in order of likelihood
    const extensions = ['.JPG', '.jpg', '.jfif', '.gif', '.png', '.jpeg'];
    
    // Return first extension - browser will try and fallback to wrench icon if 404
    const filename = `${baseToolType}${extensions[0]}`;
    
    return `http://localhost:3002/api/tool-images/${manufacturer}/${filename}`;
  };

  // Helper function to group tools by type and aggregate usage
  const groupToolsByType = (tools: BackendTool[]) => {
    const grouped = new Map<
      string,
      {
        toolType: string;
        totalUsageTime: number;
        usageCount: number;
        projectCount: number;
        instanceCount: number;
        instances: BackendTool[]; // Keep track of all instances
      }
    >();

    tools.forEach((tool) => {
      const toolType = extractToolType(tool.toolName);

      if (grouped.has(toolType)) {
        const existing = grouped.get(toolType)!;
        existing.totalUsageTime += tool.totalUsageTime;
        existing.usageCount += tool.usageCount;
        existing.projectCount = Math.max(
          existing.projectCount,
          tool.projectCount
        );
        existing.instanceCount += 1;
        existing.instances.push(tool); // Add instance
      } else {
        grouped.set(toolType, {
          toolType,
          totalUsageTime: tool.totalUsageTime,
          usageCount: tool.usageCount,
          projectCount: tool.projectCount,
          instanceCount: 1,
          instances: [tool], // Initialize with first instance
        });
      }
    });

    return Array.from(grouped.values()).sort(
      (a, b) => b.totalUsageTime - a.totalUsageTime
    );
  };

  if (view === "non-matrix") {
    displayTools = toolData.nonMatrixTools;
    viewTitle = "All Tool Usage";
    viewDescription = `Tool usage from ${toolData.reportInfo.summary.jsonFilesProcessed} JSON files, grouped by tool type`;
  } else if (view === "available") {
    // TODO: This requires full Excel inventory data from ToolManager backend
    // For now, show matrix tools (which is currently empty in test data)
    displayTools = toolData.matrixTools;
    viewTitle = "Currently Available Matrix Tools";
    viewDescription =
      displayTools.length > 0
        ? `${displayTools.length} tools from Excel matrix inventory`
        : "No matrix tools available. Update ToolManager backend to export full Excel inventory.";
  } else if (view === "remaining") {
    // Remaining = Matrix tools that exist in Excel but NOT used in JSON files
    // This also requires full Excel inventory data
    displayTools = []; // Placeholder until we have full inventory
    viewTitle = "Remaining Matrix Tools";
    viewDescription =
      "Tools available in Excel matrix inventory but not currently used in production. (Requires full Excel inventory data from ToolManager backend)";
  }

  const allTools = [...toolData.matrixTools, ...toolData.nonMatrixTools];

  // For "All Tool Usage" view, group by tool type
  const groupedTools =
    view === "non-matrix" ? groupToolsByType(displayTools) : [];

  // Filter based on whether we're showing grouped or individual tools
  const filteredTools =
    view === "non-matrix"
      ? [] // Not used for grouped view
      : displayTools.filter((tool) =>
          tool.toolName.toLowerCase().includes(searchTerm.toLowerCase())
        );

  const filteredGroupedTools =
    view === "non-matrix"
      ? groupedTools.filter((group) =>
          group.toolType.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];

  const totalTools = allTools.length;
  const matrixTools = toolData.matrixTools.length;
  const nonMatrixTools = toolData.nonMatrixTools.length;
  const highUsageTools = allTools.filter(
    (tool) => tool.totalUsageTime > 1000
  ).length;

  const getStatusBadge = (status: string) => {
    if (status === "NOT_IN_MATRIX") {
      return <Badge variant="outline">Non-Matrix</Badge>;
    }
    return <Badge variant="default">Matrix</Badge>;
  };

  const formatUsageTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tools</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTools}</div>
            <p className="text-xs text-muted-foreground">Tracked tools</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matrix Tools</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {matrixTools}
            </div>
            <p className="text-xs text-muted-foreground">From matrix files</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non-Matrix</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {nonMatrixTools}
            </div>
            <p className="text-xs text-muted-foreground">Not in matrix</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Usage</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {highUsageTools}
            </div>
            <p className="text-xs text-muted-foreground">
              {">"} 1000 min usage
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                Tool List (
                {view === "non-matrix"
                  ? filteredGroupedTools.length
                  : filteredTools.length}
                )
              </CardTitle>
              <CardDescription>
                {view === "non-matrix" &&
                  `${groupedTools.length} tool types from ${toolData.reportInfo.summary.jsonFilesProcessed} JSON files`}
                {view === "available" && "Tools from Excel matrix inventory"}
                {view === "remaining" &&
                  "Unused matrix tools available for production"}
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Input
                type="text"
                placeholder="Search tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* For "All Tool Usage" view, show grouped tools by type */}
            {view === "non-matrix" ? (
              filteredGroupedTools.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm
                    ? `No tool types found matching "${searchTerm}"`
                    : viewDescription}
                </div>
              ) : (
                filteredGroupedTools.map((group, index) => {
                  const isExpanded = expandedTools.has(group.toolType);
                  return (
                    <div key={index} className="border rounded-lg">
                      {/* Main tool type row - clickable */}
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleToolExpansion(group.toolType)}
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                          {getToolImagePath(group.toolType) ? (
                            <img
                              src={getToolImagePath(group.toolType)}
                              alt={group.toolType}
                              className="w-16 h-16 object-contain rounded"
                              onError={(e) => {
                                // Fallback to icon if image fails to load
                                (e.target as HTMLImageElement).style.display = "none";
                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                              }}
                            />
                          ) : null}
                          <Wrench className="h-5 w-5 text-muted-foreground hidden" />
                          <div>
                            <div className="flex items-baseline gap-3">
                              <span className="text-lg font-semibold text-blue-600">
                                {extractDiameter(group.instances[0]?.toolName || "")}
                              </span>
                              <h3 className="font-medium font-mono">{group.toolType}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {group.instanceCount} instance
                              {group.instanceCount !== 1 ? "s" : ""} • Found in{" "}
                              {group.projectCount} project
                              {group.projectCount !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right text-sm">
                            <div className="font-semibold text-blue-600">
                              {formatUsageTime(group.totalUsageTime)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Total usage
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded details - show individual instances */}
                      {isExpanded && group.instances.length > 0 && (
                        <div className="border-t bg-gray-50">
                          {group.instances.map((instance, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 pl-16 border-b last:border-b-0"
                            >
                              <div className="flex-1">
                                <p className="text-sm font-mono text-gray-700">
                                  {instance.toolName}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Used {instance.usageCount} time
                                  {instance.usageCount !== 1 ? "s" : ""} •{" "}
                                  {instance.projectCount} project
                                  {instance.projectCount !== 1 ? "s" : ""}
                                </p>
                              </div>
                              <div className="text-right text-sm">
                                <div className="text-gray-700">
                                  {formatUsageTime(instance.totalUsageTime)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )
            ) : /* For other views, show individual tools */
            filteredTools.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm
                  ? `No tools found matching "${searchTerm}"`
                  : viewDescription}
              </div>
            ) : (
              filteredTools.map((tool, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <Wrench className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">{tool.toolName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Used {tool.usageCount} time
                        {tool.usageCount !== 1 ? "s" : ""} across{" "}
                        {tool.projectCount} project
                        {tool.projectCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm">
                      <div className="font-semibold text-blue-600">
                        {formatUsageTime(tool.totalUsageTime)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Total usage
                      </div>
                    </div>
                    {getStatusBadge(tool.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {toolData.reportInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Report Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Generated</p>
                <p className="font-medium">
                  {new Date(toolData.reportInfo.generatedAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Excel Files</p>
                <p className="font-medium">
                  {toolData.reportInfo.summary.excelFilesProcessed}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">JSON Files</p>
                <p className="font-medium">
                  {toolData.reportInfo.summary.jsonFilesProcessed}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Tools</p>
                <p className="font-medium">
                  {toolData.reportInfo.summary.matrixToolsUsed +
                    toolData.reportInfo.summary.nonMatrixToolsUsed}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ToolManager;
