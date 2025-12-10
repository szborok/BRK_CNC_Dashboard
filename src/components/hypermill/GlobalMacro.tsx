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

export default function GlobalMacro() {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - will be replaced with actual API calls
  const macroCategories = [
    { id: "all", name: "All Macros", count: 127 },
    { id: "toolpath", name: "Toolpath", count: 45 },
    { id: "setup", name: "Setup", count: 32 },
    { id: "postprocess", name: "Post-Process", count: 28 },
    { id: "utility", name: "Utility", count: 22 },
  ];

  const macros = [
    {
      name: "Auto_Tool_Setup",
      description: "Automatically configures tool parameters based on material",
      category: "setup",
      lastModified: "2025-12-08",
      author: "Admin",
      usageCount: 245,
      path: "C:\\hyperMILL\\Macros\\Setup\\",
    },
    {
      name: "Batch_NC_Export",
      description: "Export multiple NC programs with custom naming",
      category: "postprocess",
      lastModified: "2025-12-10",
      author: "John Doe",
      usageCount: 189,
      path: "C:\\hyperMILL\\Macros\\PostProcess\\",
    },
    {
      name: "Rapid_Toolpath_Check",
      description: "Quick validation of toolpath parameters",
      category: "toolpath",
      lastModified: "2025-12-07",
      author: "Admin",
      usageCount: 312,
      path: "C:\\hyperMILL\\Macros\\Toolpath\\",
    },
    {
      name: "Stock_Calculator",
      description: "Calculate required stock dimensions",
      category: "utility",
      lastModified: "2025-12-05",
      author: "Jane Smith",
      usageCount: 156,
      path: "C:\\hyperMILL\\Macros\\Utility\\",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Global Macros</h1>
          <p className="text-muted-foreground">
            Manage hyperMILL macro scripts for automation and efficiency
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
              <CardTitle>Available Macros</CardTitle>
              <CardDescription>
                All macro scripts configured in your hyperMILL installation
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
