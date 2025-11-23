"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Mail,
  MousePointerClick,
  Target,
} from "lucide-react";
import Link from "next/link";
import { LeadGenerationStats } from "@/types/lead-generation";

export default function StatsPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<LeadGenerationStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/lead-generation/stats');
        const data = await response.json();

        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (!user || loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-12 text-muted-foreground">
          <p>Nepodařilo se načíst statistiky</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/lead-generation">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zpt
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Statistiky Lead Generation</h1>
          <p className="text-muted-foreground">
            PYehled vkonnosti a metrik kampan
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Celkem leado</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              {stats.analyzedLeads} analyzovno
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Performance</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emailOpenRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalEmailsOpened} z {stats.totalEmailsSent} otevYench
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.linkClickRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalLinksClicked} kliknut
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.convertedLeads} konverz
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lead Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Leady podle statusu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Nov</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-500"
                    style={{
                      width: `${(stats.leadsByStatus.new / stats.totalLeads) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">
                  {stats.leadsByStatus.new}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Kontaktovn</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: `${(stats.leadsByStatus.contacted / stats.totalLeads) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">
                  {stats.leadsByStatus.contacted}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Zaujat</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500"
                    style={{
                      width: `${(stats.leadsByStatus.interested / stats.totalLeads) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">
                  {stats.leadsByStatus.interested}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Konvertovn</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{
                      width: `${(stats.leadsByStatus.converted / stats.totalLeads) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">
                  {stats.leadsByStatus.converted}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Odmtnut</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500"
                    style={{
                      width: `${(stats.leadsByStatus.rejected / stats.totalLeads) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">
                  {stats.leadsByStatus.rejected}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quality Scores */}
        <Card>
          <CardHeader>
            <CardTitle>Promrn skre</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Analza webo
                </span>
                <span className="text-sm font-medium">
                  {stats.averageAnalysisScore}/100
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${stats.averageAnalysisScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Lead skre
                </span>
                <span className="text-sm font-medium">
                  {stats.averageLeadScore}/100
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${stats.averageLeadScore}%` }}
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                m ni~a analza skre, tm vyaa potencil pro zlepaen a lead skre.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Kampan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Aktivn kampan</p>
              <p className="text-2xl font-bold">{stats.activeCampaigns}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dokonen kampan</p>
              <p className="text-2xl font-bold">{stats.completedCampaigns}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
