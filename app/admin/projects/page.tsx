"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { ArrowLeft, Search, Plus, Calendar, DollarSign, User } from "lucide-react";

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
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState(mockProjects);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/admin/login");
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.projectNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.clientName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/admin/dashboard")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Projekty</h1>
                <p className="text-sm text-muted-foreground">
                  Správa všech projektů a jejich stavu
                </p>
              </div>
            </div>

            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nový projekt
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aktivní projekty
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects.filter((p) => p.status === "in_progress").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Nezaplacené
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects.filter((p) => p.status === "unpaid").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Dokončené
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects.filter((p) => p.status === "delivered").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Celková hodnota
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects.reduce((sum, p) => sum + p.priceTotal, 0).toLocaleString()} Kč
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
                <TableHead>Deadline</TableHead>
                <TableHead>Cena / Zaplaceno</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.length === 0 ? (
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
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {new Date(project.deadline).toLocaleDateString("cs-CZ")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          {project.priceTotal.toLocaleString()} Kč
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Zaplaceno: {project.pricePaid.toLocaleString()} Kč
                        </div>
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
