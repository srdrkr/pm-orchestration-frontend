import axios from 'axios';
import { Review, ApiResponse, HealthCheck, ApprovalResult } from '../types/api';

class ApiClient {
  private client: any;
  private readonly baseURL: string;
  private readonly apiKey: string;

  constructor() {
    // Always use production API URL for now to avoid CORS issues
    this.baseURL = process.env.REACT_APP_API_URL || 'https://pm-orchestration-engine.vercel.app';
    this.apiKey = process.env.REACT_APP_API_KEY || 'poe_api_2025_e84b49245f7da5ba01bdd679d7e40d1e475ddafdf972788994b0e8dfc5b76302';
    
    console.log('API Client Config:', { 
      baseURL: this.baseURL, 
      hasApiKey: !!this.apiKey,
      apiKeyPrefix: this.apiKey?.substring(0, 20) + '...',
      environment: process.env.NODE_ENV
    });
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'X-API-Key': this.apiKey
      },
      // Add CORS handling
      withCredentials: false
    });

    // Add request interceptor for debugging
    this.client.interceptors.request.use(
      (config: any) => {
        console.log('Making API request:', config.method?.toUpperCase(), config.url);
        return config;
      },
      (error: any) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response: any) => {
        console.log('API response received:', response.status, response.config.url);
        return response;
      },
      (error: any) => {
        console.error('API Error Details:', {
          message: error.message,
          code: error.code,
          response: error.response?.data,
          status: error.response?.status,
          url: error.config?.url
        });
        
        // Provide more user-friendly error messages
        if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
          throw new Error('Unable to connect to API. Please check your internet connection and try again.');
        } else if (error.response?.status === 404) {
          throw new Error('API endpoint not found. Please check the API configuration.');
        } else if (error.response?.status === 401 || error.response?.status === 403) {
          console.error('Authentication failed. Headers sent:', error.config?.headers);
          throw new Error(`API authentication failed: ${error.response?.data?.error || 'Invalid credentials'}`);
        } else {
          throw new Error(error.response?.data?.error || error.message || 'Unknown API error');
        }
      }
    );
  }

  // Health check
  async healthCheck(): Promise<HealthCheck> {
    const response = await this.client.get('/health');
    return response.data;
  }

  // Get all pending reviews
  async getReviews(): Promise<Review[]> {
    const response = await this.client.get('/api/reviews');
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch reviews');
    }
    return response.data.data || [];
  }

  // Get specific review by ID
  async getReview(id: string): Promise<Review> {
    const response = await this.client.get(`/api/reviews/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch review');
    }
    return response.data.data!;
  }

  // Update review content
  async updateReview(id: string, editedJson: string): Promise<Review> {
    const response = await this.client.put(`/api/reviews/${id}`, {
      edited_json: editedJson
    });
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to update review');
    }
    return response.data.data!;
  }

  // Approve review and create Jira tickets
  async approveReview(id: string): Promise<ApprovalResult> {
    const response = await this.client.post(`/api/reviews/${id}/approve`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to approve review');
    }
    return response.data.data!;
  }

  // Reject review
  async rejectReview(id: string, reason?: string): Promise<Review> {
    const response = await this.client.post(`/api/reviews/${id}/reject`, {
      reason
    });
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to reject review');
    }
    return response.data.data!;
  }

  // Manual generation (reactive mode)
  async generateContent(content: string, additionalContext?: string): Promise<{ id: string }> {
    const response = await this.client.post('/api/generate', {
      content,
      additional_context: additionalContext
    });
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to generate content');
    }
    return response.data.data!;
  }
}

export const apiClient = new ApiClient();
export default ApiClient;