"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  writeBatch,
  query,
  orderBy,
} from "firebase/firestore";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
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
  ArrowLeft,
  Search,
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Image as ImageIcon,
} from "lucide-react";
import { PortfolioProject } from "@/types/portfolio";

export default function AdminPortfolioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [savingOrder, setSavingOrder] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/admin/login");
      } else {
        loadProjects();
      }
    });

    return () => unsubscribe();
  }, [router]);

  const loadProjects = async () => {
    try {
      const q = query(collection(db, "portfolio"), orderBy("order", "asc"));
      const querySnapshot = await getDocs(q);
      const projectsData: PortfolioProject[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        projectsData.push({
          id: doc.id,
          title: data.title || "",
          category: data.category || "",
          description: data.description || "",
          technologies: data.technologies || [],
          imageUrl: data.imageUrl || "",
          published: data.published || false,
          featured: data.featured || false,
          order: data.order || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });

      setProjects(projectsData);
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Opravdu chcete smazat tento projekt?")) return;

    try {
      await deleteDoc(doc(db, "portfolio", id));
      setProjects(projects.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Chyba při mazání projektu");
    }
  };

  const togglePublished = async (id: string, currentState: boolean) => {
    try {
      await updateDoc(doc(db, "portfolio", id), {
        published: !currentState,
        updatedAt: new Date(),
      });
      setProjects(
        projects.map((p) =>
          p.id === id ? { ...p, published: !currentState } : p
        )
      );
    } catch (error) {
      console.error("Error toggling published:", error);
      alert("Chyba při změně stavu publikace");
    }
  };

  const toggleFeatured = async (id: string, currentState: boolean) => {
    try {
      await updateDoc(doc(db, "portfolio", id), {
        featured: !currentState,
        updatedAt: new Date(),
      });
      setProjects(
        projects.map((p) =>
          p.id === id ? { ...p, featured: !currentState } : p
        )
      );
    } catch (error) {
      console.error("Error toggling featured:", error);
      alert("Chyba při změně featured stavu");
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(projects);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order property for all items
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setProjects(updatedItems);

    // Save new order to Firestore
    setSavingOrder(true);
    try {
      const batch = writeBatch(db);
      updatedItems.forEach((item) => {
        const docRef = doc(db, "portfolio", item.id);
        batch.update(docRef, { order: item.order, updatedAt: new Date() });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error saving order:", error);
      alert("Chyba při ukládání pořadí");
      loadProjects(); // Reload to restore original order
    } finally {
      setSavingOrder(false);
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.technologies.some((tech) =>
      tech.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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
                <h1 className="text-2xl font-bold">Portfolio</h1>
                <p className="text-sm text-muted-foreground">
                  Správa portfolia projektů
                </p>
              </div>
            </div>

            <Button
              className="gap-2"
              onClick={() => router.push("/admin/portfolio/new")}
            >
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
                Celkem projektů
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Publikované
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects.filter((p) => p.published).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Featured
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects.filter((p) => p.featured).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Koncepty
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects.filter((p) => !p.published).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Vyhledávání</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Hledat podle názvu, kategorie, technologií..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Projects Table with Drag and Drop */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Projekty</CardTitle>
              {savingOrder && (
                <Badge variant="outline" className="animate-pulse">
                  Ukládám pořadí...
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredProjects.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                {searchTerm ? "Žádné projekty nenalezeny" : "Zatím žádné projekty"}
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="portfolio-list">
                  {(provided) => (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]"></TableHead>
                          <TableHead className="w-[100px]">Obrázek</TableHead>
                          <TableHead>Název</TableHead>
                          <TableHead>Kategorie</TableHead>
                          <TableHead>Technologie</TableHead>
                          <TableHead className="text-center">Stav</TableHead>
                          <TableHead className="text-right">Akce</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                        {filteredProjects.map((project, index) => (
                          <Draggable
                            key={project.id}
                            draggableId={project.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <TableRow
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={
                                  snapshot.isDragging ? "bg-muted/50" : ""
                                }
                              >
                                <TableCell {...provided.dragHandleProps}>
                                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
                                </TableCell>
                                <TableCell>
                                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                                    {project.imageUrl ? (
                                      <img
                                        src={project.imageUrl}
                                        alt={project.title}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">{project.title}</div>
                                  <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                    {project.description}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">{project.category}</Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {project.technologies.slice(0, 3).map((tech, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {tech}
                                      </Badge>
                                    ))}
                                    {project.technologies.length > 3 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{project.technologies.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => togglePublished(project.id, project.published)}
                                      title={project.published ? "Skrýt" : "Publikovat"}
                                    >
                                      {project.published ? (
                                        <Eye className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleFeatured(project.id, project.featured)}
                                      title={project.featured ? "Odebrat z featured" : "Přidat do featured"}
                                    >
                                      {project.featured ? (
                                        <Star className="h-4 w-4 text-yellow-600 fill-yellow-600" />
                                      ) : (
                                        <StarOff className="h-4 w-4 text-muted-foreground" />
                                      )}
                                    </Button>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        router.push(`/admin/portfolio/${project.id}/edit`)
                                      }
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDelete(project.id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </TableBody>
                    </Table>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </CardContent>
        </Card>

        {/* Info note */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Tip:</strong> Použijte drag & drop pro změnu pořadí projektů.
            Klikněte na ikony oka a hvězdy pro rychlou změnu stavu publikace a featured.
          </p>
        </div>
      </main>
    </div>
  );
}
