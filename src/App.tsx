import React, { useState, useEffect } from 'react';
import { Review, HealthCheck } from './types/api';
import { apiClient } from './services/apiClient';
import ReviewDashboard from './components/ReviewDashboard';
import TicketEditor from './components/TicketEditor';
import ProgressTracker from './components/ProgressTracker';
import { Cog, RefreshCw, AlertCircle } from 'lucide-react';

function App() {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthCheck | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const health = await apiClient.healthCheck();
      setHealthStatus(health);
      setHealthError(null);
    } catch (err) {
      setHealthError(err instanceof Error ? err.message : 'Health check failed');
    }
  };

  const handleSelectReview = async (review: Review) => {
    try {
      // Fetch full review details including generated_json
      const fullReview = await apiClient.getReview(review.id);
      setSelectedReview(fullReview);
    } catch (error) {
      console.error('Failed to fetch full review details:', error);
      // Fallback to the preview data if fetch fails
      setSelectedReview(review);
    }
  };

  const handleBackToDashboard = () => {
    setSelectedReview(null);
  };

  const handleReviewUpdate = (updatedReview: Review) => {
    setSelectedReview(updatedReview);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Cog className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                PM Orchestration Engine
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Health Status */}
              <div className="flex items-center space-x-2">
                {healthStatus ? (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">API Connected</span>
                  </div>
                ) : healthError ? (
                  <div className="flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600">API Error</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
                    <span className="text-sm text-gray-400">Checking...</span>
                  </div>
                )}
                
                <button
                  onClick={checkHealth}
                  className="text-gray-400 hover:text-gray-600"
                  title="Refresh health status"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {healthError && (
          <div className="mb-6 bg-red-50 border border-red-300 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">
                API Connection Error: {healthError}
              </span>
            </div>
            <p className="text-red-600 text-sm mt-1">
              Please check if the backend API is running and accessible.
            </p>
          </div>
        )}

        {selectedReview ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Editor - 2/3 width */}
            <div className="lg:col-span-2">
              <TicketEditor
                review={selectedReview}
                onBack={handleBackToDashboard}
                onSave={handleReviewUpdate}
              />
            </div>
            
            {/* Progress Tracker - 1/3 width */}
            <div className="lg:col-span-1">
              <ProgressTracker review={selectedReview} />
            </div>
          </div>
        ) : (
          <ReviewDashboard onSelectReview={handleSelectReview} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div>
              PM Orchestration Engine v1.0.1 - Meeting Notes → n8n AI Processing → React Review → Jira Creation
            </div>
            {healthStatus && (
              <div>
                Last API Check: {new Date(healthStatus.timestamp).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
