"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
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
} from "lucide-react";
import { Review } from "@/types/review";

export default function AdminReviewsPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [savingOrder, setSavingOrder] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const response = await fetch('/api/admin/reviews');
      const result = await response.json();

      if (result.success) {
        const reviewsData: Review[] = result.data.map((data: any) => ({
          id: data.id,
          authorName: data.authorName || "",
          authorImage: data.authorImage || "",
          authorRole: data.authorRole || "",
          rating: data.rating || 5,
          text: data.text || "",
          date: data.date ? new Date(data.date) : new Date(),
          source: data.source || "manual",
          sourceUrl: data.sourceUrl || "",
          published: data.published || false,
          featured: data.featured || false,
          order: data.order || 0,
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
        }));
        setReviews(reviewsData);
      } else {
        console.error("Failed to load reviews:", result.error);
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Opravdu chcete smazat tuto recenzi?")) return;

    try {
      const response = await fetch(`/api/admin/reviews?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.success) {
        setReviews(reviews.filter((r) => r.id !== id));
      } else {
        alert("Chyba při mazání recenze: " + result.error);
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Chyba při mazání recenze");
    }
  };

  const togglePublished = async (id: string, currentState: boolean) => {
    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          published: !currentState,
        }),
      });
      const result = await response.json();

      if (result.success) {
        setReviews(
          reviews.map((r) =>
            r.id === id ? { ...r, published: !currentState } : r
          )
        );
      } else {
        alert("Chyba při změně stavu publikace: " + result.error);
      }
    } catch (error) {
      console.error("Error toggling published:", error);
      alert("Chyba při změně stavu publikace");
    }
  };

  const toggleFeatured = async (id: string, currentState: boolean) => {
    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          featured: !currentState,
        }),
      });
      const result = await response.json();

      if (result.success) {
        setReviews(
          reviews.map((r) =>
            r.id === id ? { ...r, featured: !currentState } : r
          )
        );
      } else {
        alert("Chyba při změně featured stavu: " + result.error);
      }
    } catch (error) {
      console.error("Error toggling featured:", error);
      alert("Chyba při změně featured stavu");
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(reviews);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setReviews(updatedItems);

    setSavingOrder(true);
    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reorder',
          items: updatedItems.map(item => ({ id: item.id, order: item.order })),
        }),
      });
      const result = await response.json();

      if (!result.success) {
        alert("Chyba při ukládání pořadí: " + result.error);
        loadReviews();
      }
    } catch (error) {
      console.error("Error saving order:", error);
      alert("Chyba při ukládání pořadí");
      loadReviews();
    } finally {
      setSavingOrder(false);
    }
  };

  const filteredReviews = reviews.filter((review) =>
    review.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

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
                <h1 className="text-2xl font-bold">Recenze</h1>
                <p className="text-sm text-muted-foreground">
                  Správa zákaznických recenzí
                </p>
              </div>
            </div>

            <Button
              className="gap-2"
              onClick={() => router.push("/admin/reviews/new")}
            >
              <Plus className="h-4 w-4" />
              Nová recenze
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
                Celkem recenzí
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <div className="text-2xl font-bold">{reviews.length}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Publikované
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <div className="text-2xl font-bold">
                  {reviews.filter((r) => r.published).length}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Průměrné hodnocení
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <div className="text-2xl font-bold">
                  {reviews.length > 0
                    ? (
                        reviews.reduce((acc, r) => acc + r.rating, 0) /
                        reviews.length
                      ).toFixed(1)
                    : "0.0"}
                  <Star className="inline h-5 w-5 ml-1 fill-yellow-400 text-yellow-400" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Zvýrazněné
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <div className="text-2xl font-bold">
                  {reviews.filter((r) => r.featured).length}
                </div>
              )}
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
                placeholder="Hledat podle autora, textu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Reviews Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recenze</CardTitle>
              {savingOrder && (
                <Badge variant="outline" className="animate-pulse">
                  Ukládám pořadí...
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-5 w-5" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                {searchTerm ? "Žádné recenze nenalezeny" : "Zatím žádné recenze"}
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="reviews-list">
                  {(provided) => (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]"></TableHead>
                          <TableHead>Autor</TableHead>
                          <TableHead>Hodnocení</TableHead>
                          <TableHead>Text</TableHead>
                          <TableHead>Zdroj</TableHead>
                          <TableHead className="text-center">Stav</TableHead>
                          <TableHead className="text-right">Akce</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                        {filteredReviews.map((review, index) => (
                          <Draggable
                            key={review.id}
                            draggableId={review.id}
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
                                  <div>
                                    <div className="font-medium">{review.authorName}</div>
                                    {review.authorRole && (
                                      <div className="text-xs text-muted-foreground">
                                        {review.authorRole}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>{renderStars(review.rating)}</TableCell>
                                <TableCell>
                                  <div className="max-w-md truncate">{review.text}</div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={review.source === "manual" ? "secondary" : "default"}>
                                    {review.source === "Google" ? "Google" :
                                     review.source === "Firmy.cz" ? "Firmy.cz" :
                                     review.source === "Facebook" ? "Facebook" :
                                     review.source === "Seznam" ? "Seznam" : "Manuální"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => togglePublished(review.id, review.published)}
                                      title={review.published ? "Skrýt" : "Publikovat"}
                                    >
                                      {review.published ? (
                                        <Eye className="h-4 w-4 text-primary" />
                                      ) : (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleFeatured(review.id, review.featured)}
                                      title={review.featured ? "Odebrat z featured" : "Přidat do featured"}
                                    >
                                      {review.featured ? (
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
                                        router.push(`/admin/reviews/${review.id}/edit`)
                                      }
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDelete(review.id)}
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
            <strong>Tip:</strong> Použijte drag & drop pro změnu pořadí recenzí.
            Klikněte na ikony oka a hvězdy pro rychlou změnu stavu publikace a featured.
          </p>
        </div>
      </main>
    </div>
  );
}
