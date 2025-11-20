export type ProjectStatus =
  | "unpaid"
  | "awaiting_invoice"
  | "in_progress"
  | "delivered"
  | "warranty_ended"
  | "cancelled"
  | "paused";

export type ProjectPriority = "high" | "medium" | "low";

export type ProjectType = "Web" | "E-shop" | "Landing page" | "App" | "Other";

export type HostingProvider = "Vercel" | "Netlify" | "Custom" | "Other";

export interface Project {
  id: string;
  projectNumber: string;
  name: string;

  // Client info
  clientName: string;
  clientEmail: string;
  clientPhone?: string;

  // Project details
  projectType: ProjectType;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number; // 0-100

  // Dates
  startDate?: string;
  deadline: string;
  completedAt?: string;

  // Financials
  priceTotal: number;
  pricePaid: number;
  currency: string;

  // Technical info
  productionUrl?: string;
  stagingUrl?: string;
  githubRepo?: string;
  hostingProvider?: HostingProvider;
  hostingInfo?: string;
  domainName?: string;
  domainRegistrar?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export const statusConfig = {
  unpaid: { label: "Nezaplaceno", color: "bg-red-500" },
  awaiting_invoice: { label: "Čeká na fakturu", color: "bg-orange-500" },
  in_progress: { label: "Rozpracováno", color: "bg-blue-500" },
  delivered: { label: "Předáno", color: "bg-cyan-500" },
  warranty_ended: { label: "Záruka ukončena", color: "bg-gray-500" },
  cancelled: { label: "Zrušeno", color: "bg-gray-700" },
  paused: { label: "Pozastaveno", color: "bg-yellow-500" },
};

export const priorityConfig = {
  high: { label: "Vysoká", color: "text-red-600" },
  medium: { label: "Střední", color: "text-yellow-600" },
  low: { label: "Nízká", color: "text-cyan-600" },
};
