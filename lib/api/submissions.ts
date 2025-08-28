import { api } from './client';
import type { Submission, SubmissionContent } from '@/lib/types';

export const SubmissionsApi = {
  async list(params?: { questId?: string; userId?: string }): Promise<Submission[]> {
    const { data } = await api.get('/quest-completions/submissions', { params });
    return data;
  },
  async getQuestCompletions(): Promise<any> {
    const { data } = await api.get('/quest-completions/submissions');
    return data;
  },
  async submit(questId: string, content: SubmissionContent): Promise<Submission> {
    const { data } = await api.post(`/quests/${questId}/submissions`, { content });
    return data;
  },
  async review(
    submissionId: string,
    payload: { status: 'approved' | 'rejected' | 'needs-revision'; feedback?: string; points?: number }
  ): Promise<Submission> {
    // Use the correct endpoint and HTTP method based on the status
    let endpoint: string;
    let response: any;
    
    if (payload.status === 'approved') {
      endpoint = `/quest-completions/completions/${submissionId}/validate`;
      response = await api.put(endpoint, payload);
    } else if (payload.status === 'rejected') {
      endpoint = `/quest-completions/completions/${submissionId}/reject`;
      response = await api.put(endpoint, payload);
    } else {
      // For needs-revision, use the original review endpoint
      endpoint = `/submissions/${submissionId}/review`;
      response = await api.post(endpoint, payload);
    }
    
    return response.data;
  }
};


