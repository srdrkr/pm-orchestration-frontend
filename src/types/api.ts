// API Types for PM Orchestration Frontend

export interface Review {
  id: string;
  source: 'webhook' | 'manual';
  type: 'jira-tickets' | 'prd' | 'message' | 'strategy-doc';
  status: 'pending' | 'approved' | 'rejected' | 'created';
  input_content: string;
  context_used?: string[] | string; // Can be array from API or string from editing
  additional_context?: string;
  generated_json: GeneratedContent | string; // Can be object from API or string from editing
  edited_json?: GeneratedContent | string;
  jira_tickets?: string[] | string;
  output_location?: string;
  created_at: string;
  reviewed_at?: string;
  created_by: string;
  // Additional fields from API response
  preview?: {
    initiative_count: number;
    epic_count: number;
    story_count: number;
    summary?: string;
  };
  has_additional_context?: boolean;
  n8n_execution_id?: string;
  completed_at?: string;
  generation_time_seconds?: number;
  review_time_seconds?: number;
}

export interface Initiative {
  key?: string;
  summary: string;
  description: string;
  stakeholders?: string[];
  epics: Epic[];
}

export interface Epic {
  key?: string;
  summary: string;
  description: string;
  stories: Story[];
}

export interface Story {
  key?: string;
  asA: string;
  iWant: string;
  soThat: string;
  acceptanceCriteria: string[];
}

export interface GeneratedContent {
  initiative?: Initiative;
  stakeholderContext?: Record<string, string>;
  totalStories?: number;
  readyForJira?: boolean;
  // Support both formats - new direct format and legacy data array format
  data?: {
    initiative: Initiative;
    stakeholderContext?: Record<string, string>;
  }[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface HealthCheck {
  status: string;
  database: string;
  timestamp: string;
}

export interface ApprovalResult {
  success: boolean;
  jiraTickets?: string[];
  message?: string;
}