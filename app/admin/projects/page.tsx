"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Search, Plus, Calendar, DollarSign, User, UserCheck, UserX } from "lucide-react";

// Mock data
const mockProjects = [
  {
    id: "1",
    projectNumber: "WBX-2025-0001",
    name: "E-shop Outdoor",
    clientName: "Jan Novák",
    clientEmail: "jan@priklad.cz",
    projectType: "E-shop",
    status: "in_progress",
    priority: "high",
    deadline: "2025-02-15",
    priceTotal: 85000,
    pricePaid: 42500,
    progress: 65,
  },
  {
    id: "2",
    projectNumber: "WBX-2025-0002",
    name: "Web Fitness Studio",
    clientName: "Marie Svobodová",
    clientEmail: "marie@fitness.cz",
    projectType: "Web",
    status: "unpaid",
    priority: "medium",
    deadline: "2025-02-20",
    priceTotal: 45000,
    pricePaid: 0,
    progress: 0,
  },
  {
    id: "3",
    projectNumber: "WBX-2025-0003",
    name: "Landing SaaS",
    clientName: "Tomáš Dvořák",
    clientEmail: "tomas@startup.cz",
    projectType: "Landing page",
    status: "delivered",
    priority: "low",
    deadline: "2025-01-10",
    priceTotal: 15000,
    pricePaid: 15000,
    progress: 100,
  },
];

const statusConfig = {
  unpaid: { label: "Nezaplaceno", color: "bg-red-500" },
  awaiting_invoice: { label: "Čeká na fakturu", color: "bg-orange-500" },
  in_progress: { label: "Rozpracováno", color: "bg-blue-500" },
  delivered: { label: "Předáno", color: "bg-cyan-500" },
  warranty_ended: { label: "Záruka ukončena", color: "bg-gray-500" },
  cancelled: { label: "Zrušeno", color: "bg-gray-700" },
  paused: { label: "Pozastaveno", color: "bg-yellow-500" },
};

const priorityConfig = {
  high: { label: "Vysoká", color: "text-red-600" },
  medium: { label: "Střední", color: "text-yellow-600" },
  low: { label: "Nízká", color: "text-cyan-600" },
};

export default function AdminProjectsPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetch('/api/admin/projects');
        const result = await response.json();

        if (result.success) {
          setProjects(result.data);
          console.log("✅ Loaded projects from API:", result.data);
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error("❌ Error loading projects:", error);
        // Fallback to mock data
        setProjects(mockProjects);
      }
      setLoading(false);
    };

    loadProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.projectNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.clientName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  const handleAssignProject = async (projectId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/admin/projects/${projectId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: user.id, // Assign to current user
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Chyba při přiřazení projektu');
        return;
      }

      const result = await response.json();

      // Update local state
      setProjects(projects.map(p =>
        p.id === projectId
          ? { ...p, assignedTo: result.assignedTo }
          : p
      ));

      console.log('✅ Projekt přiřazen');
    } catch (error) {
      console.error('❌ Error assigning project:', error);
      alert('Chyba při přiřazení projektu');
    }
  };

  // Count unassigned projects
  const unassignedCount = projects.filter(p => !p.assignedTo).length;

  const handleUnassignProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/assign`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to unassign project');
      }

      // Update local state
      setProjects(projects.map(p =>
        p.id === projectId
          ? { ...p, assignedTo: null }
          : p
      ));

      console.log('✅ Projekt uvolněn');
    } catch (error) {
      console.error('❌ Error unassigning project:', error);
      alert('Chyba při uvolnění projektu');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/admin/dashboard")}
                className="shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold">Projekty</h1>
                  {unassignedCount > 0 && (
                    <Badge variant="destructive" className="animate-pulse">
                      🚨 {unassignedCount} nepřiřazeno
                    </Badge>
                  )}
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Správa všech projektů ({projects.length} celkem)
                </p>
              </div>
            </div>

            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Nový projekt
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4 mb-6">
          <Card className={unassignedCount > 0 ? "border-red-500 bg-red-50 dark:bg-red-950" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Nepřiřazené 🚨
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-xl md:text-2xl font-bold ${unassignedCount > 0 ? "text-red-600" : ""}`}>
                {unassignedCount}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Aktivní projekty
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">
                {projects.filter((p) => p.status === "in_progress").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Dokončené
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">
                {projects.filter((p) => p.status === "delivered").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Celková hodnota
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold">
                {projects.reduce((sum, p) => sum + (p.priceTotal || 0), 0).toLocaleString()} Kč
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Hledat podle názvu, čísla projektu, klienta..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Filtrovat podle stavu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny stavy</SelectItem>
                  <SelectItem value="unpaid">Nezaplacené</SelectItem>
                  <SelectItem value="in_progress">Rozpracované</SelectItem>
                  <SelectItem value="delivered">Předané</SelectItem>
                  <SelectItem value="warranty_ended">Záruka ukončena</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Projects Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Projekt</TableHead>
                <TableHead>Klient</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Stav</TableHead>
                <TableHead>Priorita</TableHead>
                <TableHead>Přiřazeno</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Skeleton loading rows
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell>
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-12 mb-1" />
                      <Skeleton className="h-2 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-16 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-12">
                    Žádné projekty nenalezeny
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((project) => (
                  <TableRow key={project.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {project.projectNumber}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-1 text-sm">
                          <User className="h-3 w-3 text-muted-foreground" />
                          {project.clientName}
                        </div>
                        <div className="text-xs text-muted-foreground">{project.clientEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{project.projectType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${
                          statusConfig[project.status as keyof typeof statusConfig].color
                        } text-white`}
                      >
                        {statusConfig[project.status as keyof typeof statusConfig].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-sm font-medium ${
                          priorityConfig[project.priority as keyof typeof priorityConfig].color
                        }`}
                      >
                        {priorityConfig[project.priority as keyof typeof priorityConfig].label}
                      </span>
                    </TableCell>
                    <TableCell>
                      {project.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <UserCheck className="h-3 w-3" />
                            <span className="hidden sm:inline">{project.assignedTo.name}</span>
                            <span className="sm:hidden">{project.assignedTo.name.slice(0, 1)}</span>
                          </Badge>
                          {user && project.assignedTo.id === user.id && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnassignProject(project.id);
                              }}
                              className="h-6 px-1 sm:px-2"
                            >
                              <UserX className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssignProject(project.id);
                          }}
                          className="gap-1 animate-pulse text-xs"
                        >
                          <UserCheck className="h-3 w-3" />
                          <span className="hidden sm:inline">Vzít</span>
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {new Date(project.deadline).toLocaleDateString("cs-CZ")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-xs font-medium">{project.progress}%</div>
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/admin/projects/${project.id}`)}
                      >
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Info note */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Toto jsou demo data. Po připojení Firebase se zde zobrazí
            reálné projekty z databáze.
          </p>
        </div>
      </main>
    </div>
  );
}
