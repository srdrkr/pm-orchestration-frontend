import React, { useState, useEffect } from 'react';
import { Review, GeneratedContent } from '../types/api';
import { apiClient } from '../services/apiClient';
import { Save, Eye, Code, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

interface TicketEditorProps {
  review: Review;
  onBack: () => void;
  onSave: (updatedReview: Review) => void;
}

const TicketEditor: React.FC<TicketEditorProps> = ({ review, onBack, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedJson, setEditedJson] = useState('');
  const [parsedContent, setParsedContent] = useState<GeneratedContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const content = review.edited_json || review.generated_json;
      
      // Handle both object (from API) and string (from editing) formats
      if (typeof content === 'string') {
        setEditedJson(content);
        const parsed = JSON.parse(content);
        setParsedContent(parsed);
      } else if (typeof content === 'object' && content !== null) {
        // Content is already an object, stringify it for editing
        const stringified = JSON.stringify(content, null, 2);
        setEditedJson(stringified);
        setParsedContent(content);
      } else {
        throw new Error('Invalid content format');
      }
    } catch (err) {
      setError(`Invalid JSON content: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [review]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Validate JSON
      JSON.parse(editedJson);
      
      const updatedReview = await apiClient.updateReview(review.id, editedJson);
      onSave(updatedReview);
      setIsEditing(false);
      
      // Update parsed content
      setParsedContent(JSON.parse(editedJson));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    try {
      setApproving(true);
      setError(null);
      
      const result = await apiClient.approveReview(review.id);
      
      // Refresh the review data
      const updatedReview = await apiClient.getReview(review.id);
      onSave(updatedReview);
      
      alert(`Approved! ${result.jiraTickets?.length || 0} Jira tickets created.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve review');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    try {
      const reason = prompt('Reason for rejection (optional):');
      const updatedReview = await apiClient.rejectReview(review.id, reason || undefined);
      onSave(updatedReview);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject review');
    }
  };

  const formatJson = (json: string) => {
    try {
      return JSON.stringify(JSON.parse(json), null, 2);
    } catch {
      return json;
    }
  };

  const renderInitiativeView = () => {
    if (!parsedContent) {
      return <div className="text-gray-500">No content to display</div>;
    }

    // Handle both formats: direct initiative and data array
    const initiatives = [];
    
    if (parsedContent.initiative) {
      // Direct initiative format
      initiatives.push({
        initiative: parsedContent.initiative,
        stakeholderContext: parsedContent.stakeholderContext
      });
    } else if (parsedContent.data && Array.isArray(parsedContent.data)) {
      // Legacy data array format
      initiatives.push(...parsedContent.data);
    }
    
    if (initiatives.length === 0) {
      return <div className="text-gray-500">No initiatives found in content</div>;
    }

    return (
      <div className="space-y-6">
        {initiatives.map((item, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Initiative: {item.initiative.summary}
              </h3>
              <p className="text-gray-700 mb-4">{item.initiative.description}</p>
              
              {item.initiative.stakeholders && (
                <div className="mb-4">
                  <span className="font-medium text-gray-700">Stakeholders: </span>
                  {item.initiative.stakeholders.join(', ')}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {item.initiative.epics.map((epic, epicIndex) => (
                <div key={epicIndex} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-blue-900 mb-2">
                    Epic: {epic.summary}
                  </h4>
                  <p className="text-blue-800 mb-4">{epic.description}</p>
                  
                  <div className="space-y-3">
                    {epic.stories.map((story, storyIndex) => (
                      <div key={storyIndex} className="bg-white border border-gray-200 rounded p-3">
                        <h5 className="font-medium text-gray-900 mb-2">Story {storyIndex + 1}</h5>
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">As a:</span> {story.asA}</p>
                          <p><span className="font-medium">I want:</span> {story.iWant}</p>
                          <p><span className="font-medium">So that:</span> {story.soThat}</p>
                          <div>
                            <span className="font-medium">Acceptance Criteria:</span>
                            <ul className="list-disc list-inside ml-2 mt-1">
                              {story.acceptanceCriteria.map((criteria, criteriaIndex) => (
                                <li key={criteriaIndex}>{criteria}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {item.stakeholderContext && (
              <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Stakeholder Context</h4>
                <div className="space-y-2">
                  {Object.entries(item.stakeholderContext).map(([stakeholder, context]) => (
                    <div key={stakeholder}>
                      <span className="font-medium text-gray-700">{stakeholder}:</span>
                      <span className="text-gray-600 ml-2">{context}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-green-800">Total Stories: {parsedContent.totalStories}</span>
              <span className="ml-4 text-green-700">
                Status: {parsedContent.readyForJira ? 'Ready for Jira' : 'Needs Review'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </button>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              review.status === 'approved' ? 'bg-green-100 text-green-800' :
              review.status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center px-3 py-2 rounded text-sm font-medium ${
              isEditing ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isEditing ? <Eye className="w-4 h-4 mr-1" /> : <Code className="w-4 h-4 mr-1" />}
            {isEditing ? 'Preview' : 'Edit JSON'}
          </button>

          {review.status === 'pending' && (
            <>
              <button
                onClick={handleReject}
                className="flex items-center px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </button>
              <button
                onClick={handleApprove}
                disabled={approving}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                {approving ? 'Approving...' : 'Approve & Create Jira'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4">
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Content */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900">Generated Content</h2>
          <p className="text-sm text-gray-500 mt-1">
            Created: {new Date(review.created_at).toLocaleString()} | 
            Source: {review.source === 'webhook' ? 'n8n Pipeline' : 'Manual'} |
            Type: {review.type}
          </p>
        </div>

        <div className="p-6">
          {isEditing ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Edit JSON Content
                </label>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-1" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
              <textarea
                value={editedJson}
                onChange={(e) => setEditedJson(e.target.value)}
                className="w-full h-96 p-3 border border-gray-300 rounded-lg font-mono text-sm"
                placeholder="Enter JSON content..."
              />
              <button
                onClick={() => setEditedJson(formatJson(editedJson))}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Format JSON
              </button>
            </div>
          ) : (
            renderInitiativeView()
          )}
        </div>
      </div>

      {/* Input Content */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Original Input</h3>
        <p className="text-gray-700 text-sm whitespace-pre-wrap">{review.input_content}</p>
      </div>
    </div>
  );
};

export default TicketEditor;