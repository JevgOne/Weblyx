"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowLeft, Search, Filter, Mail, Phone, Building2, Calendar, ArrowRight } from "lucide-react";
import { ConvertLeadDialog } from "@/components/admin/ConvertLeadDialog";

// Mock data pro demo
const mockLeads = [
  {
    id: "1",
    name: "Jan Novák",
    email: "jan@priklad.cz",
    phone: "+420 777 888 999",
    company: "Stavební firma",
    projectType: "Web",
    status: "new",
    created: "2025-01-19",
    budget: "20 000 - 50 000 Kč"
  },
  {
    id: "2",
    name: "Marie Svobodová",
    email: "marie@fitness.cz",
    phone: "+420 666 555 444",
    company: "Fitness Studio",
    projectType: "Web + E-shop",
    status: "contacted",
    created: "2025-01-18",
    budget: "50 000 - 100 000 Kč"
  },
  {
    id: "3",
    name: "Tomáš Dvořák",
    email: "tomas@startup.cz",
    phone: null,
    company: "SaaS Startup",
    projectType: "Landing page",
    status: "quoted",
    created: "2025-01-17",
    budget: "10 000 - 20 000 Kč"
  },
];

const statusConfig = {
  new: { label: "Nová", color: "bg-red-500" },
  contacted: { label: "Kontaktován", color: "bg-blue-500" },
  quoted: { label: "Nabídka odeslána", color: "bg-yellow-500" },
  approved: { label: "Schváleno", color: "bg-cyan-500" },
  converted: { label: "Převedeno na projekt", color: "bg-green-500" },
  rejected: { label: "Zamítnuto", color: "bg-gray-500" },
  paused: { label: "Pozastaveno", color: "bg-orange-500" },
};

export default function AdminLeadsPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  useEffect(() => {
    const loadLeads = async () => {
      // Načíst leady z Firestore
      try {
        const leadsSnapshot = await db.collection("leads").get();
        const leadsData = leadsSnapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLeads(leadsData);
        console.log("✅ Loaded leads:", leadsData);
      } catch (error) {
        console.error("❌ Error loading leads:", error);
        // Fallback na mock data
        setLeads(mockLeads);
      }
      setLoading(false);
    };

    loadLeads();
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, statusFilter]);

  const handleConvertLead = (lead: any) => {
    setSelectedLead(lead);
    setConvertDialogOpen(true);
  };

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
                <h1 className="text-2xl font-bold">Poptávky (Leads)</h1>
                <p className="text-sm text-muted-foreground">
                  Správa poptávek od potenciálních klientů
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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
                    placeholder="Hledat podle jména, emailu, firmy..."
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
                  <SelectItem value="new">Nové</SelectItem>
                  <SelectItem value="contacted">Kontaktované</SelectItem>
                  <SelectItem value="quoted">Nabídka odeslána</SelectItem>
                  <SelectItem value="approved">Schváleno</SelectItem>
                  <SelectItem value="converted">Převedeno na projekt</SelectItem>
                  <SelectItem value="rejected">Zamítnuto</SelectItem>
                  <SelectItem value="paused">Pozastaveno</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Zobrazeno {filteredLeads.length} z {leads.length} poptávek
        </div>

        {/* Leads Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jméno / Firma</TableHead>
                <TableHead>Kontakt</TableHead>
                <TableHead>Typ projektu</TableHead>
                <TableHead>Rozpočet</TableHead>
                <TableHead>Stav</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead className="text-right">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                    Žádné poptávky nenalezeny
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => (
                  <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{lead.name}</div>
                        {lead.company && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Building2 className="h-3 w-3" />
                            {lead.company}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <a href={`mailto:${lead.email}`} className="hover:text-primary">
                            {lead.email}
                          </a>
                        </div>
                        {lead.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <a href={`tel:${lead.phone}`} className="hover:text-primary">
                              {lead.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{lead.projectType}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{lead.budget}</TableCell>
                    <TableCell>
                      <Badge
                        className={`${statusConfig[lead.status as keyof typeof statusConfig].color} text-white`}
                      >
                        {statusConfig[lead.status as keyof typeof statusConfig].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {new Date(lead.created).toLocaleDateString('cs-CZ')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost">
                          Detail
                        </Button>
                        {(lead.status === "approved" || lead.status === "quoted") && !lead.convertedToProjectId && (
                          <Button
                            size="sm"
                            onClick={() => handleConvertLead(lead)}
                            className="gap-1"
                          >
                            <ArrowRight className="h-3 w-3" />
                            Převést na projekt
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Conversion Dialog */}
        {selectedLead && (
          <ConvertLeadDialog
            open={convertDialogOpen}
            onOpenChange={setConvertDialogOpen}
            lead={selectedLead}
          />
        )}

        {/* Info note */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Toto jsou demo data. Po připojení Firebase se zde zobrazí
            reálné poptávky z kontaktního formuláře a dotazníku.
          </p>
        </div>
      </main>
    </div>
  );
}
