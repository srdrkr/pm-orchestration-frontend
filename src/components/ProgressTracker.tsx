import React from 'react';
import { Review } from '../types/api';
import { Clock, Edit, CheckCircle, XCircle, FileText } from 'lucide-react';

interface ProgressTrackerProps {
  review: Review;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ review }) => {
  const getStepStatus = (stepStatus: string, currentStatus: string) => {
    const statusOrder = ['pending', 'approved', 'created'];
    const rejectedFlow = currentStatus === 'rejected';
    
    if (rejectedFlow && stepStatus !== 'rejected') {
      return 'skipped';
    }
    
    if (stepStatus === 'rejected' && currentStatus === 'rejected') {
      return 'active';
    }
    
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getStepIcon = (stepStatus: string, status: 'completed' | 'active' | 'pending' | 'skipped') => {
    if (status === 'skipped') {
      return <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-gray-300"></div>;
    }
    
    switch (stepStatus) {
      case 'pending':
        return (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            status === 'completed' ? 'bg-green-500' : 
            status === 'active' ? 'bg-yellow-500' : 'bg-gray-200'
          }`}>
            {status === 'completed' ? (
              <CheckCircle className="w-5 h-5 text-white" />
            ) : (
              <Clock className={`w-5 h-5 ${status === 'active' ? 'text-white' : 'text-gray-500'}`} />
            )}
          </div>
        );
      case 'approved':
        return (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            status === 'completed' ? 'bg-green-500' : 
            status === 'active' ? 'bg-blue-500' : 'bg-gray-200'
          }`}>
            {status === 'completed' ? (
              <CheckCircle className="w-5 h-5 text-white" />
            ) : (
              <Edit className={`w-5 h-5 ${status === 'active' ? 'text-white' : 'text-gray-500'}`} />
            )}
          </div>
        );
      case 'created':
        return (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            status === 'completed' ? 'bg-green-500' : 
            status === 'active' ? 'bg-green-500' : 'bg-gray-200'
          }`}>
            <FileText className={`w-5 h-5 ${status === 'active' || status === 'completed' ? 'text-white' : 'text-gray-500'}`} />
          </div>
        );
      case 'rejected':
        return (
          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-white" />
          </div>
        );
      default:
        return <div className="w-8 h-8 rounded-full bg-gray-200"></div>;
    }
  };

  // Removed unused getStepLine function

  const steps = [
    {
      status: 'pending',
      title: 'Pending Review',
      description: 'Generated content awaiting review'
    },
    {
      status: 'approved',
      title: 'Review Complete',
      description: 'Content reviewed and approved'
    },
    {
      status: 'created',
      title: 'Jira Tickets Created',
      description: 'Tickets successfully created in Jira'
    }
  ];

  const rejectedStep = {
    status: 'rejected',
    title: 'Rejected',
    description: 'Content rejected and workflow stopped'
  };

  const isRejected = review.status === 'rejected';
  const displaySteps = isRejected ? [steps[0], rejectedStep] : steps;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Workflow Progress</h3>
      
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-4 left-4 right-4 h-1 bg-gray-200">
          {displaySteps.map((step, index) => {
            if (index === displaySteps.length - 1) return null;
            const status = getStepStatus(step.status, review.status);
            return (
              <div
                key={index}
                className={`absolute h-1 ${
                  status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                }`}
                style={{
                  left: `${(index / (displaySteps.length - 1)) * 100}%`,
                  width: `${100 / (displaySteps.length - 1)}%`
                }}
              />
            );
          })}
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {displaySteps.map((step, index) => {
            const status = getStepStatus(step.status, review.status);
            
            return (
              <div key={step.status} className="flex flex-col items-center">
                {getStepIcon(step.status, status)}
                <div className="mt-3 text-center">
                  <div className={`text-sm font-medium ${
                    status === 'completed' ? 'text-green-700' :
                    status === 'active' ? 'text-blue-700' :
                    status === 'skipped' ? 'text-gray-400' :
                    'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                  <div className={`text-xs mt-1 ${
                    status === 'completed' ? 'text-green-600' :
                    status === 'active' ? 'text-blue-600' :
                    status === 'skipped' ? 'text-gray-400' :
                    'text-gray-400'
                  }`}>
                    {step.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Details */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="font-medium text-gray-700">Current Status:</span>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
              review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              review.status === 'approved' ? 'bg-blue-100 text-blue-800' :
              review.status === 'rejected' ? 'bg-red-100 text-red-800' :
              review.status === 'created' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
            </span>
          </div>
          <div className="text-gray-500">
            Created: {new Date(review.created_at).toLocaleDateString()}
          </div>
        </div>
        
        {review.reviewed_at && (
          <div className="mt-2 text-sm text-gray-500">
            Last updated: {new Date(review.reviewed_at).toLocaleString()}
          </div>
        )}
        
        {review.jira_tickets && (
          <div className="mt-2 text-sm">
            <span className="font-medium text-gray-700">Jira Tickets:</span>
            <span className="ml-2 text-green-600">{review.jira_tickets}</span>
          </div>
        )}
        
        {review.source && (
          <div className="mt-2 text-sm">
            <span className="font-medium text-gray-700">Source:</span>
            <span className="ml-2 text-gray-600">
              {review.source === 'webhook' ? 'n8n Pipeline' : 'Manual Generation'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressTracker;