import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  FileCode, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Download, 
  Upload,
  Play,
  Copy,
  FolderOpen
} from "lucide-react";

interface GlobalMacroProps {
  scope?: "my" | "all";
}

export default function GlobalMacro({ scope = "all" }: GlobalMacroProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const isMyScripts = scope === "my";

  // Mock data - will be replaced with actual API calls
  const macroCategories = [
    { id: "all", name: "All Scripts", count: isMyScripts ? 12 : 50 },
    { id: "vbscript", name: "VB Scripts", count: isMyScripts ? 8 : 32 },
    { id: "python", name: "Python Scripts", count: isMyScripts ? 4 : 18 },
  ];

  const macros = [
    {
      name: "ToolpathValidation.vbs",
      description: "VBScript for automated toolpath validation checks",
      category: "vbscript",
      lastModified: "2025-12-08",
      author: "Admin",
      usageCount: 245,
      path: "[DefaultPath]\\VB SCRIPTS\\Validation\\",
    },
    {
      name: "BatchExport.vbs",
      description: "Export multiple NC programs with custom settings",
      category: "vbscript",
      lastModified: "2025-12-10",
      author: "John Doe",
      usageCount: 189,
      path: "[DefaultPath]\\VB SCRIPTS\\Export\\",
    },
    {
      name: "nc_processor.py",
      description: "Python script for advanced NC code post-processing",
      category: "python",
      lastModified: "2025-12-07",
      author: "Admin",
      usageCount: 312,
      path: "[DefaultPath]\\PYTHON SCRIPTS\\PostProcessing\\",
    },
    {
      name: "stock_optimizer.py",
      description: "Calculate optimal stock dimensions and orientations",
      category: "python",
      lastModified: "2025-12-05",
      author: "Jane Smith",
      usageCount: 156,
      path: "[DefaultPath]\\PYTHON SCRIPTS\\Utilities\\",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isMyScripts ? "My Macros" : "All Macros"}
          </h1>
          <p className="text-muted-foreground">
            {isMyScripts 
              ? "Manage your personal VBScript and Python automation scripts"
              : "View company-wide VBScript and Python automation scripts"
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Macro
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Macro
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search macros by name, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <FolderOpen className="h-4 w-4 mr-2" />
          Open Macro Folder
        </Button>
      </div>

      {/* Category Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          {macroCategories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
              <Badge variant="secondary" className="ml-2">
                {category.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{isMyScripts ? "My Scripts" : "Available Scripts"}</CardTitle>
              <CardDescription>
                {isMyScripts 
                  ? "VBScript and Python files stored in your local user folder"
                  : "Company-wide VBScript and Python scripts from the global repository"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {macros.map((macro, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileCode className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{macro.name}</h3>
                          <Badge variant="outline">{macro.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{macro.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Modified: {macro.lastModified}</span>
                          <span>•</span>
                          <span>By: {macro.author}</span>
                          <span>•</span>
                          <span>Used {macro.usageCount} times</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other category tabs would filter the macros */}
        {macroCategories.slice(1).map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{category.name} Macros</CardTitle>
                <CardDescription>
                  Macros in the {category.name.toLowerCase()} category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Filtering by category would be implemented here with backend integration
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
