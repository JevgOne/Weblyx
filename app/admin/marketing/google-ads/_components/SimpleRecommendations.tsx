"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, CheckCircle, RefreshCw } from "lucide-react";

interface Recommendation {
  id: string;
  type: string;
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  reasoning: string;
  expectedImpact: string;
  effort: "low" | "medium" | "high";
  autoApplicable: boolean;
  data?: any;
}

const priorityStyles: Record<string, { badge: string; label: string }> = {
  critical: { badge: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300", label: "Kritické" },
  high: { badge: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300", label: "Důležité" },
  medium: { badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300", label: "Zvážit" },
  low: { badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300", label: "Tip" },
};

export default function SimpleRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  async function fetchRecommendations() {
    try {
      const res = await fetch("/api/google-marketing/recommendations");
      const json = await res.json();

      if (json.success && json.data) {
        setRecommendations(json.data.slice(0, 5)); // Show max 5
      }
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApply(rec: Recommendation) {
    setApplying(rec.id);
    try {
      const res = await fetch("/api/google-marketing/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rec.id, action: "approve" }),
      });
      const json = await res.json();

      if (json.success) {
        setRecommendations((prev) => prev.filter((r) => r.id !== rec.id));
      }
    } catch (err) {
      console.error("Failed to apply recommendation:", err);
    } finally {
      setApplying(null);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            AI Doporučení
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Načítám doporučení...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            AI Doporučení
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
            <p className="font-medium">Vše v pořádku!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Momentálně nemáme žádná doporučení. Vrátíme se, až budeme mít nové poznatky.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          AI Doporučení
          <Badge variant="secondary" className="ml-auto">{recommendations.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec) => {
          const pStyle = priorityStyles[rec.priority] || priorityStyles.medium;
          return (
            <div
              key={rec.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`text-xs ${pStyle.badge}`}>{pStyle.label}</Badge>
                  <span className="font-medium text-sm truncate">{rec.title}</span>
                </div>
                <p className="text-sm text-muted-foreground">{rec.description}</p>
              </div>
              {rec.autoApplicable && (
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                  disabled={applying === rec.id}
                  onClick={() => handleApply(rec)}
                >
                  {applying === rec.id ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    "Aplikovat"
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
