// API Types for PM Orchestration Frontend

export interface Review {
  id: string;
  source: 'webhook' | 'manual';
  type: 'jira-tickets' | 'prd' | 'message' | 'strategy-doc';
  status: 'pending' | 'approved' | 'rejected' | 'created';
  input_content: string;
  context_used?: string;
  additional_context?: string;
  generated_json: string;
  edited_json?: string;
  jira_tickets?: string;
  output_location?: string;
  created_at: string;
  reviewed_at?: string;
  created_by: string;
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
  data: {
    initiative: Initiative;
    stakeholderContext?: Record<string, string>;
  }[];
  totalStories: number;
  readyForJira: boolean;
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