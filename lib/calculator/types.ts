export type ProjectType = 'landing' | 'basic' | 'standard';

export type AddonService = 'seo' | 'lead-generation' | 'email-marketing' | 'ai-ads';

export interface CalculatorData {
  // Step 1
  projectType: ProjectType | '';
  // Step 2
  addons: AddonService[];
  // Step 3
  email: string;
  name: string;
  phone: string;
  company: string;
  gdprConsent: boolean;
}

export interface PackageResult {
  packageName: string;
  price: number;
  features: string[];
  deliveryDays: { min: number; max: number };
  addons: { id: AddonService; label: string }[];
}

export const INITIAL_CALCULATOR_DATA: CalculatorData = {
  projectType: '',
  addons: [],
  email: '',
  name: '',
  phone: '',
  company: '',
  gdprConsent: false,
};
