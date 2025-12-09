import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Search, Filter, SortAsc, SortDesc } from "lucide-react";
import { LegacyUser, Plate } from "../App";
import PlateDetailModal from "./PlateDetailModal";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { BackendDataLoader } from "../services/BackendDataLoader";

interface PlatesTableProps {
  user: LegacyUser;
  filter?:
    | "new-health"
    | "used-health"
    | "locked-health"
    | "free-occupancy"
    | "in-use-occupancy"
    | "ongoing-work"
    | "history";
}

// Helper to load real clamping plate data from backend results
const loadRealPlateData = (): Plate[] => {
  try {
    const storedData = localStorage.getItem("clampingPlateResults");
    if (storedData) {
      const clampingData = JSON.parse(storedData);
      if (clampingData.plates && Array.isArray(clampingData.plates)) {
        // Transform backend plate format to app Plate format
        return clampingData.plates.map((backendPlate: any) => {
          const health: "new" | "used" | "locked" = backendPlate.isLocked
            ? "locked"
            : backendPlate.health === "new"
            ? "new"
            : "used";

          const occupancy: "free" | "in-use" = backendPlate.isLocked
            ? "in-use"
            : "free";

          // Convert workProjects to history entries
          const history = (backendPlate.workProjects || []).map((project: any, index: number) => ({
            id: `work-${backendPlate.id}-${index}`,
            action: 'Work Project',
            user: 'Unknown (Excel import)',
            date: new Date(backendPlate.metadata?.generatedDate || Date.now()),
            details: `Project: ${project.projectCode || 'Unknown'} | Work Order: ${project.workOrder || 'N/A'} | ${project.fullEntry || 'No details'}`
          }));

          return {
            id: backendPlate.id,
            plateNumber: backendPlate.plateNumber,
            name: `Plate ${backendPlate.plateNumber}`,
            shelf: backendPlate.shelfNumber || backendPlate.shelf || "Unknown",
            boxSize: backendPlate.boxSize,
            previewImage: backendPlate.previewImage || "/placeholder-plate.png",
            xtFile: backendPlate.currentModelFile || "",
            health,
            occupancy,
            notes: backendPlate.notes || "",
            lastWorkName:
              backendPlate.workProjects?.[backendPlate.workProjects.length - 1]
                ?.workOrder || "",
            lastModifiedBy: "System",
            lastModifiedDate: new Date(
              backendPlate.metadata?.generatedDate || Date.now()
            ),
            history,
            // Preserve original backend data for detail view
            workProjects: backendPlate.workProjects || [],
            workHistoryEntries: backendPlate.workHistoryEntries || [],
            excelSource: backendPlate.excelSource,
            isLocked: backendPlate.isLocked || false,
            modelFiles: backendPlate.modelFiles || [],
          } as any;
        });
      }
    }
  } catch (error) {
    console.warn("Failed to load real plate data:", error);
  }
  return [];
};

const getHealthBadge = (health: string) => {
  switch (health) {
    case "new":
      return <Badge className="bg-green-100 text-green-800">🟢 New</Badge>;
    case "used":
      return <Badge className="bg-blue-100 text-blue-800">🔵 Used</Badge>;
    case "locked":
      return <Badge className="bg-red-100 text-red-800">🔴 Locked</Badge>;
    default:
      return <Badge variant="outline">{health}</Badge>;
  }
};

const getOccupancyBadge = (occupancy: string) => {
  switch (occupancy) {
    case "free":
      return <Badge className="bg-orange-100 text-orange-800">🟠 Free</Badge>;
    case "in-use":
      return <Badge className="bg-purple-100 text-purple-800">🟣 In Use</Badge>;
    default:
      return <Badge variant="outline">{occupancy}</Badge>;
  }
};

const getFilteredPlates = (
  plates: Plate[],
  filter?: string,
  search?: string
) => {
  let filtered = plates;

  // Apply status filter
  if (filter) {
    switch (filter) {
      case "new-health":
        filtered = plates.filter((p) => p.health === "new");
        break;
      case "used-health":
        filtered = plates.filter((p) => p.health === "used");
        break;
      case "locked-health":
        filtered = plates.filter((p) => p.health === "locked");
        break;
      case "free-occupancy":
        filtered = plates.filter((p) => p.occupancy === "free");
        break;
      case "in-use-occupancy":
        filtered = plates.filter((p) => p.occupancy === "in-use");
        break;
      case "ongoing-work":
        filtered = plates.filter((p) => p.occupancy === "in-use");
        break;
      case "history":
        filtered = plates.filter((p) => p.lastWorkName);
        break;
    }
  }

  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.id.toLowerCase().includes(searchLower) ||
        p.name?.toLowerCase().includes(searchLower) ||
        p.lastWorkName?.toLowerCase().includes(searchLower) ||
        p.shelf.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
};

