'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
  MonitorSmartphone,
  Plus,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  MapPin,
  Loader2,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  getAttractions,
  listStations,
  createStation,
  updateStation,
  deleteStation,
} from '@/lib/api/client';
import type { AttractionListItem, CheckInStation, CreateStationRequest } from '@/lib/api/types';

function StationsPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const orgId = params['orgId'] as string;

  // Get attractionId from URL or localStorage
  const urlAttractionId = searchParams.get('attractionId');

  const [attractions, setAttractions] = useState<AttractionListItem[]>([]);
  const [selectedAttractionId, setSelectedAttractionId] = useState<string | null>(null);
  const [stations, setStations] = useState<CheckInStation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStations, setIsLoadingStations] = useState(false);

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newStation, setNewStation] = useState<CreateStationRequest>({
    name: '',
    location: '',
    deviceId: '',
  });

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingStation, setEditingStation] = useState<CheckInStation | null>(null);
  const [editForm, setEditForm] = useState<CreateStationRequest>({
    name: '',
    location: '',
    deviceId: '',
  });

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stationToDelete, setStationToDelete] = useState<CheckInStation | null>(null);

  // Load attractions on mount
  useEffect(() => {
    async function loadAttractions() {
      try {
        const result = await getAttractions(orgId);
        if (result.data?.data) {
          setAttractions(result.data.data);
          // Determine initial attraction
          const savedAttractionId = localStorage.getItem(`check-in-attraction-${orgId}`);
          const targetId = urlAttractionId || savedAttractionId;
          const defaultAttraction =
            result.data.data.find((a) => a.id === targetId) || result.data.data[0];
          if (defaultAttraction) {
            setSelectedAttractionId(defaultAttraction.id);
          }
        }
      } catch (error) {
        console.error('Failed to load attractions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load attractions',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadAttractions();
  }, [orgId, urlAttractionId, toast]);

  // Load stations when attraction changes
  useEffect(() => {
    if (!selectedAttractionId) return;

    localStorage.setItem(`check-in-attraction-${orgId}`, selectedAttractionId);

    async function loadStations() {
      setIsLoadingStations(true);
      try {
        const result = await listStations(orgId, selectedAttractionId!);
        if (result.data?.stations) {
          setStations(result.data.stations);
        }
      } catch (error) {
        console.error('Failed to load stations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load stations',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingStations(false);
      }
    }
    loadStations();
  }, [orgId, selectedAttractionId, toast]);

  const handleAttractionChange = (attractionId: string) => {
    setSelectedAttractionId(attractionId);
  };

  const handleCreateStation = async () => {
    if (!selectedAttractionId || !newStation.name) return;

    setIsCreating(true);
    try {
      const result = await createStation(orgId, selectedAttractionId, {
        name: newStation.name,
        location: newStation.location || undefined,
        deviceId: newStation.deviceId || undefined,
      });

      if (result.data) {
        toast({
          title: 'Station Created',
          description: `${newStation.name} has been created.`,
        });
        // Refresh stations list
        const stationsResult = await listStations(orgId, selectedAttractionId);
        if (stationsResult.data?.stations) {
          setStations(stationsResult.data.stations);
        }
        setCreateDialogOpen(false);
        setNewStation({ name: '', location: '', deviceId: '' });
      }
    } catch (error) {
      console.error('Failed to create station:', error);
      toast({
        title: 'Error',
        description: 'Failed to create station',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditClick = (station: CheckInStation) => {
    setEditingStation(station);
    setEditForm({
      name: station.name,
      location: station.location || '',
      deviceId: station.deviceId || '',
    });
    setEditDialogOpen(true);
  };

  const handleUpdateStation = async () => {
    if (!selectedAttractionId || !editingStation || !editForm.name) return;

    setIsUpdating(true);
    try {
      const result = await updateStation(orgId, selectedAttractionId, editingStation.id, {
        name: editForm.name,
        location: editForm.location || undefined,
        deviceId: editForm.deviceId || undefined,
      });

      if (result.data) {
        toast({
          title: 'Station Updated',
          description: `${editForm.name} has been updated.`,
        });
        // Refresh stations list
        const stationsResult = await listStations(orgId, selectedAttractionId);
        if (stationsResult.data?.stations) {
          setStations(stationsResult.data.stations);
        }
        setEditDialogOpen(false);
        setEditingStation(null);
      }
    } catch (error) {
      console.error('Failed to update station:', error);
      toast({
        title: 'Error',
        description: 'Failed to update station',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleActive = async (station: CheckInStation) => {
    if (!selectedAttractionId) return;

    try {
      await updateStation(orgId, selectedAttractionId, station.id, {
        isActive: !station.isActive,
      });

      // Update local state
      setStations((prev) =>
        prev.map((s) =>
          s.id === station.id ? { ...s, isActive: !s.isActive } : s
        )
      );

      toast({
        title: station.isActive ? 'Station Deactivated' : 'Station Activated',
        description: `${station.name} is now ${station.isActive ? 'inactive' : 'active'}.`,
      });
    } catch (error) {
      console.error('Failed to toggle station:', error);
      toast({
        title: 'Error',
        description: 'Failed to update station status',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (station: CheckInStation) => {
    setStationToDelete(station);
    setDeleteDialogOpen(true);
  };

  const handleDeleteStation = async () => {
    if (!selectedAttractionId || !stationToDelete) return;

    setIsDeleting(true);
    try {
      await deleteStation(orgId, selectedAttractionId, stationToDelete.id);

      toast({
        title: 'Station Deleted',
        description: `${stationToDelete.name} has been deleted.`,
      });

      // Remove from local state
      setStations((prev) => prev.filter((s) => s.id !== stationToDelete.id));
      setDeleteDialogOpen(false);
      setStationToDelete(null);
    } catch (error) {
      console.error('Failed to delete station:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete station',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (attractions.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Check-In Stations</h1>
          <p className="text-muted-foreground">
            Manage check-in stations and devices for your attractions.
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Attractions Found</h3>
            <p className="text-muted-foreground text-center">
              Create an attraction first to manage check-in stations.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Check-In Stations</h1>
          <p className="text-muted-foreground">
            Manage check-in stations and devices for your attractions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={selectedAttractionId ?? ''}
            onValueChange={handleAttractionChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select attraction" />
            </SelectTrigger>
            <SelectContent>
              {attractions.map((attraction) => (
                <SelectItem key={attraction.id} value={attraction.id}>
                  {attraction.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedAttractionId}>
                <Plus className="h-4 w-4 mr-2" />
                Add Station
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Check-In Station</DialogTitle>
                <DialogDescription>
                  Add a new check-in station for scanning tickets.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Station Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Main Entrance"
                    value={newStation.name}
                    onChange={(e) =>
                      setNewStation({ ...newStation, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location (optional)</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Front Gate"
                    value={newStation.location}
                    onChange={(e) =>
                      setNewStation({ ...newStation, location: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="deviceId">Device ID (optional)</Label>
                  <Input
                    id="deviceId"
                    placeholder="e.g., SCANNER-001"
                    value={newStation.deviceId}
                    onChange={(e) =>
                      setNewStation({ ...newStation, deviceId: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateStation}
                  disabled={!newStation.name || isCreating}
                >
                  {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Station
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MonitorSmartphone className="h-5 w-5" />
            Active Stations
          </CardTitle>
          <CardDescription>
            View and manage all check-in stations for this attraction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingStations ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : stations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MonitorSmartphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No stations configured</p>
              <p className="text-sm">
                Add a check-in station to start scanning tickets.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Station</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Device ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Today&apos;s Count</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stations.map((station) => (
                  <TableRow key={station.id}>
                    <TableCell className="font-medium">{station.name}</TableCell>
                    <TableCell>
                      {station.location ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {station.location}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {station.deviceId || '--'}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={station.isActive ? 'default' : 'secondary'}
                        className="gap-1"
                      >
                        {station.isActive ? (
                          <>
                            <Power className="h-3 w-3" /> Active
                          </>
                        ) : (
                          <>
                            <PowerOff className="h-3 w-3" /> Inactive
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {station.todayCount ?? 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Switch
                          checked={station.isActive}
                          onCheckedChange={() => handleToggleActive(station)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(station)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(station)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Station</DialogTitle>
            <DialogDescription>
              Update the station details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Station Name *</Label>
              <Input
                id="edit-name"
                placeholder="e.g., Main Entrance"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-location">Location (optional)</Label>
              <Input
                id="edit-location"
                placeholder="e.g., Front Gate"
                value={editForm.location}
                onChange={(e) =>
                  setEditForm({ ...editForm, location: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-deviceId">Device ID (optional)</Label>
              <Input
                id="edit-deviceId"
                placeholder="e.g., SCANNER-001"
                value={editForm.deviceId}
                onChange={(e) =>
                  setEditForm({ ...editForm, deviceId: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStation}
              disabled={!editForm.name || isUpdating}
            >
              {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Station
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{stationToDelete?.name}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStation}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function StationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <StationsPageContent />
    </Suspense>
  );
}
