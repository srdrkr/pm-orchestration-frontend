import React, { useState, useEffect } from 'react';
import { Review } from '../types/api';
import { apiClient } from '../services/apiClient';
import { Clock, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ReviewDashboardProps {
  onSelectReview: (review: Review) => void;
}

const ReviewDashboard: React.FC<ReviewDashboardProps> = ({ onSelectReview }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getReviews();
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'created':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'created':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getContentPreview = (review: Review, maxLength: number = 150) => {
    // Try to show generated content summary first
    if (review.preview?.summary) {
      const content = review.preview.summary;
      return content.length <= maxLength ? content : content.substring(0, maxLength) + '...';
    }
    
    // Try to extract initiative summary from generated content
    try {
      const generated = review.edited_json || review.generated_json;
      let parsedContent;
      
      if (typeof generated === 'string') {
        parsedContent = JSON.parse(generated);
      } else if (typeof generated === 'object' && generated !== null) {
        parsedContent = generated;
      }
      
      if (parsedContent) {
        // Handle both direct initiative format and data array format
        const initiative = parsedContent.initiative || parsedContent.data?.[0]?.initiative;
        if (initiative?.summary) {
          const content = initiative.summary;
          return content.length <= maxLength ? content : content.substring(0, maxLength) + '...';
        }
      }
    } catch (err) {
      // Fall through to input content
    }
    
    // Fall back to input content
    if (review.input_content) {
      const content = review.input_content;
      return content.length <= maxLength ? content : content.substring(0, maxLength) + '...';
    }
    
    return 'No content available';
  };

  const getContentStats = (review: Review) => {
    if (review.preview) {
      return `${review.preview.initiative_count || 0} initiatives, ${review.preview.epic_count || 0} epics, ${review.preview.story_count || 0} stories`;
    }
    
    try {
      const generated = review.edited_json || review.generated_json;
      let parsedContent;
      
      if (typeof generated === 'string') {
        parsedContent = JSON.parse(generated);
      } else if (typeof generated === 'object' && generated !== null) {
        parsedContent = generated;
      }
      
      if (parsedContent) {
        const initiative = parsedContent.initiative || parsedContent.data?.[0]?.initiative;
        if (initiative) {
          const epicCount = initiative.epics?.length || 0;
          const storyCount = initiative.epics?.reduce((total: number, epic: any) => 
            total + (epic.stories?.length || 0), 0) || 0;
          return `1 initiative, ${epicCount} epics, ${storyCount} stories`;
        }
      }
    } catch (err) {
      // Return empty string if parsing fails
    }
    
    return '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading reviews...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-300 rounded-lg p-4">
        <div className="flex items-center">
          <XCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">Error: {error}</span>
        </div>
        <button
          onClick={loadReviews}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
        <p className="text-gray-500">
          Reviews will appear here when generated through the n8n pipeline.
        </p>
        <button
          onClick={loadReviews}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Review Dashboard</h2>
        <button
          onClick={loadReviews}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center disabled:opacity-50"
        >
          <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="grid gap-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onSelectReview(review)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(review.status)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(review.status)}`}>
                  {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                </span>
                <span className="text-sm text-gray-500">
                  {review.source === 'webhook' ? 'n8n Pipeline' : 'Manual'}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {review.created_at ? formatDate(review.created_at) : 'Unknown date'}
              </span>
            </div>

            <div className="mb-3">
              <p className="text-gray-700 text-sm font-medium mb-1">
                {getContentPreview(review)}
              </p>
              {getContentStats(review) && (
                <p className="text-gray-500 text-xs">
                  {getContentStats(review)}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Type: {review.type || 'Unknown'}</span>
              <span>ID: {review.id ? review.id.slice(0, 8) + '...' : 'No ID'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewDashboard;