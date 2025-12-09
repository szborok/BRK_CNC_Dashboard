import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Download,
  Play,
  Pause,
  Square,
  CheckCircle,
  Edit3,
  Calendar,
  MapPin,
  Box,
  Lock
} from 'lucide-react';
import { LegacyUser, Plate } from '../App';
import { toast } from "sonner";
import StopWorkModal from './StopWorkModal';
import AdminEditModal from './AdminEditModal';
import FinishWorkModal from './FinishWorkModal';

interface PlateDetailModalProps {
  plate: Plate;
  user: LegacyUser;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (plate: Plate) => void;
}

export default function PlateDetailModal({ plate, user, isOpen, onClose, onUpdate }: PlateDetailModalProps) {
  const [showStopModal, setShowStopModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'new':
        return <Badge className="bg-green-100 text-green-800">🟢 New</Badge>;
      case 'used':
        return <Badge className="bg-blue-100 text-blue-800">🔵 Used</Badge>;
      case 'locked':
        return <Badge className="bg-red-100 text-red-800">🔴 Locked</Badge>;
      default:
        return <Badge variant="outline">{health}</Badge>;
    }
  };

  const getOccupancyBadge = (occupancy: string) => {
    switch (occupancy) {
      case 'free':
        return <Badge className="bg-orange-100 text-orange-800">🟠 Free</Badge>;
      case 'in-use':
        return <Badge className="bg-purple-100 text-purple-800">🟣 In Use</Badge>;
      default:
        return <Badge variant="outline">{occupancy}</Badge>;
    }
  };

  const canStartWork = plate.health !== 'locked' && plate.occupancy === 'free';
  const canPauseWork = plate.occupancy === 'in-use';
  const canStopWork = plate.occupancy === 'in-use';
  const canFinishWork = plate.occupancy === 'in-use';

  const handleStartWork = () => {
    const updatedPlate = {
      ...plate,
      occupancy: 'in-use' as const,
      lastModifiedBy: user.name,
      lastModifiedDate: new Date(),
      history: [
        {
          id: Date.now().toString(),
          action: 'Work started',
          user: user.name,
          date: new Date(),
          details: 'Work session began'
        },
        ...plate.history
      ]
    };
    onUpdate(updatedPlate);
    toast.success('Work started successfully');
  };

  const handlePauseWork = () => {
    const updatedPlate = {
      ...plate,
      health: 'used' as const,
      occupancy: 'free' as const,
      lastModifiedBy: user.name,
      lastModifiedDate: new Date(),
      history: [
        {
          id: Date.now().toString(),
          action: 'Work paused',
          user: user.name,
          date: new Date(),
          details: 'Work session paused'
        },
        ...plate.history
      ]
    };
    onUpdate(updatedPlate);
    toast.success('Work paused successfully');
  };

  const handleStopWork = (message: string) => {
    const updatedPlate = {
      ...plate,
      occupancy: 'free' as const,
      lastModifiedBy: user.name,
      lastModifiedDate: new Date(),
      notes: message,
      history: [
        {
          id: Date.now().toString(),
          action: 'Work stopped',
          user: user.name,
          date: new Date(),
          details: message
        },
        ...plate.history
      ]
    };
    onUpdate(updatedPlate);
    setShowStopModal(false);
    toast.success('Work stopped successfully');
    // Close the main modal after stopping work to make the action feel more definitive
    setTimeout(() => onClose(), 500);
  };

  const handleFinishWork = (_xtFile: File, _previewImage: File, notes?: string) => {
    const updatedPlate = {
      ...plate,
      health: 'used' as const,
      occupancy: 'free' as const,
      lastModifiedBy: user.name,
      lastModifiedDate: new Date(),
      lastWorkName: `W${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      notes: notes,
      history: [
        {
          id: Date.now().toString(),
          action: 'Work completed',
          user: user.name,
          date: new Date(),
          details: `Work finished with file updates${notes ? ': ' + notes : ''}`
        },
        ...plate.history
      ]
    };
    onUpdate(updatedPlate);
    setShowFinishModal(false);
    toast.success('Work completed successfully');
  };

  const handleDownload = () => {
    toast.success('X_T file download started');
    // In a real app, this would download the actual file
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-6xl w-full max-h-[90vh] flex flex-col bg-white shadow-xl">
            <CardHeader className="border-b">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-xl">Plate #{plate.plateNumber || 'N/A'}</CardTitle>
                    {getHealthBadge(plate.health)}
                    {getOccupancyBadge(plate.occupancy)}
                    {(plate as any).isLocked && (
                      <Badge variant="destructive">
                        <Lock className="h-3 w-3 mr-1" />
                        Locked
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="mt-2 flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Shelf {plate.shelf}
                    </span>
                    <span className="text-sm text-gray-600">
                      ID: {plate.id}
                    </span>
                    {plate.lastModifiedDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(plate.lastModifiedDate).toLocaleDateString()}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>

            <CardContent className="overflow-auto flex-1 p-6">
              <div className="space-y-6">
                {/* Latest Stage Display */}
                {(() => {
                  const workProjects = (plate as any).workProjects;
                  if (!workProjects || workProjects.length === 0) return null;
                  
                  const latestStage = workProjects[workProjects.length - 1];
                  const stageIdx = workProjects.length - 1;
                  
                  return (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="font-mono">
                          Stage {latestStage.projectCode || String.fromCharCode(65 + stageIdx)}
                        </Badge>
                        <span className="font-semibold text-sm">
                          {latestStage.workOrder}
                        </span>
                      </div>
                      
                      <div className="flex gap-4">
                        {/* Left: Preview - 45% width */}
                        <div className="w-[45%]">
                          {(plate as any).previewImage ? (
                            <img 
                              src={`http://localhost:3003/api/previews/${(plate as any).previewImage}`}
                              alt="Plate preview"
                              className="w-full aspect-square object-contain rounded border bg-white"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`bg-gray-200 rounded aspect-square flex items-center justify-center ${(plate as any).previewImage ? 'hidden' : ''}`}>
                            <span className="text-xs text-gray-400">No preview available</span>
                          </div>
                        </div>
                        
                        {/* Right: Stage Data - 55% width */}
                        <div className="w-[55%] space-y-3 text-right">
                          <p className="text-sm font-medium text-gray-700 pb-2 border-b">
                            {latestStage.fullEntry}
                          </p>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-end items-baseline gap-2">
                              <span className="text-gray-500 font-medium">User:</span>
                              <span className="text-gray-700">Unknown (Excel import)</span>
                            </div>
                            <div className="flex justify-end items-baseline gap-2">
                              <span className="text-gray-500 font-medium">Date:</span>
                              <span className="text-gray-700">Unknown (Excel import)</span>
                            </div>
                            <div className="flex justify-end items-baseline gap-2">
                              <span className="text-gray-500 font-medium">Original Model:</span>
                              <span className="text-gray-700">Not recorded</span>
                            </div>
                            <div className="flex justify-end items-baseline gap-2">
                              <span className="text-gray-500 font-medium">Result Model:</span>
                              <span className="text-gray-700">Not recorded</span>
                            </div>
                          </div>

                          {/* Notes if any */}
                          {plate.notes && plate.notes.trim() !== '' && (
                            <div className="pt-2">
                              <div className="text-xs text-gray-500 mb-1">Notes:</div>
                              <div className="p-2 bg-amber-50 border border-amber-200 rounded text-xs">
                                {plate.notes}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Work Stages History */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Work Stages History
                  </h3>
                  
                  {/* Convert Excel work projects to stages (legacy data) - Show from newest to oldest */}
                  {(() => {
                    const workProjects = (plate as any).workProjects;
                    console.log('🔍 [PlateDetail] workProjects:', workProjects);
                    console.log('🔍 [PlateDetail] plate keys:', Object.keys(plate));
                    return workProjects && workProjects.length > 0;
                  })() ? (
                    <div className="space-y-2">
                      {[...(plate as any).workProjects].reverse().map((project: any, reverseIdx: number) => {
                        const idx = (plate as any).workProjects.length - 1 - reverseIdx;
                        const [isOpen, setIsOpen] = useState(false);
                        return (
                          <div key={idx} className="border rounded-lg bg-gray-50">
                            {/* Stage Header - Clickable */}
                            <button
                              onClick={() => setIsOpen(!isOpen)}
                              className="w-full p-3 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-mono">
                                  Stage {project.projectCode || String.fromCharCode(65 + idx)}
                                </Badge>
                                <span className="font-semibold text-sm">
                                  {project.workOrder}
                                </span>
                              </div>
                              <span className="text-gray-400">
                                {isOpen ? '▼' : '▶'}
                              </span>
                            </button>

                            {/* Stage Details - Collapsible */}
                            {isOpen && (
                              <div className="px-4 pb-4 space-y-3">
                                <p className="text-xs text-gray-600 pb-2 border-b">
                                  {project.fullEntry}
                                </p>
                                
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                  <div>
                                    <span className="text-gray-500">User:</span>
                                    <span className="ml-2 text-gray-600">Unknown (Excel import)</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Date:</span>
                                    <span className="ml-2 text-gray-600">Unknown (Excel import)</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Original Model:</span>
                                    <span className="ml-2 text-gray-600">Not recorded</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Result Model:</span>
                                    <span className="ml-2 text-gray-600">Not recorded</span>
                                  </div>
                                </div>

                                {/* Preview placeholder */}
                                <div>
                                  <div className="text-xs text-gray-500 mb-1">Preview:</div>
                                  <div className="bg-gray-200 rounded h-24 flex items-center justify-center">
                                    <span className="text-xs text-gray-400">No preview available</span>
                                  </div>
                                </div>

                              </div>
                            )}
                          </div>
                        );
                      })}
                      
                      {(plate as any).excelSource && (
                        <p className="text-xs text-gray-500 italic">
                          ℹ️ Legacy data imported from Excel: {(plate as any).excelSource.worksheet} 
                          (Rows {(plate as any).excelSource.firstRow}-{(plate as any).excelSource.lastRow})
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 border rounded-lg bg-gray-50">
                      <p className="text-sm">No work stages recorded yet</p>
                      <p className="text-xs mt-1">Start work to create the first stage</p>
                    </div>
                  )}
                </div>

                {/* History */}
                {plate.history && plate.history.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">History</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Action</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {plate.history.slice(0, 10).map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell className="font-medium text-sm">{entry.action}</TableCell>
                            <TableCell className="text-sm">{entry.user}</TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {new Date(entry.date).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-xs text-gray-600">
                              {entry.details || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>

            {/* Action Footer */}
            <div className="border-t p-4">
              <div className="flex flex-wrap gap-2 justify-between">
                <div className="flex flex-wrap gap-2">
                  {canStartWork && (
                    <Button onClick={handleStartWork} size="sm" className="bg-green-600 hover:bg-green-700">
                      <Play className="h-4 w-4 mr-1" />
                      Start Work
                    </Button>
                  )}
                  {canPauseWork && (
                    <Button onClick={handlePauseWork} variant="outline" size="sm">
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </Button>
                  )}
                  {canStopWork && (
                    <Button onClick={() => setShowStopModal(true)} variant="destructive" size="sm">
                      <Square className="h-4 w-4 mr-1" />
                      Stop
                    </Button>
                  )}
                  {user.isAdmin && (
                    <Button 
                      onClick={() => setShowAdminModal(true)} 
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Admin Edit
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    onClick={handleDownload} 
                    variant="outline" 
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download Model
                  </Button>
                  {canFinishWork && (
                    <Button 
                      onClick={() => setShowFinishModal(true)} 
                      className="bg-blue-600 hover:bg-blue-700" 
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Finish Work
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Stop Work Modal */}
      <StopWorkModal
        isOpen={showStopModal}
        onClose={() => setShowStopModal(false)}
        onConfirm={handleStopWork}
        plateId={plate.id}
      />

      {/* Finish Work Modal */}
      <FinishWorkModal
        isOpen={showFinishModal}
        onClose={() => setShowFinishModal(false)}
        onConfirm={handleFinishWork}
        plateId={plate.id}
      />

      {/* Admin Edit Modal */}
      {user.isAdmin && (
        <AdminEditModal
          plate={plate}
          isOpen={showAdminModal}
          onClose={() => setShowAdminModal(false)}
          onUpdate={onUpdate}
          user={user}
        />
      )}
    </>
  );
}