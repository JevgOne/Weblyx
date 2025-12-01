/**
 * Icon mapping for dynamic icon loading
 * Only imports icons that are actually used to reduce bundle size
 */

import {
  // Common icons
  HelpCircle,

  // Process & workflow
  Lightbulb,
  Search,
  Pencil,
  Code,
  Rocket,
  CheckCircle,
  Settings,
  Target,
  Zap,

  // CTA & benefits
  Clock,
  Award,
  Shield,
  TrendingUp,
  Star,
  Users,

  // Features
  Sparkles,
  Briefcase,
  Globe,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

// Icon mapping object
export const iconMap: Record<string, LucideIcon> = {
  // Common
  HelpCircle,

  // Process & workflow
  Lightbulb,
  Search,
  Pencil,
  Code,
  Rocket,
  CheckCircle,
  Settings,
  Target,
  Zap,

  // CTA & benefits
  Clock,
  Award,
  Shield,
  TrendingUp,
  Star,
  Users,

  // Features
  Sparkles,
  Briefcase,
  Globe,
  Mail,
  Phone,
  MapPin,
};

/**
 * Get icon component by name
 * Returns HelpCircle if icon not found
 */
export function getIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || HelpCircle;
}
