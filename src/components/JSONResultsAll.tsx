import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  FileJson,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  RefreshCw,
  Eye,
  Calendar,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface RuleDetail {
  name: string;
  description: string;
  shouldRun: boolean;
  run: boolean;
  passed: boolean | null;
  failureType: string;
  violationCount: number;
  failures: Array<{
    item?: string;
    type?: string;
    message?: string;
    ncFile?: string;
    program?: string;
  }>;
  status: string;
}

interface JSONScanResult {
  id: string;
  filename: string;
  machine: string | null;
  operator: string | null;
  scanType: "auto" | "manual";
  processedAt: string;
  results: {
    rulesApplied: string[];
    violations: Array<{
      rule: string;
      message: string;
      location: string;
    }>;
    rules?: RuleDetail[];
  };
  status: "passed" | "failed" | "warning";
}

export default function JSONResultsAll() {
  const { user } = useAuth();
  const [results, setResults] = useState<JSONScanResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [scanTypeFilter, setScanTypeFilter] = useState<"all" | "auto" | "manual">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "passed" | "failed" | "warning">("all");
  const [machineFilter, setMachineFilter] = useState<string>("all");
  const [programmerFilter, setProgrammerFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [selectedResult, setSelectedResult] = useState<JSONScanResult | null>(
    null
  );

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    setIsLoading(true);
    try {
      // Fetch from JSONAnalyzer backend
      const response = await fetch("http://localhost:3005/api/projects");
      if (response.ok) {
        const data = await response.json();
        // Transform backend format to UI format
        const transformedResults = data.projects.map((project: any) => ({
          id: project.id || '',
          filename: project.filename || '',
          machine: project.machine || null,
          operator: project.operator || null,
          scanType: project.scanType || 'auto',
          processedAt: project.processedAt || '',
          results: {
            rulesApplied: project.results?.rulesApplied || [],
            violations: project.results?.violations || [],
          },
          status: project.status || "unknown",
        }));
        setResults(transformedResults);
        console.log(
          `✅ Loaded ${transformedResults.length} JSON analysis results from JSONScanner backend`
        );
      } else {
        console.error("Failed to fetch from backend:", response.statusText);
        setResults([]);
      }
    } catch (error) {
      console.error("Failed to load JSON results from backend:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDetailedResults = async (projectId: string) => {
    try {
      const response = await fetch(`http://localhost:3005/api/analysis/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error("Failed to load detailed results:", error);
    }
    return null;
  };

  const handleViewDetails = async (result: JSONScanResult) => {
    const detailed = await loadDetailedResults(result.id);
    if (detailed) {
      // The backend returns the full analysis with rules array
      const rules = detailed.results?.rules || detailed.rules || [];
      console.log('Detailed analysis loaded:', { projectId: result.id, rulesCount: rules.length, rules });
      setSelectedResult({ 
        ...result, 
        results: { 
          ...result.results, 
          rules: rules 
        } 
      });
    } else {
      console.warn('No detailed analysis found for:', result.id);
      setSelectedResult(result);
    }
  };

  const handleRefresh = async () => {
    await loadResults();
  };

  // Get unique values for filters
  const uniqueMachines = Array.from(new Set(results.map(r => r.machine).filter((m): m is string => m !== null && m !== undefined)));
  const uniqueProgrammers = Array.from(new Set(results.map(r => r.operator).filter((p): p is string => p !== null && p !== undefined)));

  // Filter by logged-in user's username (operator field matches username)
  const userFilteredResults = user?.role === 'admin' 
    ? results 
    : results.filter(result => result.operator?.toLowerCase() === user?.username?.toLowerCase());

  // Apply all filters
  const filteredResults = userFilteredResults.filter((result) => {
    // Search filter
    const matchesSearch = result.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          result.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Scan type filter
    const matchesScanType = scanTypeFilter === 'all' || result.scanType === scanTypeFilter;
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || result.status === statusFilter;
    
    // Machine filter
    const matchesMachine = machineFilter === 'all' || result.machine === machineFilter;
    
    // Programmer filter
    const matchesProgrammer = programmerFilter === 'all' || result.operator === programmerFilter;
    
    // Date range filter
    const resultDate = new Date(result.processedAt);
    const matchesDateFrom = !dateFrom || resultDate >= new Date(dateFrom);
    const matchesDateTo = !dateTo || resultDate <= new Date(dateTo + 'T23:59:59');
    
    return matchesSearch && matchesScanType && matchesStatus && matchesMachine && matchesProgrammer && matchesDateFrom && matchesDateTo;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "passed":
        return (
          <Badge className="bg-green-100 text-green-800 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Passed
          </Badge>
        );
      case "warning":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 gap-1">
            <AlertTriangle className="h-3 w-3" />
            Warning
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">All Results</h1>
          <p className="text-gray-600 mt-1">
            View all processed CNC program files and their analysis results
          </p>
          {results.length > 0 && results[0].processedAt && (
            <p className="text-sm text-gray-500 mt-1">
              Data from: {formatDate(results[0].processedAt)}
            </p>
          )}
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by filename or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* Type Filter */}
          <select
            value={scanTypeFilter}
            onChange={(e) => setScanTypeFilter(e.target.value as any)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Types</option>
            <option value="auto">🤖 Auto</option>
            <option value="manual">👤 Manual</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Status</option>
            <option value="passed">✓ Passed</option>
            <option value="failed">✗ Failed</option>
            <option value="warning">⚠ Warning</option>
          </select>

          {/* Machine Filter */}
          <select
            value={machineFilter}
            onChange={(e) => setMachineFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Machines</option>
            {uniqueMachines.map((machine: string) => (
              <option key={machine} value={machine}>{machine}</option>
            ))}
          </select>

          {/* Programmer Filter */}
          <select
            value={programmerFilter}
            onChange={(e) => setProgrammerFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Programmers</option>
            {uniqueProgrammers.map((programmer: string) => (
              <option key={programmer} value={programmer}>{programmer}</option>
            ))}
          </select>

          {/* Date From */}
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            placeholder="From Date"
            className="text-sm"
          />

          {/* Date To */}
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            placeholder="To Date"
            className="text-sm"
          />

          {/* Clear Filters */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setScanTypeFilter("all");
              setStatusFilter("all");
              setMachineFilter("all");
              setProgrammerFilter("all");
              setDateFrom("");
              setDateTo("");
              setSearchTerm("");
            }}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Results</CardTitle>
          <CardDescription>
            {filteredResults.length} result
            {filteredResults.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredResults.length === 0 ? (
            <div className="text-center py-12">
              <FileJson className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {userFilteredResults.length === 0
                  ? user?.role === 'admin' 
                    ? "No JSON analysis results found. Run the JSONScanner backend to generate results."
                    : "No JSON analysis results found for your user account."
                  : "No results match your search."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Filename</TableHead>
                  <TableHead>Machine</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rules Applied</TableHead>
                  <TableHead>Programmer</TableHead>
                  <TableHead>Processed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileJson className="h-4 w-4 text-blue-600" />
                        {result.filename}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-700">
                        {result.machine || "Unknown"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={result.scanType === 'manual' ? 'default' : 'secondary'}
                        className={result.scanType === 'manual' ? 'bg-purple-100 text-purple-800' : ''}
                      >
                        {result.scanType === 'manual' ? '👤 Manual' : '🤖 Auto'}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(result.status)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {result.results.rulesApplied.length} rules
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-700">
                        {result.operator || "Unknown"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        {formatDate(result.processedAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(result)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[85vh] flex flex-col bg-white shadow-xl">
            <CardHeader className="border-b">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-xl">{selectedResult.filename}</CardTitle>
                    {getStatusBadge(selectedResult.status)}
                  </div>
                  <CardDescription className="mt-2 flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(selectedResult.processedAt)}
                    </span>
                    <span className="text-sm text-gray-600">
                      Machine: {selectedResult.machine || "Unknown"}
                    </span>
                    <span className="text-sm text-gray-600">
                      Operator: {selectedResult.operator || "Unknown"}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {user?.role === 'admin' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        if (confirm(`Re-analyze ${selectedResult.filename}? This will reprocess the file and update all rules.`)) {
                          try {
                            console.log(`⏳ Re-analyzing ${selectedResult.filename}...`);
                            const response = await fetch(`http://localhost:3005/api/projects/${selectedResult.id}/reanalyze`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' }
                            });
                            if (response.ok) {
                              console.log(`✅ Re-analysis completed for ${selectedResult.filename}`);
                              setSelectedResult(null);
                              // Reload results immediately since backend completed the scan
                              await loadResults();
                            } else {
                              alert('Failed to trigger re-analysis. Check console for details.');
                            }
                          } catch (error) {
                            console.error('Re-analysis failed:', error);
                            alert('Error triggering re-analysis.');
                          }
                        }
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Re-analyze
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedResult(null)}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="overflow-auto flex-1 p-6">
              {/* Rules Table */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Quality Rules Evaluation
                </h3>
                {selectedResult.results.rules && selectedResult.results.rules.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rule Name</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead>Failed Items</TableHead>
                        <TableHead>Reason / Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedResult.results.rules.map((rule, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">
                            <div className="text-sm">{rule.name}</div>
                            <div className="text-xs text-gray-500">{rule.description}</div>
                          </TableCell>
                          <TableCell>
                            {!rule.shouldRun ? (
                              <Badge variant="outline" className="bg-gray-100">
                                Skipped
                              </Badge>
                            ) : rule.passed === null ? (
                              <Badge variant="outline">N/A</Badge>
                            ) : rule.passed ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Pass
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1" />
                                Fail
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {!rule.shouldRun || rule.passed === null ? (
                              <span className="text-xs text-gray-400">-</span>
                            ) : !rule.passed && rule.failures && rule.failures.length > 0 ? (
                              <div className="text-xs font-mono space-y-1">
                                {rule.failures.map((failure, fIdx) => (
                                  <div key={fIdx} className="text-red-700">
                                    {failure.ncFile || failure.program || failure.item || "Item " + (fIdx + 1)}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-green-600">None</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {!rule.shouldRun ? (
                              <span className="text-xs text-gray-600">Rule not applicable for this project</span>
                            ) : rule.passed === null ? (
                              <span className="text-xs text-gray-600">Not evaluated</span>
                            ) : !rule.passed && rule.failures && rule.failures.length > 0 ? (
                              <div className="text-xs space-y-1">
                                {rule.failures.map((failure, fIdx) => (
                                  <div key={fIdx} className="text-red-700">
                                    {failure.message || "Violation detected"}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-green-600">All checks passed</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Loading detailed rule information...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
