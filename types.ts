
export interface ProjectInput {
  projectName: string;
  description: string;
  teamSize: number | string;
  hourlyRate: number | string; // Costo promedio por hora hombre
  serverCost: number | string; // Costo estimado de infraestructura mensual
  projectType: string; // e.g., "E-commerce", "SaaS", "Mobile App"
  hoursPerDay: number | string;
  estimatedWeeks: number | string;
  targetCost: number | string; // Optional manual override
}

export interface UploadedFile {
  name: string;
  type: string;
  data: string; // Base64 string
}

export interface QuoteBreakdownItem {
  category: string;
  cost: number;
  description: string;
}

export interface MarketComparison {
  lowEstimate: number;
  highEstimate: number;
  averageDays: number;
  marketTrend: string;
}

export interface QuoteResponse {
  projectTitle: string;
  executiveSummary: string;
  totalEstimatedCost: number;
  mvpCost: number; // Minimum Viable Project
  infrastructureCriticalCost: number;
  breakdown: QuoteBreakdownItem[];
  marketComparison: MarketComparison;
  technicalRecommendations: string[];
  clientEmailDraft: string;
}

declare global {
  interface Window {
    html2pdf: any;
  }
}