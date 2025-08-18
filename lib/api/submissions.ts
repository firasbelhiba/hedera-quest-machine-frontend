import axios from 'axios';
import type { Submission, SubmissionContent } from '@/lib/types';

export const SubmissionsApi = {
  async list(params?: { questId?: string; userId?: string }): Promise<Submission[]> {
    const token = localStorage.getItem('auth_token');
    const { data } = await axios.get('/submissions', { 
      params,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    return data;
  },
  async submit(questId: string, content: SubmissionContent): Promise<Submission> {
    const token = localStorage.getItem('auth_token');
    const { data } = await axios.post(`/quests/${questId}/submissions`, { content }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    return data;
  },
  async review(
    submissionId: string,
    payload: { status: 'approved' | 'rejected' | 'needs-revision'; feedback?: string; points?: number }
  ): Promise<Submission> {
    const token = localStorage.getItem('auth_token');
    const { data } = await axios.post(`/submissions/${submissionId}/review`, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    return data;
  }
};


