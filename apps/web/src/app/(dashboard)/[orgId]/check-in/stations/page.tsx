'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  MonitorSmartphone,
  Plus,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  MapPin,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface Station {
  id: string;
  name: string;
  location: string | null;
  deviceId: string | null;
  isActive: boolean;
  todayCount: number;
  lastActivity: string | null;
}

export default function StationsPage() {
  const params = useParams();
  const orgId = params['orgId'] as string;

  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newStation, setNewStation] = useState({
    name: '',
    location: '',
    deviceId: '',
  });

  // TODO: Fetch stations from API
  // useEffect(() => {
  //   fetchStations();
  // }, []);

  const handleCreateStation = async () => {
    // TODO: Implement create station API call
    setCreateDialogOpen(false);
    setNewStation({ name: '', location: '', deviceId: '' });
  };

  const handleToggleActive = async (stationId: string, isActive: boolean) => {
    // TODO: Implement toggle station active status
  };

  const handleDeleteStation = async (stationId: string) => {
    // TODO: Implement delete station
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Check-In Stations</h1>
          <p className="text-muted-foreground">
            Manage check-in stations and devices for your attractions.
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
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
                <Label htmlFor="name">Station Name</Label>
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
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateStation} disabled={!newStation.name}>
                Create Station
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MonitorSmartphone className="h-5 w-5" />
            Active Stations
          </CardTitle>
          <CardDescription>
            View and manage all check-in stations across your attractions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stations.length === 0 ? (
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
                      {station.todayCount}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Switch
                          checked={station.isActive}
                          onCheckedChange={(checked) =>
                            handleToggleActive(station.id, checked)
                          }
                        />
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteStation(station.id)}
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
    </div>
  );
}
