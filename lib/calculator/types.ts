export type ProjectType = 'landing' | 'basic' | 'standard' | 'eshop';
export type DesignStyle = 'minimal' | 'creative' | 'corporate' | 'undecided';
export type BrandingStatus = 'has-branding' | 'has-logo' | 'needs-everything';
export type Timeline = 'urgent' | 'normal' | 'relaxed' | 'flexible';

export interface CalculatorData {
  // Step 1
  projectType: ProjectType | '';
  // Step 2
  features: string[];
  // Step 3
  designStyle: DesignStyle | '';
  brandingStatus: BrandingStatus | '';
  timeline: Timeline | '';
  // Step 4
  email: string;
  name: string;
  phone: string;
  company: string;
  gdprConsent: boolean;
}

export interface PriceBreakdownItem {
  label: string;
  amount: number;
  type: 'base' | 'feature' | 'modifier';
}

export interface PriceResult {
  totalMin: number;
  totalMax: number;
  breakdown: PriceBreakdownItem[];
  estimatedDays: { min: number; max: number };
  recommendedPackage: string;
  includedFeatures: string[];
}

export const INITIAL_CALCULATOR_DATA: CalculatorData = {
  projectType: '',
  features: [],
  designStyle: '',
  brandingStatus: '',
  timeline: '',
  email: '',
  name: '',
  phone: '',
  company: '',
  gdprConsent: false,
};
