// src/services/feedbackService.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface FeedbackItem {
  id: string;
  category: string;
  summary: string;
  status: 'pending' | 'in-progress' | 'completed';
  urgency: 'low' | 'medium' | 'high';
  rootCause: string;
  fullText: string;
  fullCategory: string;
}

export interface FeedbackStats {
  total: number;
  categories: Record<string, number>;
  urgency: {
    high: number;
    medium: number;
    low: number;
  };
  status: {
    pending: number;
    'in-progress': number;
    completed: number;
  };
}

export interface AnalyzeResponse {
  success: boolean;
  data: {
    feedbacks: FeedbackItem[];
    stats: FeedbackStats;
  };
  error?: string;
}

export const feedbackService = {
  /**
   * Upload and analyze CSV file
   */
  async analyzeCSV(file: File): Promise<AnalyzeResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze-csv`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze CSV');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error analyzing CSV:', error);
      throw error;
    }
  },

  /**
   * Check API health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      const data = await response.json();
      return data.status === 'ok';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  },

  /**
   * Get keyword mappings
   */
  async getKeywords(): Promise<Record<string, string[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/keywords`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching keywords:', error);
      throw error;
    }
  },
};