export interface ExtractRecord {
  Lançamento: string;
  Data: string;
  Categoria: string;
  Tipo: string;
  Valor: string;
}

export interface FinancialReport {
  title: string;
  summary: string;
  insights: string[];
  recommendations: string[];
  conclusion: string;
}

export interface Recommendation {
  area: string;
  recommendation: string;
}
