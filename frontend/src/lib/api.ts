import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { 
  AnalysisRequest, 
  AnalysisResponse, 
  PromptTemplate, 
  ApiResponse 
} from '@/types';

// This is the key fix. It reads the environment variable for production,
// but provides a safe fallback for local development.
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance with the correct base URL
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: baseURL, // Use the variable here
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // Add any auth headers here if needed
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      // Handle common errors
      if (error.response?.status === 401) {
        // Handle unauthorized access
        console.error('Unauthorized access');
      } else if (error.response?.status === 500) {
        // Handle server errors
        console.error('Server error occurred');
      } else if (error.code === 'ECONNABORTED') {
        // Handle timeout
        console.error('Request timeout');
      }
      
      return Promise.reject(error);
    }
  );

  return client;
};

export const apiClient = createApiClient();

// API endpoint functions
export const analysisApi = {
  // Submit new analysis
  submit: async (data: AnalysisRequest): Promise<AnalysisResponse> => {
    try {
      const response = await apiClient.post('/analyze', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to submit analysis');
    }
  },

  // Get analysis by ID
  getById: async (id: string): Promise<AnalysisResponse> => {
    try {
      const response = await apiClient.get(`/analyze/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to fetch analysis');
    }
  },

  // Get analysis status
  getStatus: async (id: string): Promise<{ status: string; progress?: number }> => {
    try {
      const response = await apiClient.get(`/analyze/${id}/status`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to fetch analysis status');
    }
  },

  // Cancel analysis
  cancel: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/analyze/${id}`);
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to cancel analysis');
    }
  },

  // Get user's analysis history
  getHistory: async (page = 1, limit = 10): Promise<{ analyses: AnalysisResponse[]; total: number }> => {
    try {
      const response = await apiClient.get('/analyze', {
        params: { page, limit }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to fetch analysis history');
    }
  }
};

export const promptApi = {
  // Get all prompt templates
  getAll: async (): Promise<PromptTemplate[]> => {
    try {
      const response = await apiClient.get('/prompts');
      return response.data.prompts || [];
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to fetch prompt templates');
    }
  },

  // Get prompt template by ID
  getById: async (id: string): Promise<PromptTemplate> => {
    try {
      const response = await apiClient.get(`/prompts/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to fetch prompt template');
    }
  }
};

export const reportApi = {
  // Generate PDF report
  generatePdf: async (analysisId: string): Promise<Blob> => {
    const response = await apiClient.get(`/reports/${analysisId}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Get report URL
  getPdfUrl: (analysisId: string): string => {
    return `${apiClient.defaults.baseURL}/reports/${analysisId}/pdf`;
  }
};

// Utility functions for error handling
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.response?.status === 404) {
      return 'Resource not found';
    }
    if (error.response?.status === 500) {
      return 'Server error occurred. Please try again later.';
    }
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout. Please check your connection and try again.';
    }
    if (error.message) {
      return error.message;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// Health check function
export const healthCheck = async (): Promise<boolean> => {
  try {
    await apiClient.get('/health');
    return true;
  } catch {
    return false;
  }
};