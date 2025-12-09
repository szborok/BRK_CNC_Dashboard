import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { AlertCircle, CheckCircle, AlertTriangle, ChevronDown, ChevronRight, Search } from "lucide-react";

interface MatrixTool {
  toolId: string;
  diameter: number;
  toolType: string;
  category?: string;
  codePrefix?: string;
  setupTime: number;
  toolLife: number;
  inPool: number;
  warningThreshold: number;
  imageUrl?: string;
}

interface GroupedTools {
  [category: string]: MatrixTool[];
}

export default function TodaysMatrixTools() {
  const [tools, setTools] = useState<MatrixTool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterHealth, setFilterHealth] = useState<string>("all");

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    setIsLoading(true);
    try {
      // Fetch from ToolManager backend
      const response = await fetch("http://localhost:3002/api/tools/matrix");
      if (response.ok) {
        const data = await response.json();
        const loadedTools = data.tools || [];
        setTools(loadedTools);
        
        // Open first family group by default
        if (loadedTools.length > 0) {
          const firstFamily = loadedTools[0].codePrefix;
          if (firstFamily) {
            setExpandedCategories(new Set([firstFamily]));
          }
        }
      }
    } catch (error) {
      console.error("Failed to load matrix tools:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const getHealthColor = (inPool: number, warningThreshold: number) => {
    if (inPool === 0) return "red";
    if (inPool <= warningThreshold) return "orange";
    return "green";
  };

  const getHealthPercentage = (inPool: number, warningThreshold: number) => {
    const max = warningThreshold * 2; // Green zone is 2x warning threshold
    return Math.min((inPool / max) * 100, 100);
  };

  const getHealthIcon = (inPool: number, warningThreshold: number) => {
    if (inPool === 0) return <AlertCircle className="h-5 w-5 text-red-600" />;
    if (inPool <= warningThreshold) return <AlertTriangle className="h-5 w-5 text-orange-600" />;
    return <CheckCircle className="h-5 w-5 text-green-600" />;
  };

  // Filter and group tools
  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.toolId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.toolType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || tool.category === filterCategory;
    const healthColor = getHealthColor(tool.inPool, tool.warningThreshold);
    const matchesHealth = filterHealth === "all" || healthColor === filterHealth;
    return matchesSearch && matchesCategory && matchesHealth;
  });

  // Group by tool family code (8400, 8410, etc) instead of category
  const groupedTools: GroupedTools = filteredTools.reduce((acc, tool) => {
    const familyCode = tool.codePrefix || 'Other';
    if (!acc[familyCode]) acc[familyCode] = [];
    acc[familyCode].push(tool);
    return acc;
  }, {} as GroupedTools);

  // Sort tool families numerically
  const categories = Object.keys(groupedTools).sort((a, b) => {
    const numA = parseInt(a) || 999999;
    const numB = parseInt(b) || 999999;
    return numA - numB;
  });

  const getFamilyColor = (familyCode: string) => {
    // Assign colors based on family code ranges
    const code = parseInt(familyCode) || 0;
    if (code >= 8400 && code <= 8420) return 'blue';    // ECUT family
    if (code >= 8200 && code <= 8221) return 'purple';  // MFC family
    if (code >= 15250 && code <= 15254) return 'green'; // XF family
    if (code === 8521) return 'green';                   // XF family
    if (code >= 7620 && code <= 7624) return 'orange';  // XFEED family
    return 'gray';
  };

  const getCategoryName = (familyCode: string) => {
    const code = parseInt(familyCode) || 0;
    if (code >= 8400 && code <= 8420) return 'ECUT';
    if (code >= 8200 && code <= 8221) return 'MFC';
    if (code >= 15250 && code <= 15254 || code === 8521) return 'XF';
    if (code >= 7620 && code <= 7624) return 'XFEED';
    return 'Other';
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-gray-500">Loading matrix tools...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {filteredTools.length} of {tools.length} matrix tools
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="ECUT">ECUT</option>
              <option value="MFC">MFC</option>
              <option value="XF">XF</option>
              <option value="XFEED">XFEED</option>
            </select>

            {/* Health Filter */}
            <select
              value={filterHealth}
              onChange={(e) => setFilterHealth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Health Status</option>
              <option value="green">Good</option>
              <option value="orange">Low</option>
              <option value="red">Empty</option>
            </select>

            {/* Reset */}
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterCategory("all");
                setFilterHealth("all");
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Grouped Tools List */}
      {categories.map(familyCode => {
        const categoryTools = groupedTools[familyCode];
        const isExpanded = expandedCategories.has(familyCode);
        const color = getFamilyColor(familyCode);
        const categoryName = getCategoryName(familyCode);

        return (
          <Card key={familyCode}>
            {/* Family Header */}
            <div
              onClick={() => toggleCategory(familyCode)}
              className={`px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 border-${color}-500 bg-${color}-50`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  )}
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-${color}-100 text-${color}-800`}>
                    {familyCode}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                    {categoryName}
                  </span>
                  <span className="text-gray-600 font-medium">
                    {categoryTools.length} {categoryTools.length === 1 ? 'tool' : 'tools'}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="text-gray-600">
                    Total: <span className="font-semibold">{categoryTools.reduce((sum, t) => sum + t.inPool, 0)}</span> pcs
                  </div>
                </div>
              </div>
            </div>

            {/* Category Tools Table */}
            {isExpanded && (
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Image
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Diameter
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tool Code
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tool Life
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Health
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {categoryTools.map((tool) => {
                        const healthColor = getHealthColor(tool.inPool, tool.warningThreshold);
                        const healthPercentage = getHealthPercentage(tool.inPool, tool.warningThreshold);

                        return (
                          <tr key={tool.toolId} className="hover:bg-gray-50 transition-colors">
                            {/* Image */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-12 w-28 flex items-center justify-center overflow-hidden">
                                {tool.imageUrl ? (
                                  <img
                                    src={`http://localhost:3002${tool.imageUrl}`}
                                    alt={tool.toolId}
                                    className="w-full h-full object-contain"
                                    style={{ backgroundColor: 'transparent' }}
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.parentElement!.innerHTML = '<span class="text-xs text-gray-400">No img</span>';
                                    }}
                                  />
                                ) : (
                                  <span className="text-xs text-gray-400">No img</span>
                                )}
                              </div>
                            </td>
                            
                            {/* Diameter */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {tool.diameter > 0 ? `Ø ${tool.diameter}mm` : '-'}
                              </div>
                            </td>
                            
                            {/* Tool Code */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900">{tool.toolId}</span>
                            </td>
                            
                            {/* Tool Life */}
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="text-sm text-gray-600">{tool.toolLife > 0 ? `${tool.toolLife}` : '-'}</span>
                              {tool.toolLife > 0 && <span className="text-xs text-gray-500 ml-1">min/piece</span>}
                            </td>
                            
                            {/* Quantity */}
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end space-x-2">
                                {getHealthIcon(tool.inPool, tool.warningThreshold)}
                                <span className="text-lg font-semibold text-gray-900">{tool.inPool}</span>
                                <span className="text-xs text-gray-500">pcs</span>
                              </div>
                            </td>
                            
                            {/* Health */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <div className="w-48">
                                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full transition-all duration-300 ${
                                        healthColor === "green"
                                          ? "bg-green-500"
                                          : healthColor === "orange"
                                          ? "bg-orange-500"
                                          : "bg-red-500"
                                      }`}
                                      style={{ width: `${healthPercentage}%` }}
                                    />
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 whitespace-nowrap min-w-[90px]">
                                  {healthColor === "green" && "Good"}
                                  {healthColor === "orange" && "Low"}
                                  {healthColor === "red" && "Empty"}
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      {filteredTools.length === 0 && tools.length > 0 && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center text-gray-500">
              No tools match your filters
            </div>
          </CardContent>
        </Card>
      )}

      {tools.length === 0 && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center text-gray-500">
              No matrix tools found in inventory
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
