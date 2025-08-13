import { api } from './client';
import type { Submission, SubmissionContent } from '@/lib/types';

export const SubmissionsApi = {
  async list(params?: { questId?: string; userId?: string }): Promise<Submission[]> {
    const { data } = await api.get<Submission[]>('/submissions', { params });
    return data;
  },
  async submit(questId: string, content: SubmissionContent): Promise<Submission> {
    const { data } = await api.post<Submission>(`/quests/${questId}/submissions`, { content });
    return data;
  },
  async review(
    submissionId: string,
    payload: { status: 'approved' | 'rejected' | 'needs-revision'; feedback?: string; points?: number }
  ): Promise<Submission> {
    const { data } = await api.post<Submission>(`/submissions/${submissionId}/review`, payload);
    return data;
  }
};


