export interface AnalysisResult {
    grammarErrors: Array<{
      message: string;
      offset: number;
      length: number;
    }>;
    tone: string;
    suggestions: string[];
  }