export default function PlatesTable({ user, filter }: PlatesTableProps) {
  const [plates, setPlates] = useState<Plate[]>([]);
  const [selectedPlate, setSelectedPlate] = useState<Plate | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<
    "id" | "name" | "status" | "shelf" | "modified"
  >("modified");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Load real plate data on mount and when localStorage changes
  useEffect(() => {
    const loadPlates = async () => {
      console.log("🔍 [PlatesTable] Component mounted, loading plates...");
      // First try to load from API to populate cache
      const apiResult = await BackendDataLoader.loadClampingPlateData();
      console.log("🔍 [PlatesTable] API result:", apiResult ? "data received" : "no data");
      
      // Then load from localStorage (now populated by API)
      const realPlates = loadRealPlateData();
      console.log(`✅ [PlatesTable] Loaded ${realPlates.length} plates from backend`);
      
      if (realPlates.length === 0) {
        console.warn("⚠️ [PlatesTable] No plates loaded! Check:");
        console.warn("  1. Is ClampingPlateManager running on port 3003?");
        console.warn("  2. Does plates.json have data?");
        console.warn("  3. Check browser console for errors");
        console.warn("  4. Check localStorage for 'clampingPlateResults'");
      }
      
      setPlates(realPlates);
    };

    loadPlates();

    // Listen for storage changes (when setup wizard loads data)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "clampingPlateResults") {
        const realPlates = loadRealPlateData();
        console.log(`Updated ${realPlates.length} plates from storage change`);
        setPlates(realPlates);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const filteredPlates = getFilteredPlates(plates, filter, search);

  const sortedPlates = [...filteredPlates].sort((a, b) => {
    let aValue: string | Date | number, bValue: string | Date | number;

    switch (sortBy) {
      case "id": {
        // Sort by plateNumber (numeric)
        const aNum = a.plateNumber || 0;
        const bNum = b.plateNumber || 0;
        return sortOrder === "asc" ? aNum - bNum : bNum - aNum;
      }
      case "name":
        aValue = a.name || a.id;
        bValue = b.name || b.id;
        break;
      case "status":
        aValue = a.health + a.occupancy;
        bValue = b.health + b.occupancy;
        break;
      case "shelf":
        aValue = a.shelf;
        bValue = b.shelf;
        break;
      case "modified":
      default:
        aValue = a.lastModifiedDate;
        bValue = b.lastModifiedDate;
        break;
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const _getPageTitle = () => {
    switch (filter) {
      case "new-health":
        return "New Plates";
      case "used-health":
        return "Used Plates";
      case "locked-health":
        return "Locked Plates";
      case "free-occupancy":
        return "Free Plates";
      case "in-use-occupancy":
        return "In Use Plates";
      case "ongoing-work":
        return "Your Ongoing Work";
      case "history":
        return "Work History";
      default:
        return "All Clamping Plates";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {sortedPlates.length} plate{sortedPlates.length !== 1 ? "s" : ""}{" "}
            found
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search plates by ID, name, work, or shelf..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as any)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="id">Sort by ID</SelectItem>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="status">Sort by Status</SelectItem>
                  <SelectItem value="shelf">Sort by Shelf</SelectItem>
                  <SelectItem value="modified">Sort by Modified</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
              >
                {sortOrder === "asc" ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Preview</TableHead>
                  <TableHead>Plate Info</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Last Work
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Notes
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Modified
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Box Size
                  </TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPlates.map((plate) => (
                  <TableRow
                    key={plate.id}
                    className="cursor-pointer hover:bg-muted/50 h-16"
                    onClick={() => setSelectedPlate(plate)}
                  >
                    <TableCell className="pr-2">
                      <ImageWithFallback
                        src={`http://localhost:3003/api/previews/${plate.previewImage}`}
                        alt={`Preview of ${plate.id}`}
                        className="w-40 h-40 object-contain rounded"
                      />
                    </TableCell>
                    <TableCell className="pl-2">
                      <div className="font-mono font-semibold">ID: {plate.plateNumber || plate.id}</div>
                      <div className="text-xs text-muted-foreground">
                        Shelf: {plate.shelf}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell max-w-[140px]">
                      <div>
                        <div className="font-mono text-sm truncate">
                          {plate.lastWorkName || "No previous work"}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          by {plate.lastModifiedBy}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell max-w-[70px]">
                      <div className="text-sm text-muted-foreground truncate">
                        {plate.notes || "-"}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="text-sm">
                        {plate.lastModifiedDate.toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {plate.lastModifiedDate.toLocaleTimeString()}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-sm">
                        {plate.boxSize || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {getHealthBadge(plate.health)}
                        {getOccupancyBadge(plate.occupancy)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {sortedPlates.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No plates found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plate Detail Modal */}
      {selectedPlate && (
        <PlateDetailModal
          plate={selectedPlate}
          user={user}
          isOpen={!!selectedPlate}
          onClose={() => setSelectedPlate(null)}
          onUpdate={async (updatedPlate) => {
            try {
              // Update the backend
              const response = await fetch(`http://localhost:3003/api/plates/${updatedPlate.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  health: updatedPlate.health,
                  occupancy: updatedPlate.occupancy,
                  notes: updatedPlate.notes,
                  lastWorkName: updatedPlate.lastWorkName,
                  modifiedBy: updatedPlate.lastModifiedBy,
                }),
              });

              if (!response.ok) {
                throw new Error('Failed to update plate');
              }

              const backendPlate = await response.json();
              
              // Update local state with backend response
              setSelectedPlate(backendPlate);
              
              // Refresh the plates list
              await BackendDataLoader.fetchClampingPlateData();
              
            } catch (error) {
              console.error('Failed to update plate:', error);
              // Still update local state as fallback
              setSelectedPlate(updatedPlate);
            }
          }}
        />
      )}
    </div>
  );
}
