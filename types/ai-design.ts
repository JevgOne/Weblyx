export interface AIDesignSuggestion {
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    borders: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    accentFont?: string;
  };
  layoutSuggestions: {
    sections: Array<{
      name: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
    }>;
  };
  contentSuggestions: {
    headline: string;
    tagline: string;
    ctaPrimary: string;
    aboutSection: string;
  };
  styleGuidelines: {
    mood: string;
    imageStyle: string;
    uiElements: {
      roundedCorners: boolean;
      shadows: boolean;
      animations: boolean;
    };
  };
  technicalRecommendations: {
    recommendedFeatures: string[];
    thirdPartyTools: string[];
  };
  inspirationReferences: Array<{
    url: string;
    reason: string;
  }>;
  implementationNotes: {
    priorities: string[];
    niceToHave: string[];
    challenges: string[];
  };
}
